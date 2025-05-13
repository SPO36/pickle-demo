const fetch = require('node-fetch');

exports.handler = async (event) => {
  try {
    const { text } = JSON.parse(event.body);

    if (!text || typeof text !== 'string' || text.trim() === '') {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'text 파라미터가 비어 있거나 유효하지 않습니다.' }),
      };
    }

    if (text.length > 4000) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: '텍스트가 너무 깁니다. 4000자 이하로 줄여주세요.' }),
      };
    }

    const response = await fetch(
      'https://api.elevenlabs.io/v1/text-to-speech/uyVNoMrnUku1dZyVEXwD', // Anna Kim
      {
        method: 'POST',
        headers: {
          'xi-api-key': process.env.ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
          accept: 'audio/mpeg',
        },
        body: JSON.stringify({
          text: text.trim(),
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: `ElevenLabs API 실패: ${errorText}` }),
      };
    }

    const buffer = await response.buffer();
    const base64 = buffer.toString('base64');

    return {
      statusCode: 200,
      body: JSON.stringify({
        audioUrl: `data:audio/mpeg;base64,${base64}`,
      }),
    };
  } catch (e) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: e.message }),
    };
  }
};
