
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
    
    // Input validation
    if (action && typeof action !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Action must be a string' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'create') {
      if (!text || typeof text !== 'string' || text.trim().length === 0) {
        return new Response(
          JSON.stringify({ error: 'Text is required and must be a non-empty string' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (text.length > 500) {
        return new Response(
          JSON.stringify({ error: 'Text must be less than 500 characters' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    if (action === 'status') {
      if (!talkId || typeof talkId !== 'string' || talkId.trim().length === 0) {
        return new Response(
          JSON.stringify({ error: 'Talk ID is required for status checks' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }
    
    const didApiKey = Deno.env.get('DID_API_KEY');

    if (!didApiKey) {
      throw new Error('D-ID API key not configured');
    }

    const didApiUrl = 'https://api.d-id.com';

    console.log(`Processing ${action} request...`);

    if (action === 'create') {
      console.log('Creating new talk with text:', text);
      
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

      const responseText = await response.text();
      console.log('D-ID create response status:', response.status);
      console.log('D-ID create response:', responseText);

      if (!response.ok) {
        throw new Error(`D-ID API error: ${response.status} - ${responseText}`);
      }

      const result = JSON.parse(responseText);
      console.log('Talk created successfully with ID:', result.id);
      
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else if (action === 'status') {
      console.log('Checking status for talk ID:', talkId);
      
      // Get talk status
      const response = await fetch(`${didApiUrl}/talks/${talkId}`, {
        headers: {
          'Authorization': `Basic ${didApiKey}`,
        },
      });

      const responseText = await response.text();
      console.log('D-ID status response status:', response.status);
      console.log('D-ID status response:', responseText);

      if (!response.ok) {
        throw new Error(`D-ID API error: ${response.status} - ${responseText}`);
      }

      const result = JSON.parse(responseText);
      console.log('Talk status:', result.status);
      
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
