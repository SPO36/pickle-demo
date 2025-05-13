import fetch from 'node-fetch';

export const handler = async (event) => {
  const rssUrl = event.queryStringParameters.url;
  if (!rssUrl) {
    return {
      statusCode: 400,
      body: 'Missing RSS URL',
    };
  }

  try {
    const response = await fetch(rssUrl);
    const xml = await response.text();

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/xml' },
      body: xml,
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
