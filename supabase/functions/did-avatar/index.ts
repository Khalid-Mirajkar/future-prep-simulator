
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { text, action, talkId } = await req.json();
    const didApiKey = Deno.env.get('DID_API_KEY');

    if (!didApiKey) {
      throw new Error('D-ID API key not configured');
    }

    const didApiUrl = 'https://api.d-id.com';

    if (action === 'create') {
      // Create a new talk
      const response = await fetch(`${didApiUrl}/talks`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${didApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          script: {
            type: 'text',
            subtitles: 'false',
            provider: {
              type: 'microsoft',
              voice_id: 'en-US-JennyNeural',
            },
            ssml: 'false',
            input: text,
          },
          config: {
            fluent: 'false',
            pad_audio: '0.0',
          },
          source_url: 'https://d-id-public-bucket.s3.us-west-2.amazonaws.com/alice.jpg',
        }),
      });

      if (!response.ok) {
        throw new Error(`D-ID API error: ${response.statusText}`);
      }

      const result = await response.json();
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else if (action === 'status') {
      // Get talk status
      const response = await fetch(`${didApiUrl}/talks/${talkId}`, {
        headers: {
          'Authorization': `Basic ${didApiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`D-ID API error: ${response.statusText}`);
      }

      const result = await response.json();
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    throw new Error('Invalid action');

  } catch (error) {
    console.error('D-ID Avatar Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
