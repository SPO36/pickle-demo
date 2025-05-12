// netlify/functions/librivox.js
const fetch = require('node-fetch');

exports.handler = async (event) => {
  const { title = '' } = event.queryStringParameters;

  const url = `https://librivox.org/api/feed/audiobooks/?format=atom&title=${encodeURIComponent(
    title
  )}`;
  const response = await fetch(url);
  const xml = await response.text();

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/xml',
      'Access-Control-Allow-Origin': '*',
    },
    body: xml,
  };
};
