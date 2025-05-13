// src/pages/TagTest.jsx
import { ChevronDown, Heart, Pencil } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import Modal from '../components/Modal';
import { supabase } from '../lib/supabase';

// 파일 URL에서 파일 객체 가져오기 함수
async function getFileFromUrl(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Network response was not ok');
    const blob = await response.blob();
    return new File([blob], 'audio.mp3', { type: 'audio/mpeg' });
  } catch (error) {
    console.error('파일 다운로드 오류:', error);
    throw error;
  }
}

// 청크 단위로 파일 처리하는 함수
async function processFileInChunks(file) {
  const CHUNK_SIZE = 24 * 1024 * 1024; // 24MB (Whisper API 제한보다 안전한 사이즈)
  const totalSize = file.size;
  let offset = 0;
  let combinedText = '';
  let chunkNumber = 1;
  const totalChunks = Math.ceil(totalSize / CHUNK_SIZE);

  console.log(`🔄 처리 시작: 총 ${totalChunks}개 청크로 분할하여 처리합니다.`);

  while (offset < totalSize) {
    console.log(
      `📦 청크 ${chunkNumber}/${totalChunks} 처리 중... (${((offset / totalSize) * 100).toFixed(
        1
      )}%)`
    );

    const chunk = file.slice(offset, offset + CHUNK_SIZE);
    const form = new FormData();
    form.append('file', chunk, 'chunk.mp3');
    form.append('model', 'whisper-1');

    try {
      const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
        },
        body: form,
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error(`❌ 청크 ${chunkNumber} 처리 실패:`, errorData);
        throw new Error(`Whisper API 오류: ${errorData.error?.message || '알 수 없는 오류'}`);
      }

      const data = await res.json();
      console.log(`✅ 청크 ${chunkNumber}/${totalChunks} 완료`);

      combinedText += (data.text || '') + '\n';
    } catch (error) {
      console.error(`❌ 청크 ${chunkNumber} 처리 중 오류:`, error);
      alert(`청크 ${chunkNumber} 처리 중 오류가 발생했습니다: ${error.message}`);
      // 에러가 있어도 다음 청크 처리 진행
    }

    offset += CHUNK_SIZE;
    chunkNumber++;
  }

  console.log('🎉 모든 청크 처리 완료!');
  return combinedText.trim();
}

