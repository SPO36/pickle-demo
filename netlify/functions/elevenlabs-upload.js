import FormData from 'form-data';
import fetch from 'node-fetch';

export const handler = async (event) => {
  try {
    const { audioUrl } = JSON.parse(event.body);
    if (!audioUrl) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'audioUrl 누락' }),
      };
    }

    const audioRes = await fetch(audioUrl);
    if (!audioRes.ok) throw new Error('오디오 다운로드 실패');
    const audioBuffer = await audioRes.buffer();

    const form = new FormData();
    form.append('file', audioBuffer, {
      filename: 'audio.mp3',
      contentType: 'audio/mpeg',
    });
    form.append('model_id', 'scribe_v1');
    form.append('language_code', 'kor'); // 한국어
    form.append('diarize', 'true'); // 화자 분리

    const elevenRes = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
      method: 'POST',
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY,
        ...form.getHeaders(),
      },
      body: form,
    });

    if (!elevenRes.ok) {
      const errorText = await elevenRes.text();
      throw new Error(`STT 요청 실패: ${elevenRes.status} - ${errorText}`);
    }

    let data;
    try {
      data = await elevenRes.json();
    } catch (parseError) {
      throw new Error('응답 JSON 파싱 실패');
    }

    const transcript = data.text;
    if (typeof transcript !== 'string' || !transcript.trim()) {
      throw new Error('❌ transcript가 응답에 없습니다.');
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ transcript }),
    };
  } catch (err) {
    console.error('❌ ElevenLabs STT 오류:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
