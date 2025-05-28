const fetch = require('node-fetch');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const {
      audioUrl,
      source_language = 'en',
      target_language = 'ko',
      voice = null,
    } = JSON.parse(event.body);

    if (!audioUrl) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing audioUrl' }) };
    }

    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Missing ELEVENLABS_API_KEY in env' }),
      };
    }

    const response = await fetch('https://api.elevenlabs.io/v1/dubbing', {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: audioUrl,
        source_language,
        target_language,
        voice: voice || undefined,
        mode: 'automatic',
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      return { statusCode: response.status, body: JSON.stringify(result) };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ project_id: result.project_id }),
    };
  } catch (err) {
    console.error('Dubbing error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server error', detail: err.message }),
    };
  }
};