export default function TagTest() {
  const [episodes, setEpisodes] = useState([]);
  const [sort, setSort] = useState('popular');
  const [filter, setFilter] = useState('');
  const [selectedEpisode, setSelectedEpisode] = useState(null);
  const [keywordsWhisper, setKeywordsWhisper] = useState([]);
  const [keywordsEleven, setKeywordsEleven] = useState([]);
  const [summary, setSummary] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState('');
  const fileInputRef = useRef(null);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [editableSummary, setEditableSummary] = useState('');
  const detailRef = useRef(null);
  const [summaryPrompt, setSummaryPrompt] =
    useState(`당신은 스토리텔링에 능한 팟캐스트 에피소드 요약 작가입니다.

    스크립트 내용을 분석하여 책 줄거리처럼, 하나의 이야기를 전하듯 자연스럽고 흡입력 있게 요약해 주세요.

    요구사항:
    - 에피소드 줄거리는 무조건 2문장으로 이루어진 한 문단으로 작성되어야 합니다.
    - 광고, 협찬 멘트, 팟캐스트나 출연자의 소개, 인트로/아웃트로 등 본편과 무관한 부분은 절대로 포함해서는 안됩니다.
    요약문은 성인 독자를 대상으로 정중하고 공손한 ‘존댓말’로 작성해주세요. '~합니다', '~입니다' 같은 표현을 사용하고, 반말이나 구어체는 절대 사용하지 마세요.
    - 팟캐스트의 형식이나 제작 정보(예: 'OO 방송에서')는 절대로 언급하지 마세요.
    - 발음 인식 오류로 생긴 이상한 단어는 자연스럽게 수정하거나 생략하세요.
    - 독자의 호기심을 자극할 수 있도록 핵심 내용을 서사적으로 전달해 주세요.
    - 정보 나열이 아닌, 이야기를 요약한 듯한 말투를 사용해 주세요.`);

  const [keywordPrompt, setKeywordPrompt] =
    useState(`당신은 콘텐츠 추천을 위한 태그 생성 전문가입니다.

    스크립트 내용을 분석하여 다음 기준을 바탕으로 추천 태그를 추출해 주세요:
    - 콘텐츠의 장르와 주제
    - 주요 키워드 및 핵심 개념
    - 콘텐츠가 속할 수 있는 카테고리
    - 어떤 사람들이 관심을 가질지 (타겟 청중)
    - 취향, 성향, 라이프스타일 등 연관된 키워드
    - 도서 검색 시 자주 사용되는 키워드(예: 고전, 역사, 심리, 철학 등)

    요구사항:
    - 광고, 협찬 멘트, 출연자 자기소개, 인트로/아웃트로 등 본편과 무관한 부분은 절대로 포함해서는 안됩니다.
    - 각 태그는 **한 단어**의 명사나 형용사로 작성하세요.
    - 의미가 중복되거나 중요하지 않은 내용은 포함하지 마세요.
    - 핵심 키워드만 중요한 순으로 **최소 5개, 최대 50개** 추출하세요.
    - 태그들은 **쉼표로 구분된 문자열**로 출력하세요 (리스트 형태 금지).

    예시 출력: 힐링,여행,자연,감성,대화,산책,감동,풍경,에세이,카페`);

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

  // OpenAI API 호출 함수 - 수정된 버전, text가 누락된 경우를 처리
  const callOpenAI = async (systemPrompt, userText) => {
    if (!userText || userText.trim() === '') {
      throw new Error('텍스트가 비어있습니다');
    }

    // 실제 API 호출을 수행
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo-0125',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userText },
          ],
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('OpenAI API 오류:', errorData);
        throw new Error(`OpenAI API 오류: ${errorData.error?.message || '알 수 없는 오류'}`);
      }

      return await response.json();
    } catch (error) {
      console.error('OpenAI API 오류:', error);
      throw error;
    }
  };

  // 텍스트를 적절한 크기로 청크화하는 함수
  const getTextChunks = (text, chunkSize = 4000) => {
    // 문장 단위로 분할하는 것이 좋지만, 간단히 구현
    let chunks = [];
    let currentChunk = '';

    // 문장이나 단락 단위로 분할
    const sentences = text.split(/(?<=[.!?])\s+/);

    for (const sentence of sentences) {
      // 현재 청크에 문장을 추가했을 때 최대 크기를 초과하는지 확인
      if ((currentChunk + sentence).length > chunkSize && currentChunk.length > 0) {
        chunks.push(currentChunk);
        currentChunk = sentence;
      } else {
        currentChunk += (currentChunk ? ' ' : '') + sentence;
      }
    }

    // 마지막 청크 추가
    if (currentChunk.length > 0) {
      chunks.push(currentChunk);
    }

    return chunks;
  };

  // 텍스트 청크에서 요약 생성
  const generateSummaryFromChunks = async (chunks) => {
    const chunkSummaries = [];

    for (let i = 0; i < chunks.length; i++) {
      setProgress(`요약 생성 중... (${i + 1}/${chunks.length})`);
      try {
        const response = await callOpenAI(summaryPrompt, chunks[i]);
        const chunkSummary = response.choices?.[0]?.message?.content?.trim();
        if (chunkSummary) chunkSummaries.push(chunkSummary);
      } catch (error) {
        console.error(`청크 ${i + 1} 요약 중 오류:`, error);
        // 오류가 있어도 계속 진행
      }
    }

    // 여러 청크의 요약이 있으면, 이들을 다시 요약
    if (chunkSummaries.length > 1) {
      setProgress('최종 요약 생성 중...');
      const combinedSummary = chunkSummaries.join('\n\n');
      try {
        const finalResponse = await callOpenAI(summaryPrompt, combinedSummary);
        return finalResponse.choices?.[0]?.message?.content?.trim();
      } catch (error) {
        console.error('최종 요약 생성 중 오류:', error);
        // 오류가 있으면 개별 요약들을 반환
        return chunkSummaries.join('\n\n');
      }
    } else if (chunkSummaries.length === 1) {
      return chunkSummaries[0];
    }

    return '요약을 생성할 수 없습니다.';
  };

  // 텍스트 청크에서 키워드 추출
  const extractKeywordsFromChunks = async (chunks) => {
    const allTags = new Set();

    for (let i = 0; i < chunks.length; i++) {
      setProgress(`키워드 추출 중... (${i + 1}/${chunks.length})`);
      try {
        const response = await callOpenAI(keywordPrompt, chunks[i]);
        const keywords = response.choices?.[0]?.message?.content
          ?.split(',')
          .map((tag) => tag.trim().replace(/^#/, ''))
          .filter(Boolean);

        keywords?.forEach((tag) => allTags.add(tag));
      } catch (error) {
        console.error(`청크 ${i + 1} 키워드 추출 중 오류:`, error);
        // 오류가 있어도 계속 진행
      }
    }

    return Array.from(allTags).slice(0, 50); // 최대 20개로 제한
  };

  const handleTranscribeAndPostProcess = async (episode) => {
    const existingFields = [];
    if (episode.script?.trim()) existingFields.push('스크립트');
    if (episode.summary?.trim()) existingFields.push('요약');
    if ((episode.tags?.length ?? 0) > 0) existingFields.push('태그');

    if (existingFields.length > 0) {
      const confirmed = window.confirm(
        `이미 생성된 항목: ${existingFields.join(
          ', '
        )}\n정말 모두 새로 생성하시겠어요? 기존 데이터가 덮어씌워집니다.`
      );
      if (!confirmed) return;
    }

    setIsProcessing(true);
    setProgress('스크립트 생성 중...');

    try {
      const response = await fetch(episode.audioFile, { method: 'HEAD' });
      const contentLength = response.headers.get('content-length');
      const fileSizeMB = contentLength ? (parseInt(contentLength) / (1024 * 1024)).toFixed(2) : 0;

      let transcript = '';

      if (fileSizeMB > 24) {
        const file = await getFileFromUrl(episode.audioFile);
        transcript = await processFileInChunks(file);
      } else {
        const res = await fetch('/.netlify/functions/transcribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ audioUrl: episode.audioFile }),
        });
        const result = await res.json();
        transcript = result.transcript;
      }

      if (!transcript) throw new Error('트랜스크립트 생성 실패');

      await supabase.from('episodes').update({ script: transcript }).eq('id', episode.id);
      setSelectedEpisode((prev) => ({ ...prev, script: transcript }));

      // 텍스트를 청크로 분할
      const chunks = getTextChunks(transcript);

      // 요약 생성
      setProgress('요약 생성 중...');
      const summary = await generateSummaryFromChunks(chunks);
      if (summary) {
        await supabase.from('episodes').update({ summary }).eq('id', episode.id);
        setSummary(summary);
        setSelectedEpisode((prev) => ({ ...prev, summary }));
      }

      // 키워드 추출
      setProgress('키워드 추출 중...');
      let extractedTags = [];
      if (summary && summary.length > 10) {
        extractedTags = await extractKeywordsFromSummary(summary);
      } else {
        extractedTags = await extractKeywordsFromChunks(chunks);
      }
      if (extractedTags.length > 0) {
        await supabase.from('episodes').update({ tags: extractedTags }).eq('id', episode.id);
        setKeywordsWhisper(extractedTags);
        setSelectedEpisode((prev) => ({ ...prev, tags: extractedTags }));
      }

      alert('✅ 스크립트 + 요약 + 키워드 저장 완료!');
    } catch (error) {
      console.error('처리 중 오류:', error);
      alert(error.message);
    } finally {
      setIsProcessing(false);
      setProgress('');
    }
  };

  // 1. 오디오 → 트랜스크립트 생성
  // 2. 트랜스크립트 청크 분할
  // 3. 요약 생성 → 변수 `summary` 저장
  // 4. 태그 추출 → 기존: 스크립트 청크 기반
  const handleFileUpload = async (file) => {
    setIsProcessing(true);
    setProgress('파일 처리 준비 중...');

    try {
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
      if (!selectedEpisode) throw new Error('먼저 에피소드를 선택해주세요');

      setProgress(`파일 크기: ${fileSizeMB}MB - 스크립트 생성 중...`);
      const transcript = await processFileInChunks(file);

      setProgress('스크립트 저장 중...');
      await supabase.from('episodes').update({ script: transcript }).eq('id', selectedEpisode.id);
      setSelectedEpisode((prev) => ({ ...prev, script: transcript }));

      // 텍스트를 청크로 분할
      const chunks = getTextChunks(transcript);
      console.log(`스크립트를 ${chunks.length}개 청크로 분할했습니다.`);

      // 요약 생성
      setProgress('요약 생성 중...');
      const summary = await generateSummaryFromChunks(chunks);
      if (summary) {
        await supabase.from('episodes').update({ summary }).eq('id', selectedEpisode.id);
        setSummary(summary);
        setSelectedEpisode((prev) => ({ ...prev, summary }));
      }

      // 키워드 추출
      setProgress('키워드 추출 중...');
      const extractedTags = await extractKeywordsFromSummary(summary);
      if (extractedTags.length > 0) {
        await supabase
          .from('episodes')
          .update({ tags: extractedTags })
          .eq('id', selectedEpisode.id);
        setKeywordsWhisper(extractedTags);
        setSelectedEpisode((prev) => ({ ...prev, tags: extractedTags }));
      }

      alert('✅ 업로드한 파일로 전체 처리 완료!');
    } catch (error) {
      console.error('❌ 파일 업로드 트랜스크립트 오류:', error);
      alert(`파일 처리 오류: ${error.message}`);
    } finally {
      setIsProcessing(false);
      setProgress('');
    }
  };

  const extractKeywordsFromSummary = async (summary) => {
    try {
      const response = await callOpenAI(keywordPrompt, summary);
      const keywords = response.choices?.[0]?.message?.content
        ?.split(',')
        .map((tag) => tag.trim().replace(/^#/, ''))
        .filter(Boolean);

      return keywords.slice(0, 50);
    } catch (error) {
      console.error('❌ 줄거리 기반 키워드 추출 오류:', error);
      return [];
    }
  };

  // 태그 다시 추출 (요약 기반)
  const handleKeywordExtract = async () => {
    if (!selectedEpisode?.summary) {
      alert('줄거리를 먼저 작성하거나 저장하세요');
      return;
    }

    const confirmed = window.confirm(
      '정말 태그를 다시 추출하시겠어요?\n기존 태그가 덮어씌워집니다.'
    );
    if (!confirmed) return;

    setIsProcessing(true);
    setProgress('키워드 추출 준비 중...');

    try {
      const extractedTags = await extractKeywordsFromSummary(selectedEpisode.summary);

      const { error } = await supabase
        .from('episodes')
        .update({ tags: extractedTags })
        .eq('id', selectedEpisode.id);

      if (error) throw new Error('DB 저장 실패');

      setKeywordsWhisper(extractedTags);
      setSelectedEpisode((prev) => ({ ...prev, tags: extractedTags }));
      alert('✅ 키워드 추출 및 저장 완료!');
    } catch (error) {
      alert(error.message);
    } finally {
      setIsProcessing(false);
      setProgress('');
    }
  };

  const [summaryType, setSummaryType] = useState('whisper'); // whisper or eleven

  const handleSummaryClick = (type = 'whisper') => {
    setEditableSummary(
      type === 'whisper' ? selectedEpisode.summary || '' : selectedEpisode.summary_eleven || ''
    );
    setSummaryType(type);
    setIsSummaryModalOpen(true);
  };

  // 줄거리 저장
  const handleSummarySave = async () => {
    const field = summaryType === 'whisper' ? 'summary' : 'summary_eleven';

    const { error } = await supabase
      .from('episodes')
      .update({ [field]: editableSummary })
      .eq('id', selectedEpisode.id);

    if (error) {
      alert('줄거리 저장 실패');
      return;
    }

    setSelectedEpisode((prev) => ({
      ...prev,
      [field]: editableSummary,
    }));

    if (field === 'summary') setSummary(editableSummary);
    setIsSummaryModalOpen(false);
    alert('✅ 줄거리 저장 완료!');
  };

  const handleSummaryWhisper = async () => {
    if (!selectedEpisode?.script) {
      alert('먼저 Whisper 스크립트를 생성해주세요');
      return;
    }

    const confirmed = window.confirm('정말 Whisper 스크립트를 다시 요약하시겠어요?');
    if (!confirmed) return;

    setIsProcessing(true);
    setProgress('요약 준비 중...');

    try {
      const chunks = getTextChunks(selectedEpisode.script);
      const finalSummary = await generateSummaryFromChunks(chunks);

      if (finalSummary) {
        const { error } = await supabase
          .from('episodes')
          .update({ summary: finalSummary })
          .eq('id', selectedEpisode.id);

        if (error) throw error;

        setSelectedEpisode((prev) => ({ ...prev, summary: finalSummary }));
        setSummary(finalSummary);
        alert('✅ Whisper 요약 완료!');
      }
    } catch (err) {
      console.error(err);
      alert('❌ Whisper 요약 실패');
    } finally {
      setIsProcessing(false);
      setProgress('');
    }
  };

  const handleSummaryEleven = async () => {
    if (!selectedEpisode?.script_eleven) {
      alert('먼저 ElevenLabs 스크립트를 생성해주세요');
      return;
    }

    const confirmed = window.confirm('정말 ElevenLabs 스크립트를 다시 요약하시겠어요?');
    if (!confirmed) return;

    setIsProcessing(true);
    setProgress('요약 준비 중...');

    try {
      const chunks = getTextChunks(selectedEpisode.script_eleven);
      const finalSummary = await generateSummaryFromChunks(chunks);

      if (finalSummary) {
        const { error } = await supabase
          .from('episodes')
          .update({ summary_eleven: finalSummary })
          .eq('id', selectedEpisode.id);

        if (error) throw error;

        setSelectedEpisode((prev) => ({ ...prev, summary_eleven: finalSummary }));
        alert('✅ ElevenLabs 요약 완료!');
      }
    } catch (err) {
      console.error(err);
      alert('❌ ElevenLabs 요약 실패');
    } finally {
      setIsProcessing(false);
      setProgress('');
    }
  };

  const transcribeWithElevenLabs = async (audioUrl) => {
    const response = await fetch('/.netlify/functions/elevenlabs-transcribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ audioUrl }),
    });
    const data = await response.json();
    return data.transcript;
  };

  const handleElevenLabsProcess = async (episode) => {
    if (!episode.audioFile) return alert('오디오 없음');

    setIsProcessing(true);
    try {
      const transcript = await transcribeWithElevenLabs(episode.audioFile);
      const chunks = getTextChunks(transcript);
      const summary = await generateSummaryFromChunks(chunks);
      const tags = await extractKeywordsFromSummary(summary);

      await supabase
        .from('episodes')
        .update({
          summary_eleven: summary,
          tags_eleven: tags,
        })
        .eq('id', episode.id);

      alert('✅ ElevenLabs 처리 완료');
    } catch (err) {
      console.error(err);
      alert('ElevenLabs 처리 중 오류');
    } finally {
      setIsProcessing(false);
    }
  };

  const transcribeChunksWithElevenLabs = async (file) => {
    const chunks = splitFileIntoChunks(file);
    const transcripts = [];

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const url = await uploadAudioToStorage(chunk); // Supabase에 청크 업로드
      const res = await fetch('/.netlify/functions/elevenlabs-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audioUrl: url }),
      });
      const data = await res.json();

      if (!res.ok || !data.transcript) {
        console.error(`청크 ${i + 1} 처리 실패:`, data);
        transcripts.push(`(청크 ${i + 1} 처리 실패)`);
      } else {
        transcripts.push(data.transcript);
      }
    }

    return transcripts.join('\n');
  };

  const uploadAudioToStorage = async (file) => {
    const filePath = `uploads/${Date.now()}_${file.name}`;
    const { data, error } = await supabase.storage
      .from('audio') // ✅ 반드시 "audio" bucket 있어야 함
      .upload(filePath, file, { cacheControl: '3600', upsert: true });

    if (error) throw error;

    const { data: publicUrlData } = supabase.storage.from('audio').getPublicUrl(filePath);
    return publicUrlData.publicUrl;
  };

  const splitFileIntoChunks = (file, chunkSize = 10 * 1024 * 1024) => {
    const chunks = [];
    let offset = 0;
    while (offset < file.size) {
      chunks.push(file.slice(offset, offset + chunkSize));
      offset += chunkSize;
    }
    return chunks;
  };

  const handleElevenLabsFileUpload = async (file) => {
    if (!selectedEpisode) {
      alert('에피소드 선택 필요');
      return;
    }

    setIsProcessing(true);
    setProgress('파일 청크 분할 중...');

    try {
      const chunks = splitFileIntoChunks(file);
      const transcripts = [];

      for (let i = 0; i < chunks.length; i++) {
        setProgress(`청크 ${i + 1}/${chunks.length} 업로드 및 변환 중...`);

        const fileChunk = chunks[i];
        const chunkUrl = await uploadAudioToStorage(fileChunk);

        const res = await fetch('/.netlify/functions/elevenlabs-upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ audioUrl: chunkUrl }),
        });

        const raw = await res.text();
        let data;

        try {
          data = JSON.parse(raw);
        } catch (err) {
          console.error('❌ 응답 JSON 파싱 실패:', raw);
          transcripts.push(`(청크 ${i + 1} JSON 파싱 실패)`);
          continue;
        }

        if (!res.ok || !data.transcript) {
          console.warn(`⚠️ 청크 ${i + 1} 처리 실패`, data);
          transcripts.push(`(청크 ${i + 1} 처리 실패)`);
        } else {
          transcripts.push(data.transcript);
        }
      }

      const fullTranscript = transcripts.join('\n');

      const { error } = await supabase
        .from('episodes')
        .update({ script_eleven: fullTranscript })
        .eq('id', selectedEpisode.id);
      if (error) throw error;

      setSelectedEpisode((prev) => ({
        ...prev,
        script_eleven: fullTranscript,
      }));

      // 텍스트 청크 분할
      chunks = getTextChunks(fullTranscript);

      // 요약 생성
      setProgress('요약 생성 중...');
      const summary = await generateSummaryFromChunks(chunks);

      // 태그 추출
      setProgress('태그 추출 중...');
      const tags = await extractKeywordsFromSummary(summary);

      // DB 저장
      await supabase
        .from('episodes')
        .update({
          script_eleven: fullTranscript,
          summary_eleven: summary,
          tags_eleven: tags,
        })
        .eq('id', selectedEpisode.id);

      // 상태 업데이트
      setSelectedEpisode((prev) => ({
        ...prev,
        script_eleven: fullTranscript,
        summary_eleven: summary,
        tags_eleven: tags,
      }));
      setSummary(summary);
      setKeywordsEleven(tags);

      alert('✅ 청크 기반 STT 완료!');
    } catch (err) {
      console.error(err);
      alert('❌ 처리 실패: ' + err.message);
    } finally {
      setIsProcessing(false);
      setProgress('');
    }
  };

  const handleKeywordExtractEleven = async () => {
    if (!selectedEpisode?.summary_eleven) {
      alert('ElevenLabs 줄거리를 먼저 작성하거나 저장하세요');
      return;
    }

    const confirmed = window.confirm(
      '정말 ElevenLabs 태그를 다시 추출하시겠어요?\n기존 tags_eleven이 덮어씌워집니다.'
    );
    if (!confirmed) return;

    setIsProcessing(true);
    setProgress('ElevenLabs 기반 키워드 추출 중...');

    try {
      const extractedTags = await extractKeywordsFromSummary(selectedEpisode.summary_eleven);

      const { error } = await supabase
        .from('episodes')
        .update({ tags_eleven: extractedTags })
        .eq('id', selectedEpisode.id);

      if (error) throw new Error('DB 저장 실패');

      setSelectedEpisode((prev) => ({ ...prev, tags_eleven: extractedTags }));
      setKeywordsEleven(extractedTags);
      alert('✅ ElevenLabs 키워드 추출 및 저장 완료!');
    } catch (error) {
      alert(error.message);
    } finally {
      setIsProcessing(false);
      setProgress('');
    }
  };

  return (
    <div className="flex h-screen">
      {/* 왼쪽: 에피소드 목록 */}
      <div className="p-4 border-r border-base-300 w-1/2 max-w-2xl overflow-y-auto">
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
              className="flex justify-between items-center gap-4 hover:bg-base-300 px-4 py-3 transition cursor-pointer"
              onClick={async () => {
                const { data: freshEp, error } = await supabase
                  .from('episodes')
                  .select('*')
                  .eq('id', ep.id)
                  .single();

                if (error) {
                  console.error('❌ 에피소드 불러오기 실패:', error.message);
                  return;
                }

                setSelectedEpisode(freshEp);
                setKeywordsWhisper(freshEp.tags || []);
                setKeywordsEleven(freshEp.tags_eleven || []);

                if (fileInputRef.current) fileInputRef.current.value = '';

                // 👉 스크롤 상단으로 이동
                if (detailRef.current) {
                  detailRef.current.scrollTop = 0;
                }
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
      </div>

      {/* 오른쪽: 상세 보기 */}
      <div className="p-6 w-1/2 overflow-y-auto" ref={detailRef}>
        {/* 처리 상태 표시 */}
        {isProcessing && (
          <div className="top-0 z-20 sticky bg-blue-100 shadow-sm mb-4 p-3 border border-blue-300 rounded-lg">
            <div className="flex items-center">
              <svg className="mr-2 w-4 h-4 text-blue-600 animate-spin" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              <span className="font-semibold text-blue-800 text-sm">처리 중...</span>
            </div>
            <p className="mt-1 text-blue-700 text-xs">{progress}</p>
          </div>
        )}
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
              <div className="gap-1 grid">
                <div className="gap-3 grid grid-cols-1">
                  {/* 파일 직접 업로드 */}
                  <div className="bg-primary p-4 rounded-lg">
                    <h3 className="mb-2 font-bold text-base-100">Whisper 파일 업로드</h3>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="audio/mp3,audio/mpeg,audio/wav"
                      className="file-input-bordered w-full file-input"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file);
                      }}
                      disabled={isProcessing}
                    />
                  </div>
                </div>
                <div className="gap-3 grid grid-cols-1">
                  {/* 파일 직접 업로드 */}
                  <div className="bg-secondary p-4 rounded-lg">
                    <h3 className="mb-2 font-bold text-base-100">ElevenLabs 파일 업로드</h3>
                    <input
                      type="file"
                      accept="audio/mp3,audio/mpeg,audio/wav"
                      className="file-input-bordered w-full file-input"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleElevenLabsFileUpload(file);
                      }}
                      disabled={isProcessing}
                    />
                  </div>
                </div>
              </div>
            )}

            {selectedEpisode.script && (
              <div className="mt-8">
                <div className="mb-1">
                  <label className="block font-semibold">Whisper 스크립트</label>
                  <div className="text-gray-500 text-xs">
                    총 글자 수: {selectedEpisode.script.length.toLocaleString()}자
                  </div>
                </div>
                <div className="bg-base-200 p-4 rounded-lg h-60 overflow-y-auto text-primary text-sm whitespace-pre-wrap">
                  {selectedEpisode.script}
                </div>
              </div>
            )}
            {selectedEpisode.script_eleven && (
              <div className="mt-8">
                <div className="mb-1">
                  <label className="block font-semibold">ElevenLabs 스크립트</label>
                  <div className="text-gray-500 text-xs">
                    총 글자 수: {selectedEpisode.script_eleven.length.toLocaleString()}자
                  </div>
                </div>
                <div className="bg-base-200 p-4 rounded-lg h-60 overflow-y-auto text-secondary text-sm whitespace-pre-wrap">
                  {selectedEpisode.script_eleven}
                </div>
              </div>
            )}
            {selectedEpisode.script && (
              <>
                <div className="space-y-2">
                  <div>
                    <label className="block mb-1 font-semibold">줄거리</label>
                    <textarea
                      className="textarea-bordered w-full h-20 textarea"
                      value={summaryPrompt}
                      onChange={(e) => setSummaryPrompt(e.target.value)}
                    />
                  </div>

                  {selectedEpisode.summary && (
                    <>
                      <div className="relative bg-base-200 p-4 rounded-lg overflow-y-auto text-primary text-sm whitespace-pre-wrap">
                        <button
                          className="right-1 bottom-1 absolute p-1 btn btn-xs btn-accent"
                          onClick={() => handleSummaryClick('whisper')}
                        >
                          <Pencil size={16} />
                        </button>
                        {selectedEpisode.summary}
                      </div>
                      <button
                        className="w-full btn btn-primary"
                        onClick={handleSummaryWhisper}
                        disabled={isProcessing}
                      >
                        Whisper 스크립트 요약하기
                      </button>
                    </>
                  )}

                  {selectedEpisode.summary_eleven && (
                    <>
                      <div className="relative bg-base-200 p-4 rounded-lg overflow-y-auto text-secondary text-sm whitespace-pre-wrap">
                        <button
                          className="right-1 bottom-1 absolute p-1 btn btn-xs btn-accent"
                          onClick={() => handleSummaryClick('eleven')}
                        >
                          <Pencil size={16} />
                        </button>
                        {selectedEpisode.summary_eleven}
                      </div>
                      <button
                        className="w-full btn btn-secondary"
                        onClick={handleSummaryEleven}
                        disabled={isProcessing}
                      >
                        ElevenLabs 스크립트 요약하기
                      </button>
                    </>
                  )}

                  {/* 요약 수정 모달 */}
                  {isSummaryModalOpen && (
                    <Modal onClose={() => setIsSummaryModalOpen(false)}>
                      <textarea
                        className="textarea-bordered w-full h-40 textarea"
                        value={editableSummary}
                        onChange={(e) => setEditableSummary(e.target.value)}
                      />
                      <div className="flex justify-end gap-2 mt-4">
                        <button
                          className="btn btn-ghost"
                          onClick={() => setIsSummaryModalOpen(false)}
                        >
                          취소
                        </button>
                        <button className="btn btn-primary" onClick={handleSummarySave}>
                          저장
                        </button>
                      </div>
                    </Modal>
                  )}
                </div>
              </>
            )}
            {selectedEpisode.script && (
              <>
                <div>
                  <label className="block mb-1 font-semibold">태그</label>
                  <textarea
                    className="textarea-bordered w-full h-20 textarea"
                    value={keywordPrompt}
                    onChange={(e) => setKeywordPrompt(e.target.value)}
                  />
                </div>
                {keywordsWhisper.length > 0 && (
                  <>
                    <div className="flex flex-wrap gap-2 mt-4">
                      {keywordsWhisper.map((tag, i) => (
                        <div key={i} className="badge badge-soft badge-primary">
                          {tag}
                        </div>
                      ))}
                    </div>
                    <button
                      className="w-full btn btn-primary"
                      onClick={handleKeywordExtract}
                      disabled={isProcessing}
                    >
                      Whisper 태그 추출하기
                    </button>
                  </>
                )}
                {keywordsEleven.length > 0 && (
                  <>
                    <div className="flex flex-wrap gap-2 mt-4">
                      {keywordsEleven.map((tag, i) => (
                        <div key={i} className="badge badge-soft badge-secondary">
                          {tag}
                        </div>
                      ))}
                      <button
                        className="w-full btn btn-secondary"
                        onClick={handleKeywordExtractEleven}
                        disabled={isProcessing}
                      >
                        ElevenLabs 태그 추출하기
                      </button>
                    </div>
                  </>
                )}
              </>
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
