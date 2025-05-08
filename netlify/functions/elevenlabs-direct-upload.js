import fs from 'fs';
import multiparty from 'multiparty';
import fetch from 'node-fetch';

export const handler = async (event) => {
  return new Promise((resolve, reject) => {
    const form = new multiparty.Form();

    form.parse(event, async (err, fields, files) => {
      if (err) {
        console.error('❌ Form parse error:', err);
        return reject({ statusCode: 500, body: 'Form parsing failed' });
      }

      const file = files.file?.[0];
      if (!file) {
        return resolve({ statusCode: 400, body: '파일 없음' });
      }

      const audioBuffer = fs.readFileSync(file.path);

      try {
        const res = await fetch('https://api.elevenlabs.io/speech-to-text/v1', {
          method: 'POST',
          headers: {
            'xi-api-key': process.env.VITE_ELEVENLABS_API_KEY,
          },
          body: audioBuffer,
        });

        const data = await res.json();
        const transcript = data.text || '';
        const summary = '요약된 결과';
        const tags = ['예시', '태그'];

        return resolve({
          statusCode: 200,
          body: JSON.stringify({ transcript, summary, tags }),
        });
      } catch (err) {
        console.error('❌ ElevenLabs 오류:', err);
        return resolve({ statusCode: 500, body: 'ElevenLabs 요청 실패' });
      }
    });
  });
};
