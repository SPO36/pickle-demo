const fetch = require('node-fetch');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { audioUrl } = JSON.parse(event.body);

    if (!audioUrl) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing audioUrl' }) };
    }

    const apiKey = process.env.ELEVENLABS_API_KEY;

    const dubbingRes = await fetch('https://api.elevenlabs.io/v1/dubbing', {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: audioUrl,
        source_language: 'en',
        target_language: 'ko',
        mode: 'automatic',
      }),
    });

    const dubbingJson = await dubbingRes.json();
    if (!dubbingRes.ok) {
      return {
        statusCode: dubbingRes.status,
        body: JSON.stringify({ error: 'Dubbing failed', detail: dubbingJson }),
      };
    }

    const projectId = dubbingJson.project_id;

    // 상태 체크
    let status = 'queued';
    for (let i = 0; i < 10; i++) {
      await new Promise((r) => setTimeout(r, 2000));
      const statusRes = await fetch(`https://api.elevenlabs.io/v1/dubbing/${projectId}`, {
        headers: { 'xi-api-key': apiKey },
      });
      const statusJson = await statusRes.json();
      status = statusJson.status;
      if (status === 'completed') break;
    }

    if (status !== 'completed') {
      await supabase.from('dubbing_results').insert({
        original_url: audioUrl,
        project_id: projectId,
        status: 'error',
        error_message: 'Timeout or failure',
      });

      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Timeout waiting for dubbing to complete' }),
      };
    }

    // 결과 다운로드
    const audioFileRes = await fetch(`https://api.elevenlabs.io/v1/dubbing/${projectId}/audio`, {
      headers: { 'xi-api-key': apiKey },
    });
    const audioBuffer = await audioFileRes.buffer();

    const filename = audioUrl.split('/').pop().split('.')[0];
    const storagePath = `dubbings/${filename}.mp3`;

    const uploadRes = await supabase.storage.from('dubbed-audio').upload(storagePath, audioBuffer, {
      contentType: 'audio/mpeg',
      upsert: true,
    });

    if (uploadRes.error) {
      throw new Error(uploadRes.error.message);
    }

    const { publicUrl } = supabase.storage.from('dubbed-audio').getPublicUrl(storagePath);

    await supabase.from('dubbing_results').insert({
      original_url: audioUrl,
      dubbed_url: publicUrl,
      project_id: projectId,
      status: 'completed',
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ dubbed_url: publicUrl, project_id: projectId }),
    };
  } catch (err) {
    console.error('❌ 오류:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: '서버 오류', message: err.message }),
    };
  }
};
