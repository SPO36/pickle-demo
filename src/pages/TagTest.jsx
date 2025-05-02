// src/pages/TagTest.jsx
import { ChevronDown, Heart } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

async function handleChunkUpload(file) {
  const CHUNK_SIZE = 24 * 1024 * 1024; // 24MB
  const totalSize = file.size;
  let offset = 0;
  let combinedText = '';

  while (offset < totalSize) {
    const chunk = file.slice(offset, offset + CHUNK_SIZE);
    const form = new FormData();
    form.append('file', chunk, 'chunk.mp3');
    form.append('model', 'whisper-1');

    const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
      },
      body: form,
    });

    const data = await res.json();
    console.log('🔤 chunk result:', data);

    combinedText += (data.text || '') + '\n';
    offset += CHUNK_SIZE;
  }

  alert('✅ 변환 완료! 콘솔을 확인하세요.');
  console.log('🎉 전체 텍스트:', combinedText);
}

export default function TagTest() {
  const [episodes, setEpisodes] = useState([]);
  const [sort, setSort] = useState('popular');
  const [filter, setFilter] = useState('');
  const [selectedEpisode, setSelectedEpisode] = useState(null);
  const [keywords, setKeywords] = useState([]);
  const [summary, setSummary] = useState('');

  useEffect(() => {
    fetchEpisodes();
  }, []);

  const fetchEpisodes = async () => {
    const { data, error } = await supabase.from('episodes').select('*');
    if (!error) setEpisodes(data || []);
  };

  const sortedFiltered = episodes
    .filter((ep) => ep.title.toLowerCase().includes(filter.toLowerCase()))
    .sort((a, b) => {
      if (sort === 'latest') return new Date(b.created_at) - new Date(a.created_at);
      if (sort === 'popular') return (b.likes || 0) - (a.likes || 0);
      if (sort === 'az') {
        return (a.title || '').localeCompare(b.title || '', 'ko-KR-u-kf-upper', {
          sensitivity: 'base',
          ignorePunctuation: true,
        });
      }
      return 0;
    });

  const handleTranscribe = async (episode) => {
    const res = await fetch('/.netlify/functions/transcribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ audioUrl: episode.audioFile }),
    });

    const result = await res.json();
    console.log('🧾 Whisper 응답:', result);

    if (res.ok && result.transcript) {
      const transcript = result.transcript;

      const { error } = await supabase
        .from('episodes')
        .update({ script: transcript })
        .eq('id', episode.id);

      if (error) {
        console.error('❌ Supabase 저장 실패:', error.message);
        alert('DB 저장 실패');
        return;
      }

      setSelectedEpisode((prev) => ({ ...prev, script: transcript }));
      alert('✅ 스크립트 생성 및 저장 완료!');
      console.log('📢 트랜스크립트 결과:', transcript);
    } else {
      console.error('❌ Whisper 응답 실패 또는 transcript 없음:', result);
      alert('❌ Whisper 응답 실패');
    }
  };

  const extractKeywords = async (text) => {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `당신은 콘텐츠 추천을 위한 태그 생성 전문가입니다.

스크립트 내용을 분석하여 다음 기준을 바탕으로 추천 태그를 추출해 주세요:
- 콘텐츠의 장르와 주제
- 주요 키워드 및 핵심 개념
- 콘텐츠가 속할 수 있는 카테고리
- 어떤 사람들이 관심을 가질지 (타겟 청중)
- 취향, 성향, 라이프스타일 등 연관된 키워드
- 도서 검색 시 자주 사용되는 키워드(예: 고전, 역사, 심리, 철학 등)

요구사항:
- 각 태그는 **한 단어**의 명사나 형용사로 간결하게 작성하세요.
- 의미가 중복되거나 중요하지 않은 내용은 포함하지 마세요.
- 반드시 필요한 핵심 키워드만 **최소 5개, 최대 20개** 추출하세요.
- 태그들은 **쉼표로 구분된 문자열**로 출력하세요 (리스트 형태 금지).

예시 출력: 힐링,여행,자연,감성,대화,산책,감동,풍경,에세이,카페

`,
          },
          {
            role: 'user',
            content: text,
          },
        ],
        temperature: 0.7,
      }),
    });

    const data = await res.json();
    const raw = data.choices?.[0]?.message?.content || '';
    return raw.split(',').map((tag) => tag.trim().replace(/^#/, ''));
  };

  const handleKeywordExtract = async () => {
    if (!selectedEpisode?.script) {
      alert('먼저 스크립트를 생성해주세요');
      return;
    }

    const tags = await extractKeywords(selectedEpisode.script);

    // Supabase에 저장
    const { error } = await supabase
      .from('episodes')
      .update({ tags }) // tags는 배열
      .eq('id', selectedEpisode.id);

    if (error) {
      console.error('❌ 태그 저장 실패:', error.message);
      alert('DB 저장 실패');
      return;
    }

    setSelectedEpisode((prev) => ({ ...prev, tags }));
    setKeywords(tags); // UI에 표시
    alert('✅ 키워드 추출 및 저장 완료!');
  };

  const handleSummary = async () => {
    if (!selectedEpisode?.script) {
      alert('먼저 스크립트를 생성해주세요');
      return;
    }

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content:
              '당신은 팟캐스트 콘텐츠 요약문 작성 전문가입니다. 스크립트 내용을 바탕으로 자연스러운 소개 문장을 작성해 주세요. 요구사항: 서비스 사용자가 이 콘텐츠를 듣고 싶게끔 작성해주세요. 1~2문장 이내로 간결하게 구성하세요. 과장된 수식어(예: 감동적인, 매혹적인 등)는 피하고, 콘텐츠의 성격에 맞는 표현을 사용하세요. 이 콘텐츠가 오디오 기반임을 굳이 언급하지 마세요.',
          },
          {
            role: 'user',
            content: selectedEpisode.script,
          },
        ],
      }),
    });

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content?.trim();

    if (content) {
      const { error } = await supabase
        .from('episodes')
        .update({ summary: content })
        .eq('id', selectedEpisode.id);

      if (error) {
        console.error('❌ 요약 저장 실패:', error.message);
        alert('요약 저장 실패');
        return;
      }

      setSummary(content);
      setSelectedEpisode((prev) => ({ ...prev, summary: content }));
      alert('✅ 요약 생성 및 저장 완료!');
    }
  };

  return (
    <div className="flex h-screen">
      {/* 왼쪽: 에피소드 목록 */}
      <div className="p-4 border-r border-base-300 w-1/2 overflow-y-auto">
        {/* 검색 및 정렬 */}
        <div className="flex justify-between items-center mb-4">
          <input
            type="text"
            placeholder="제목 검색"
            className="input-bordered w-1/2 input"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />

          <div className="dropdown">
            <div
              tabIndex={0}
              role="button"
              className="flex items-center gap-2 bg-base-100 px-4 py-2 border-base-300 text-sm btn"
            >
              {sort === 'latest' && '최신순'}
              {sort === 'popular' && '인기순'}
              {sort === 'az' && '가나다순'}
              <ChevronDown size={18} />
            </div>
            <ul
              tabIndex={0}
              className="z-10 bg-base-100 shadow-sm p-2 rounded-box w-40 dropdown-content menu"
            >
              <li>
                <a onClick={() => setSort('latest')}>최신순</a>
              </li>
              <li>
                <a onClick={() => setSort('popular')}>인기순</a>
              </li>
              <li>
                <a onClick={() => setSort('az')}>가나다순</a>
              </li>
            </ul>
          </div>
        </div>

        {/* 에피소드 목록 */}
        <ul>
          {sortedFiltered.map((ep) => (
            <li
              key={ep.id}
              className="flex justify-between items-center gap-4 hover:bg-base-300 shadow px-4 py-3 transition cursor-pointer"
              onClick={() => {
                setSelectedEpisode(ep);
                setKeywords(ep.tags || []);
                setSummary(ep.summary || '');
              }}
            >
              <div className="flex items-center gap-4">
                <img
                  src={ep.src}
                  alt={ep.title}
                  className="rounded-md w-28 object-cover aspect-[16/9]"
                />
                <div>
                  <div className="font-semibold break-words leading-tight">{ep.title}</div>
                  <div className="text-gray-500 text-sm">{ep.creator}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                {ep.likes ?? 0}
                <Heart size={16} />
              </div>
            </li>
          ))}
        </ul>

        {/* 테스트 업로드용 UI */}
        <div className="mt-6 pt-4 border-t">
          <h3 className="mb-2 font-bold">🎧 Whisper 테스트 업로드</h3>
          <input
            type="file"
            accept="audio/mp3"
            className="file-input-bordered w-full file-input"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleChunkUpload(file);
            }}
          />
        </div>
      </div>

      {/* 오른쪽: 상세 보기 */}
      <div className="p-6 w-1/2 overflow-y-auto">
        {selectedEpisode ? (
          <div className="space-y-4">
            <img
              src={selectedEpisode.src}
              alt={selectedEpisode.title}
              className="rounded-lg w-full object-cover aspect-[16/9]"
            />
            <h2 className="font-bold text-2xl">{selectedEpisode.title}</h2>
            <div className="flex flex-row gap-4">
              <p className="text-gray-500 text-sm">
                By {selectedEpisode.creator || '제작자 정보 없음'}
              </p>
              <div className="flex items-center gap-1 text-gray-500 text-sm">
                <Heart size={16} />
                {selectedEpisode.likes ?? 0}
              </div>
            </div>
            <p className="text-sm text-base-content whitespace-pre-line">
              {selectedEpisode.audioFile || '파일 없음'}
            </p>
            {selectedEpisode.audioFile && (
              <audio key={selectedEpisode.id} controls className="w-full">
                <source src={selectedEpisode.audioFile} type="audio/mpeg" />
                브라우저가 오디오를 지원하지 않습니다.
              </audio>
            )}
            {selectedEpisode.audioFile && (
              <button
                className="w-full btn btn-primary"
                onClick={() => handleTranscribe(selectedEpisode)}
              >
                🎙️ 스크립트 생성
              </button>
            )}
            {selectedEpisode.script && (
              <div className="bg-base-200 p-4 rounded-lg h-60 overflow-y-auto text-sm whitespace-pre-wrap">
                {selectedEpisode.script}
              </div>
            )}

            {selectedEpisode.script && (
              <>
                <button className="w-full btn btn-primary" onClick={handleSummary}>
                  📌 스크립트 요약
                </button>
                {summary && (
                  <div className="bg-base-200 p-4 rounded-lg overflow-y-auto text-sm whitespace-pre-wrap">
                    {summary}
                  </div>
                )}
              </>
            )}

            {selectedEpisode.script && (
              <button className="w-full btn btn-primary" onClick={handleKeywordExtract}>
                🍪 키워드 추출
              </button>
            )}
            {keywords.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {keywords.map((tag, i) => (
                  <div key={i} className="badge badge-soft badge-primary">
                    {tag}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="flex justify-center items-center h-full text-gray-400">
            👉 에피소드를 선택하세요
          </div>
        )}
      </div>
    </div>
  );
}
