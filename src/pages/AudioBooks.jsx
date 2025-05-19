// src/pages/AudioBooks.jsx
import { useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function AudioBooks() {
  const [books, setBooks] = useState([]);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const listRef = useRef();
  const [episodes, setEpisodes] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [translatedSummary, setTranslatedSummary] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);

  const parseXML = (xmlString) => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
    const bookElements = xmlDoc.querySelectorAll('book');

    return Array.from(bookElements).map((book) => ({
      id: [book.querySelector('id')?.textContent || ''],
      title: [book.querySelector('title')?.textContent || ''],
      description: [book.querySelector('description')?.innerHTML || ''],
      url_text_source: [book.querySelector('url_text_source')?.textContent || ''],
      language: [book.querySelector('language')?.textContent || ''],
      copyright_year: [book.querySelector('copyright_year')?.textContent || ''],
      num_sections: [book.querySelector('num_sections')?.textContent || ''],
      url_rss: [book.querySelector('url_rss')?.textContent || ''],
      url_zip_file: [book.querySelector('url_zip_file')?.textContent || ''],
      url_project: [book.querySelector('url_project')?.textContent || ''],
      url_librivox: [book.querySelector('url_librivox')?.textContent || ''],
      totaltime: [book.querySelector('totaltime')?.textContent || ''],
      authors: [
        {
          name: [
            `${book.querySelector('authors author first_name')?.textContent || ''} ${
              book.querySelector('authors author last_name')?.textContent || ''
            }`.trim(),
          ],
        },
      ],
    }));
  };

  const fetchBooks = async (search = '', append = false, offsetVal = 0) => {
    setLoading(true);
    let text = '';

    try {
      const url = `/.netlify/functions/librivox?title=${encodeURIComponent(
        search
      )}&offset=${offsetVal}`;
      const res = await fetch(url);
      text = await res.text();

      if ((!text.includes('<feed') && !text.includes('<books')) || text.includes('<e>')) {
        console.warn('❗ 유효하지 않은 XML 응답');
        setBooks(append ? books : []);
        setHasMore(false);
        return;
      }

      const parsedBooks = parseXML(text);
      setBooks((prev) => (append ? [...prev, ...parsedBooks] : parsedBooks));
      setHasMore(parsedBooks.length >= 50);
    } catch (e) {
      console.error('LibriVox API 오류:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (!loading && hasMore && scrollTop + clientHeight >= scrollHeight - 100) {
      const newOffset = offset + 50;
      setOffset(newOffset);
      fetchBooks(query, true, newOffset);
    }
  };

  const handleSearch = () => {
    setOffset(0);
    setHasMore(true);
    fetchBooks(query, false, 0);
  };

  const stripHtml = (html) => {
    const unescaped = new DOMParser().parseFromString(html, 'text/html').documentElement
      .textContent;
    const doc = new DOMParser().parseFromString(unescaped, 'text/html');
    return doc.body.textContent || '';
  };

  const rssCache = {};
  const parseRssFeed = async (rssUrl) => {
    if (rssCache[rssUrl]) return rssCache[rssUrl];

    const res = await fetch(`/.netlify/functions/rss?url=${encodeURIComponent(rssUrl)}`);
    const text = await res.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'application/xml');
    const items = doc.querySelectorAll('item');

    const parsed = Array.from(items).map((item) => ({
      title: item.querySelector('title')?.textContent,
      audioUrl: item.querySelector('enclosure')?.getAttribute('url'),
      pubDate: item.querySelector('pubDate')?.textContent,
    }));

    rssCache[rssUrl] = parsed; // 저장
    return parsed;
  };

  const translateSummary = async () => {
    if (!selected) return;
    setIsTranslating(true);
    const summary = stripHtml(selected.summary?.[0] || selected.description?.[0] || '');
    try {
      const res = await fetch('/.netlify/functions/translate', {
        method: 'POST',
        body: JSON.stringify({ text: summary }),
      });
      const data = await res.json();
      setTranslatedSummary(data.result);

      // 📌 Supabase 저장
      await saveSummaryToDB({ book: selected, translated: data.result });
    } catch (err) {
      console.error('번역 실패:', err);
    } finally {
      setIsTranslating(false);
    }
  };

  useEffect(() => {
    fetchBooks('', false, 0);
  }, []);

  useEffect(() => {
    if (selected?.url_rss?.[0]) {
      parseRssFeed(selected.url_rss[0]).then(setEpisodes);
      setCurrentPage(1);
    }
    setTranslatedSummary(''); // 새로운 책 선택 시 번역 리셋
  }, [selected]);

  const archiveId = selected?.url_zip_file?.[0]?.split('/')[4];
  const coverUrl = archiveId ? `https://archive.org/services/img/${archiveId}` : null;
  const totalPages = Math.ceil(episodes.length / itemsPerPage);
  const getPagination = () => {
    const range = [];
    const delta = 1;
    const left = currentPage - delta;
    const right = currentPage + delta;

    let l;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= left && i <= right)) {
        range.push(i);
      }
    }

    const result = [];
    for (let i of range) {
      if (l) {
        if (i - l === 2) {
          result.push(l + 1);
        } else if (i - l > 2) {
          result.push('...');
        }
      }
      result.push(i);
      l = i;
    }

    return result;
  };

  const [episodeTranscripts, setEpisodeTranscripts] = useState({});

  const transcribeWithElevenLabs = async (audioUrl) => {
    const res = await fetch('/.netlify/functions/elevenlabs-transcribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ audioUrl }),
    });
    const data = await res.json();
    return data.text;
  };

  const [translatedTranscripts, setTranslatedTranscripts] = useState({});
  const [translatingUrl, setTranslatingUrl] = useState(null);

  const translateTranscript = async (audioUrl, text) => {
    try {
      setTranslatingUrl(audioUrl);
      const res = await fetch('/.netlify/functions/translate', {
        method: 'POST',
        body: JSON.stringify({ text }),
      });
      const data = await res.json();

      setTranslatedTranscripts((prev) => ({
        ...prev,
        [audioUrl]: data.result,
      }));

      // ✅ 번역 후 Supabase 업데이트
      const ep = episodes.find((e) => e.audioUrl === audioUrl);
      if (ep) {
        await saveTranscriptToDB({
          book: selected,
          ep,
          transcript: episodeTranscripts[audioUrl],
          translated: data.result,
        });
      }
    } catch (err) {
      console.error('에피소드 스크립트 번역 실패:', err);
    } finally {
      setTranslatingUrl(null);
    }
  };

  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioRef = useRef(null);

  const getTranscriptFromDB = async (audioUrl) => {
    const { data, error } = await supabase
      .from('audiobook_transcripts')
      .select('transcript, translated_transcript, tts_url') // ← 여기에 추가
      .eq('audio_url', audioUrl)
      .maybeSingle();

    if (error) {
      console.warn('DB 조회 실패:', error);
      return null;
    }

    return data;
  };

  const saveTranscriptToDB = async ({ book, ep, transcript, translated, ttsUrl }) => {
    const { error } = await supabase.from('audiobook_transcripts').upsert(
      {
        book_id: book.id?.[0],
        book_title: book.title?.[0],
        episode_title: ep.title,
        audio_url: ep.audioUrl,
        transcript,
        translated_transcript: translated || null,
        tts_url: ttsUrl || null, // 👈 여기에 추가
      },
      {
        onConflict: 'audio_url',
      }
    );

    if (error) {
      console.error('DB 저장 실패:', error);
    }
  };

  const [currentChunkIndex, setCurrentChunkIndex] = useState(null);

  const saveSummaryToDB = async ({ book, translated }) => {
    const { error } = await supabase.from('audiobook_transcripts').upsert(
      {
        book_id: book.id?.[0],
        book_title: book.title?.[0],
        summary: stripHtml(book.summary?.[0] || book.description?.[0] || ''),
        translated_summary: translated,
      },
      {
        onConflict: 'book_id', // book_id 기준으로 덮어쓰기
      }
    );

    if (error) {
      console.error('줄거리 저장 실패:', error);
    }
  };

  const getSummaryFromDB = async (bookId) => {
    const { data, error } = await supabase
      .from('audiobook_transcripts')
      .select('translated_summary')
      .eq('book_id', bookId)
      .maybeSingle();

    if (error) {
      console.warn('줄거리 DB 조회 실패:', error);
      return null;
    }

    return data?.translated_summary || null;
  };

  useEffect(() => {
    setEpisodes([]);
    setTranslatedSummary('');
    setCurrentPage(1);
    setEpisodeTranscripts({});
    setTranslatedTranscripts({});
    setTtsUrls({});

    const loadEpisodeTranscripts = async () => {
      if (!selected?.url_rss?.[0]) return;

      const parsed = await parseRssFeed(selected.url_rss[0]);
      setEpisodes(parsed);

      for (const ep of parsed) {
        const existing = await getTranscriptFromDB(ep.audioUrl);
        if (existing) {
          setEpisodeTranscripts((prev) => ({
            ...prev,
            [ep.audioUrl]: existing.transcript,
          }));
          if (existing.translated_transcript) {
            setTranslatedTranscripts((prev) => ({
              ...prev,
              [ep.audioUrl]: existing.translated_transcript,
            }));
          }
          if (existing.tts_url) {
            setTtsUrls((prev) => ({
              ...prev,
              [ep.audioUrl]: existing.tts_url,
            }));
          }
        }
      }
    };

    if (selected?.id?.[0]) {
      getSummaryFromDB(selected.id[0]).then((summary) => {
        if (summary) setTranslatedSummary(summary);
      });
    }

    loadEpisodeTranscripts();
  }, [selected]);

  const speakingRef = useRef(false);
  const chunkRefs = useRef({});

  const uploadAudioToSupabase = async (blob, filename) => {
    const path = `readings/${filename}.mp3`; // 원하는 경로/이름
    const { data, error } = await supabase.storage
      .from('tts-audio') // ← 너가 만든 bucket 이름
      .upload(path, blob, {
        contentType: 'audio/mpeg',
        upsert: true, // 중복 시 덮어쓰기
      });

    if (error) {
      console.error('🛑 Supabase 업로드 실패:', error);
      return null;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from('tts-audio').getPublicUrl(path);

    return publicUrl; // 저장된 mp3의 공개 URL
  };

  const [ttsUrls, setTtsUrls] = useState({});

  return (
    <div className="flex h-screen">
      {/* 왼쪽: 책 리스트 */}
      <div className="p-4 w-1/2 overflow-y-auto" onScroll={handleScroll} ref={listRef}>
        {/* <div className="mb-4 form-control">
          <div className="w-full join">
            <input
              type="text"
              className="input-bordered w-full input join-item"
              placeholder="책 제목 입력"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button className="btn btn-primary join-item" onClick={handleSearch}>
              검색
            </button>
          </div>
        </div> */}
        {!loading && books.length === 0 && (
          <div className="text-sm text-base-content/50 text-center">검색 결과가 없습니다</div>
        )}
        {loading && books.length === 0 ? (
          <div className="flex justify-center my-4">
            <span className="text-primary loading loading-spinner"></span>
          </div>
        ) : (
          <ul className="gap-1 grid grid-cols-1">
            {books.map((book, idx) => {
              const archiveId = book.url_zip_file?.[0]?.split('/')[4];
              const coverUrl = archiveId ? `https://archive.org/services/img/${archiveId}` : null;

              return (
                <li
                  key={book.id?.[0] || idx}
                  className={`card card-side gap-2 p-2 items-center transition cursor-pointer ${
                    selected && book.id?.[0] === selected.id?.[0] ? 'bg-base-200' : ''
                  }`}
                  onClick={() => setSelected(book)}
                >
                  <figure className="flex-shrink-0 bg-base-300 rounded w-16 h-16 overflow-hidden">
                    {coverUrl ? (
                      <img src={coverUrl} alt="책 커버" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex justify-center items-center w-full h-full text-gray-500 text-xs">
                        No Image
                      </div>
                    )}
                  </figure>
                  <div className="flex flex-col p-2">
                    <h3 className="font-semibold text-md line-clamp-2">{book.title?.[0]}</h3>
                    <p className="text-gray-500">{book.authors?.[0]?.name?.[0] || '작자 미상'}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        {loading && books.length > 0 && (
          <div className="flex justify-center mt-4">
            <span className="text-primary loading loading-spinner"></span>
          </div>
        )}
      </div>

      {/* 오른쪽: 상세 보기 - daisyUI로 스타일링 */}
      <div className="bg-base-100 p-4 w-1/2 overflow-y-auto">
        {selected ? (
          <div className="bg-base-200 rounded-lg">
            <div className="p-4 card-body">
              <h2 className="text-2xl card-title">{selected.title?.[0]}</h2>
              <div className="flex flex-row gap-1">
                <div className="rounded-md badge-outline badge-md badge badge-primary">
                  {selected.authors?.[0]?.name?.[0] || '작자 미상'}
                </div>
                <div className="rounded-md badge-outline badge-md badge badge-primary">
                  {selected.language[0]}
                </div>
              </div>
              <div className="divider"></div>
              <div className="text-gray-600 text-sm">
                {stripHtml(selected.summary?.[0] || selected.description?.[0] || '요약 정보 없음')}
                {translatedSummary && (
                  <p className="mt-2 text-primary-content text-sm whitespace-pre-wrap">
                    {translatedSummary}
                  </p>
                )}
              </div>
              {translatedSummary ? null : (
                <button
                  className="mt-3 w-fit btn btn-xs btn-primary"
                  onClick={translateSummary}
                  disabled={isTranslating}
                >
                  {isTranslating ? '번역 중...' : '번역하기'}
                </button>
              )}
              {selected.url_rss?.[0] && (
                <>
                  <div className="divider"></div>
                  <div className="mb-4">
                    {selected.totaltime?.[0] && (
                      <p>
                        <span className="font-bold">총 재생 시간:</span> {selected.totaltime[0]}
                      </p>
                    )}
                    <div>
                      <span className="font-bold">RSS:</span>{' '}
                      <a href={selected.url_rss[0]} className="link link-info" target="_blank">
                        {selected.url_rss[0]}
                      </a>
                    </div>
                  </div>
                  {episodes
                    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                    .map((ep, idx) => (
                      <div key={idx} className="py-3">
                        <p className="flex justify-between items-center gap-2 mb-2 font-semibold">
                          {ep.title}
                          <button
                            className="btn btn-xs btn-secondary"
                            onClick={async () => {
                              // 1. Supabase 먼저 조회
                              const existing = await getTranscriptFromDB(ep.audioUrl);
                              if (existing) {
                                setEpisodeTranscripts((prev) => ({
                                  ...prev,
                                  [ep.audioUrl]: existing.transcript,
                                }));
                                if (existing.translated_transcript) {
                                  setTranslatedTranscripts((prev) => ({
                                    ...prev,
                                    [ep.audioUrl]: existing.translated_transcript,
                                  }));
                                }
                                if (existing.tts_url) {
                                  setTtsUrls((prev) => ({
                                    ...prev,
                                    [ep.audioUrl]: existing.tts_url,
                                  }));
                                }
                              }

                              // 2. 없다면 생성
                              const transcript = await transcribeWithElevenLabs(ep.audioUrl);
                              setEpisodeTranscripts((prev) => ({
                                ...prev,
                                [ep.audioUrl]: transcript,
                              }));

                              // 3. Supabase 저장
                              await saveTranscriptToDB({
                                book: selected,
                                ep,
                                transcript: episodeTranscripts[ep.audioUrl],
                                translated: fullText,
                              });
                            }}
                          >
                            스크립트 불러오기
                          </button>
                        </p>
                        <audio controls className="w-full" src={ep.audioUrl} />
                        <p className="text-gray-500 text-sm">{ep.pubDate}</p>
                        {/* {episodeTranscripts[ep.audioUrl] && (
                          <div className="bg-base-200 mt-2 p-2 max-h-32 overflow-y-auto text-gray-700 text-sm whitespace-pre-wrap">
                            {translatedTranscripts[ep.audioUrl]
                              ?.match(/(.|\n|\r){1,500}/g)
                              ?.map((chunk, idx) => (
                                <p
                                  key={idx}
                                  className={`transition duration-300 ${
                                    idx === currentChunkIndex
                                      ? 'bg-yellow-200 font-bold'
                                      : 'opacity-60'
                                  }`}
                                >
                                  {chunk}
                                </p>
                              ))}
                          </div>
                        )} */}
                        {/* 번역 버튼 */}
                        {episodeTranscripts[ep.audioUrl] && (
                          <>
                            {translatedTranscripts[ep.audioUrl] ? (
                              <>
                                <div className="mt-2 p-2 max-h-40 overflow-y-auto text-gray-600 text-sm whitespace-pre-wrap">
                                  {episodeTranscripts[ep.audioUrl]}
                                </div>
                                <div className="mt-2 p-2 max-h-40 overflow-y-auto text-sm whitespace-pre-wrap">
                                  {translatedTranscripts[ep.audioUrl]}
                                </div>
                              </>
                            ) : (
                              <button
                                className="mt-2 btn btn-xs btn-accent"
                                onClick={() =>
                                  translateTranscript(ep.audioUrl, episodeTranscripts[ep.audioUrl])
                                }
                                disabled={translatingUrl === ep.audioUrl}
                              >
                                {translatingUrl === ep.audioUrl ? '번역 중...' : '📘 번역하기'}
                              </button>
                            )}
                          </>
                        )}

                        {translatedTranscripts[ep.audioUrl] &&
                          (ttsUrls[ep.audioUrl] ? (
                            <audio
                              key={ttsUrls[ep.audioUrl]}
                              controls
                              className="mt-2 w-full"
                              src={ttsUrls[ep.audioUrl]}
                            />
                          ) : (
                            // ✅ 없으면 기존의 '읽어주기' 버튼 전체 유지
                            <button
                              className="mt-2 btn btn-xs btn-accent"
                              onClick={async () => {
                                // 👇 여기에 네가 붙여준 그 긴 onClick 코드 전체 유지
                                if (isSpeaking) {
                                  if (audioRef.current) {
                                    audioRef.current.pause();
                                    audioRef.current = null;
                                  }
                                  setIsSpeaking(false);
                                  speakingRef.current = false;
                                  return;
                                }

                                try {
                                  const dbData = await getTranscriptFromDB(ep.audioUrl);
                                  const fullText = translatedTranscripts[ep.audioUrl];
                                  if (!fullText || typeof fullText !== 'string') {
                                    console.error('읽을 텍스트 없음');
                                    return;
                                  }

                                  if (ttsUrls[ep.audioUrl]) {
                                    const audio = new Audio(ttsUrls[ep.audioUrl]);
                                    audioRef.current = audio;
                                    audio.volume = 1.0;
                                    audio.muted = false;

                                    await new Promise((resolve) => {
                                      audio.onended = resolve;
                                      audio.onerror = (e) => {
                                        console.error('오디오 재생 오류:', e);
                                        resolve();
                                      };
                                      audio.play().catch((err) => {
                                        console.error('재생 실패:', err);
                                        resolve();
                                      });
                                    });
                                    return;
                                  }

                                  console.log('🎙 TTS 생성 시작');
                                  setIsSpeaking(true);
                                  speakingRef.current = true;

                                  const chunks = fullText.match(/(.|\n|\r){1,500}/g) || [];
                                  let allBlobs = [];

                                  for (let i = 0; i < chunks.length; i++) {
                                    if (!speakingRef.current) break;

                                    setCurrentChunkIndex(i);
                                    const res = await fetch('/.netlify/functions/tts', {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ text: chunks[i] }),
                                    });

                                    const raw = await res.text();
                                    let data;
                                    try {
                                      data = JSON.parse(raw);
                                    } catch (e) {
                                      console.error('JSON 파싱 실패:', raw);
                                      break;
                                    }

                                    const base64 = data.audioUrl?.split(',')[1];
                                    if (!base64) {
                                      console.error('TTS 응답 오류:', data?.error);
                                      break;
                                    }

                                    const binary = atob(base64);
                                    const bytes = new Uint8Array(binary.length);
                                    for (let j = 0; j < binary.length; j++) {
                                      bytes[j] = binary.charCodeAt(j);
                                    }

                                    const blob = new Blob([bytes], { type: 'audio/mpeg' });
                                    allBlobs.push(blob);
                                  }

                                  const mergedBlob = new Blob(allBlobs, { type: 'audio/mpeg' });
                                  const fileName = `${ep.audioUrl.split('/').pop().split('.')[0]}`;
                                  const supaUrl = await uploadAudioToSupabase(mergedBlob, fileName);

                                  await saveTranscriptToDB({
                                    book: selected,
                                    ep,
                                    transcript: episodeTranscripts[ep.audioUrl],
                                    translated: fullText,
                                    ttsUrl: supaUrl,
                                  });

                                  const audio = new Audio(supaUrl);
                                  audioRef.current = audio;
                                  audio.volume = 1.0;
                                  audio.muted = false;

                                  await new Promise((resolve) => {
                                    audio.onended = resolve;
                                    audio.onerror = (e) => {
                                      console.error('오디오 재생 오류:', e);
                                      resolve();
                                    };
                                    audio.play().catch((err) => {
                                      console.error('재생 실패:', err);
                                      resolve();
                                    });
                                  });
                                } catch (err) {
                                  console.error('❌ 읽기 실패:', err);
                                } finally {
                                  setIsSpeaking(false);
                                  speakingRef.current = false;
                                  setCurrentChunkIndex(null);
                                }
                              }}
                            >
                              {isSpeaking ? '⏹ 정지' : '🔊 읽어주기'}
                            </button>
                          ))}
                      </div>
                    ))}
                  <div className="flex justify-center items-center gap-2 mt-6">
                    <button
                      className="btn btn-sm join-item"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => p - 1)}
                    >
                      ◀︎ 이전
                    </button>

                    <div className="join">
                      {getPagination().map((page, idx) =>
                        page === '...' ? (
                          <button key={idx} className="join-item btn btn-sm btn-disabled">
                            ...
                          </button>
                        ) : (
                          <button
                            key={idx}
                            className={`join-item btn btn-sm ${
                              currentPage === page ? 'btn-primary' : ''
                            }`}
                            onClick={() => setCurrentPage(page)}
                          >
                            {page}
                          </button>
                        )
                      )}
                    </div>

                    <button
                      className="btn btn-sm join-item"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((p) => p + 1)}
                    >
                      다음 ▶︎
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center bg-base-200 py-12 rounded-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="flex-shrink-0 stroke-info mb-4 w-12 h-12"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <span className="text-lg">왼쪽에서 책을 선택하세요</span>
            <span className="mt-2 text-gray-500 text-sm">
              책을 선택하면 여기에 상세 정보가 표시됩니다
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
