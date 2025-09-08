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

    if (!text) {
      throw new Error('Text is required');
    }

    console.log('Generating voice via n8n webhook for text:', text);

    // Call the n8n webhook endpoint
    const response = await fetch('http://localhost:5678/webhook-test/generate_audio', {
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