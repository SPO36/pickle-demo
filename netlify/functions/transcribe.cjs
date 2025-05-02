const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const os = require('os');

const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

exports.handler = async (event) => {
  try {
    const { audioUrl } = JSON.parse(event.body);

    const audioRes = await fetch(audioUrl);
    const buffer = await audioRes.buffer();

    // ✅ 용량 초과 검사 (25MB = 26214400 bytes)
    const MAX_SIZE = 25 * 1024 * 1024;
    if (buffer.length > MAX_SIZE) {
      return {
        statusCode: 413,
        body: JSON.stringify({
          error: '📦 파일이 너무 큽니다. 25MB 이하의 오디오 파일만 지원됩니다.',
          size: buffer.length,
          max: MAX_SIZE,
        }),
      };
    }

    const uniqueName = `audio_${Date.now()}.mp3`;
    const tempPath = path.join(os.tmpdir(), uniqueName);
    fs.writeFileSync(tempPath, buffer);

    const form = new FormData();
    form.append('file', fs.createReadStream(tempPath));
    form.append('model', 'whisper-1');

    const whisperRes = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        ...form.getHeaders(),
      },
      body: form,
    });

    if (!whisperRes.ok) {
      const errorText = await whisperRes.text();
      throw new Error(`Whisper API error: ${errorText}`);
    }

    const result = await whisperRes.json();

    fs.unlink(tempPath, (err) => {
      if (err) console.error('❗ 임시 파일 삭제 실패:', err.message);
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ transcript: result.text }),
    };
  } catch (err) {
    console.error('❌ Transcribe Error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message || 'Transcription failed' }),
    };
  }
};
