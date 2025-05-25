const fetch = require('node-fetch');
const FormData = require('form-data');

exports.handler = async (event) => {
  try {
    const { audioUrl } = JSON.parse(event.body);
    if (!audioUrl) throw new Error('audioUrl 누락');

    // 1. 오디오 다운로드
    const res = await fetch(audioUrl);
    if (!res.ok) throw new Error('오디오 다운로드 실패');
    const buffer = await res.buffer();

    // 2. 청크 분할 (20MB 이하)
    const CHUNK_SIZE = 20 * 1024 * 1024;
    const chunks = [];
    for (let i = 0; i < buffer.length; i += CHUNK_SIZE) {
      chunks.push(buffer.slice(i, i + CHUNK_SIZE));
    }

    // 3. 순차적으로 ElevenLabs 전송 후 결과 합치기
    let finalText = '';
    for (let i = 0; i < chunks.length; i++) {
      const form = new FormData();
      form.append('file', chunks[i], {
        filename: `chunk-${i}.mp3`,
        contentType: 'audio/mpeg',
      });
      form.append('model_id', 'scribe_v1');

      const response = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
        method: 'POST',
        headers: {
          'xi-api-key': process.env.ELEVENLABS_API_KEY,
          ...form.getHeaders(),
        },
        body: form,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ STT 실패:', errorText);
        throw new Error('STT API 실패');
      }

      const data = await response.json();
      finalText += data.text + '\n';
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ text: finalText.trim() }),
    };
  } catch (err) {
    console.error('[❌ 에러]', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
