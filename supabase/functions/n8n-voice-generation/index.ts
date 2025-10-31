import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { text } = await req.json();

    // Input validation
    if (!text || typeof text !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Text is required and must be a string', success: false }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (text.length > 1000) {
      return new Response(
        JSON.stringify({ error: 'Text must be less than 1000 characters', success: false }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Generating voice via n8n webhook for text:', text);

    // Get webhook URL from environment variable
    const webhookUrl = Deno.env.get('N8N_WEBHOOK_URL');
    if (!webhookUrl) {
      console.error('N8N_WEBHOOK_URL not configured');
      return new Response(
        JSON.stringify({ error: 'Voice generation service not configured', success: false }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Call the n8n webhook endpoint
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: text
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('n8n webhook error:', response.status, errorText);
      throw new Error(`n8n webhook failed: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    console.log('n8n webhook response received');

    // Expect the n8n workflow to return audio content
    // Adapt based on your n8n workflow's response format
    if (!result.audioContent && !result.audio) {
      throw new Error('No audio content received from n8n webhook');
    }

    // Use audioContent if available, otherwise try audio field
    const audioContent = result.audioContent || result.audio;

    return new Response(
      JSON.stringify({ 
        audioContent: audioContent, 
        format: result.format || 'wav',
        success: true 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('n8n voice generation error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});