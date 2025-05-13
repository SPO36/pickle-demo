import fetch from 'node-fetch';

export const handler = async (event) => {
  const { text } = JSON.parse(event.body || '{}');

  if (!text) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing text' }),
    };
  }

  const res = await fetch('https://api-free.deepl.com/v2/translate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      auth_key: process.env.DEEPL_API_KEY,
      text,
      target_lang: 'KO',
      source_lang: 'EN',
    }),
  });

  const data = await res.json();

  return {
    statusCode: 200,
    body: JSON.stringify({ result: data.translations[0].text }),
  };
};
