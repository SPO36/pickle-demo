import { useState } from 'react';

export default function DubbingTest() {
  const [inputUrls, setInputUrls] = useState('');
  const [results, setResults] = useState([]);
  const [loadingIndex, setLoadingIndex] = useState(null);

  const handleStartDubbing = async () => {
    const urls = inputUrls
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
    const newResults = [];

    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      setLoadingIndex(i);

      try {
        // 1. Dub 요청
        const res = await fetch('/.netlify/functions/elevenlabs-dub', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            audioUrl: url,
            source_language: 'en',
            target_language: 'ko',
          }),
        });

        const { project_id } = await res.json();

        // 2. 상태 확인 폴링
        let status = 'queued';
        let attempts = 0;
        while (status !== 'completed' && attempts < 10) {
          await new Promise((r) => setTimeout(r, 2000));
          const check = await fetch(`/api/check-dubbing-status?projectId=${project_id}`);
          const json = await check.json();
          status = json.status;
          attempts++;
        }

        if (status !== 'completed') throw new Error('더빙 실패 또는 시간 초과');

        // 3. 결과 오디오
        const audioRes = await fetch(`/api/get-dubbed-audio?projectId=${project_id}`);
        const { audioUrl: dubbedUrl } = await audioRes.json();

        newResults.push({ original: url, dubbed: dubbedUrl });
      } catch (err) {
        console.error('❌ 처리 실패:', err);
        newResults.push({ original: url, error: err.message });
      }
    }

    setResults(newResults);
    setLoadingIndex(null);
  };

  return (
    <div className="p-6">
      <h1 className="mb-4 font-bold text-2xl">🎙 ElevenLabs 더빙 테스트</h1>
      <textarea
        className="textarea-bordered w-full h-32 textarea"
        placeholder="mp3 링크 여러 줄로 입력"
        value={inputUrls}
        onChange={(e) => setInputUrls(e.target.value)}
      />
      <button
        className="mt-4 btn btn-primary"
        onClick={handleStartDubbing}
        disabled={loadingIndex !== null}
      >
        {loadingIndex !== null ? `(${loadingIndex + 1}) 처리 중...` : '더빙 시작'}
      </button>

      <div className="space-y-4 mt-6">
        {results.map((res, idx) => (
          <div key={idx} className="bg-base-200 p-4 border rounded">
            <p className="mb-1 font-mono text-sm break-all">🎧 원본: {res.original}</p>
            {res.error ? (
              <p className="text-red-500">❌ 오류: {res.error}</p>
            ) : (
              <>
                <p className="font-mono text-sm break-all">✅ 더빙: {res.dubbed}</p>
                <audio controls className="mt-2 w-full" src={res.dubbed} />
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
