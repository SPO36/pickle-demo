// netlify/functions/librivox.js
const fetch = require('node-fetch');

exports.handler = async (event) => {
  const { title = '', offset = '0' } = event.queryStringParameters;

  const baseUrl = 'https://librivox.org/api/feed/audiobooks/?format=atom';
  const url = baseUrl + (title ? `&title=${encodeURIComponent(title)}` : '') + `&offset=${offset}`;

  console.log('📡 요청 URL:', url);

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (AudioBooksApp/1.0)',
        Accept: 'application/xml',
      },
    });

    if (!response.ok) {
      console.error(`❌ API 응답 에러: ${response.status} ${response.statusText}`);
      return {
        statusCode: response.status,
        body: `Error: ${response.statusText}`,
      };
    }

    const xml = await response.text();

    // Debug response
    // console.log('📄 응답 본문 시작 ===');
    // console.log(xml.slice(0, 1000)); // Log first 1000 chars
    // console.log('📄 응답 본문 끝 ===');

    // Check for valid XML response
    if (!xml.includes('<feed') && !xml.includes('<books')) {
      console.error('❌ 유효하지 않은 XML 응답:', xml.slice(0, 200));
      return {
        statusCode: 500,
        body: '<error>Invalid XML response from LibriVox API</error>',
        headers: {
          'Content-Type': 'application/xml',
          'Access-Control-Allow-Origin': '*',
        },
      };
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Access-Control-Allow-Origin': '*',
      },
      body: xml,
    };
  } catch (e) {
    console.error('❌ LibriVox API 호출 실패:', e);
    return {
      statusCode: 500,
      body: '<error>Internal Server Error</error>',
      headers: {
        'Content-Type': 'application/xml',
        'Access-Control-Allow-Origin': '*',
      },
    };
  }
};
