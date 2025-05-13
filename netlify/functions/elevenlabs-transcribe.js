const fetch = require('node-fetch');
const FormData = require('form-data');

exports.handler = async (event) => {
  try {
    const { audioUrl } = JSON.parse(event.body);
    console.log('[DEBUG] audioUrl:', audioUrl);

    if (!audioUrl) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'audioUrl 누락' }),
      };
    }

    // 🔽 1. 파일 다운로드
    const fileRes = await fetch(audioUrl);
    if (!fileRes.ok) throw new Error('파일 다운로드 실패');
    const fileBuffer = await fileRes.buffer();

    // 🔽 2. FormData 구성
    const form = new FormData();
    form.append('file', fileBuffer, {
      filename: 'audio.mp3',
      contentType: 'audio/mpeg',
    });
    form.append('model_id', 'scribe_v1');

    // 🔽 3. ElevenLabs에 전송
    const response = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
      method: 'POST',
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY,
        ...form.getHeaders(), // 중요!
      },
      body: form,
    });

    const data = await response.json();
    console.log('[📡 응답]', data);

    return {
      statusCode: response.status,
      body: JSON.stringify(data),
    };
  } catch (err) {
    console.error('[❌ 에러]', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
