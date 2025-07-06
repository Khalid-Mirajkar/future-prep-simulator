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

    console.log('Generating voice with DIA model for text:', text);

    // Call Replicate DIA API
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${Deno.env.get('REPLICATE_API_TOKEN')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: 'zsxkib/dia:latest',
        input: {
          text: text,
          // Add voice conditioning for professional female voice
          voice_conditioning: 'professional_female',
          // Optimize for clear speech
          temperature: 0.7,
          top_p: 0.9,
        }
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to generate voice');
    }

    const prediction = await response.json();
    console.log('DIA prediction created:', prediction.id);

    // Poll for completion
    let result = prediction;
    while (result.status === 'starting' || result.status === 'processing') {
      console.log('Waiting for DIA generation, status:', result.status);
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const statusResponse = await fetch(`https://api.replicate.com/v1/predictions/${result.id}`, {
        headers: {
          'Authorization': `Token ${Deno.env.get('REPLICATE_API_TOKEN')}`,
        },
      });
      
      result = await statusResponse.json();
    }

    if (result.status === 'failed') {
      throw new Error(result.error || 'Voice generation failed');
    }

    if (result.status === 'succeeded') {
      console.log('DIA voice generation completed successfully');
      
      // Get the audio URL from the result
      const audioUrl = result.output;
      
      if (!audioUrl) {
        throw new Error('No audio output received from DIA model');
      }

      // Fetch the audio file and convert to base64
      const audioResponse = await fetch(audioUrl);
      if (!audioResponse.ok) {
        throw new Error('Failed to fetch generated audio');
      }

      const audioBuffer = await audioResponse.arrayBuffer();
      const base64Audio = btoa(
        String.fromCharCode(...new Uint8Array(audioBuffer))
      );

      return new Response(
        JSON.stringify({ 
          audioContent: base64Audio, 
          format: 'wav',
          success: true 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    throw new Error('Unexpected result status: ' + result.status);

  } catch (error) {
    console.error('DIA voice generation error:', error);
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