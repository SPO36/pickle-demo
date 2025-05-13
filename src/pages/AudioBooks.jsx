// src/pages/AudioBooks.jsx
import { useEffect, useRef, useState } from 'react';

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

  const parseRssFeed = async (rssUrl) => {
    const res = await fetch(`/.netlify/functions/rss?url=${encodeURIComponent(rssUrl)}`);
    const text = await res.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'application/xml');
    const items = doc.querySelectorAll('item');

    return Array.from(items).map((item) => ({
      title: item.querySelector('title')?.textContent,
      audioUrl: item.querySelector('enclosure')?.getAttribute('url'),
      pubDate: item.querySelector('pubDate')?.textContent,
    }));
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
    } catch (err) {
      console.error('에피소드 스크립트 번역 실패:', err);
    } finally {
      setTranslatingUrl(null);
    }
  };

  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioRef = useRef(null);

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
                  className={`card card-side gap-2 p-2 items-center shadow-sm transition cursor-pointer ${
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
              {translatedSummary ? (
                ''
              ) : (
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
                              const transcript = await transcribeWithElevenLabs(ep.audioUrl);
                              setEpisodeTranscripts((prev) => ({
                                ...prev,
                                [ep.audioUrl]: transcript,
                              }));
                            }}
                          >
                            스크립트 생성
                          </button>
                        </p>
                        <audio controls className="w-full" src={ep.audioUrl} />
                        <p className="text-gray-500 text-sm">{ep.pubDate}</p>
                        {episodeTranscripts[ep.audioUrl] && (
                          <div className="bg-base-200 mt-2 p-2 max-h-32 overflow-y-auto text-gray-700 text-sm whitespace-pre-wrap">
                            {episodeTranscripts[ep.audioUrl]}
                          </div>
                        )}
                        {/* 번역 버튼 */}
                        {episodeTranscripts[ep.audioUrl] && (
                          <>
                            {translatedTranscripts[ep.audioUrl] ? (
                              <div className="mt-2 p-2 max-h-60 overflow-y-auto text-sm whitespace-pre-wrap">
                                {translatedTranscripts[ep.audioUrl]}
                              </div>
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

                        {translatedTranscripts[ep.audioUrl] && (
                          <button
                            className="mt-2 btn btn-xs btn-accent"
                            onClick={async () => {
                              if (isSpeaking) {
                                // 정지
                                if (audioRef.current) {
                                  audioRef.current.pause();
                                  audioRef.current = null;
                                }
                                setIsSpeaking(false);
                                return;
                              }

                              // 읽기 시작
                              try {
                                setIsSpeaking(true);
                                const MAX_TTS_LENGTH = 3500;
                                const fullText = translatedTranscripts[ep.audioUrl];
                                const chunks = fullText.match(/(.|\n|\r){1,3500}/g) || [];

                                for (let i = 0; i < chunks.length; i++) {
                                  if (!isSpeaking) break;

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
                                    throw new Error(`TTS 응답 JSON 파싱 실패: ${raw}`);
                                  }

                                  const { audioUrl, error } = data;
                                  if (!audioUrl)
                                    throw new Error(
                                      `TTS 응답에 audioUrl 없음. 에러 메시지: ${error || '없음'}`
                                    );

                                  const audio = new Audio(audioUrl);
                                  audioRef.current = audio;

                                  await new Promise((resolve) => {
                                    audio.onended = resolve;
                                    audio.onerror = resolve;
                                    audio.play();
                                  });
                                }
                              } catch (err) {
                                console.error('읽기 실패:', err);
                              } finally {
                                setIsSpeaking(false);
                              }
                            }}
                          >
                            {isSpeaking ? '⏹ 정지' : '🔊 읽어주기'}
                          </button>
                        )}
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
          <div className="flex flex-col items-center py-12 alert">
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
