
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { cvText, industry, jobTitle, company } = await req.json()
    
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    const prompt = `You are an expert in resume evaluation for applicant tracking systems (ATS) and hiring.

A user has submitted a CV along with the following details:
• Field/Industry: ${industry}
• Job Title: ${jobTitle}
• Target Company: ${company}

Evaluate the CV below for:
1. ATS Compatibility Score out of 100
2. Relevance to the job title, industry, and company
3. Critical missing keywords or technical skills
4. Red flags: colors, profile photo, non-standard fonts, overuse of graphics, or improper formatting
5. Actionable suggestions for improvement in bullet points
6. A revised version of the resume summary section tailored to the target role

Please respond in the following JSON format:
{
  "atsScore": number,
  "relevanceScore": number,
  "missingKeywords": string[],
  "redFlags": string[],
  "suggestions": string[],
  "revisedSummary": string,
  "overallFeedback": string
}

CV Content:
${cvText}`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`)
    }

    const data = await response.json()
    const analysisText = data.choices[0].message.content

    // Try to parse JSON response
    let analysis
    try {
      analysis = JSON.parse(analysisText)
    } catch (e) {
      // If JSON parsing fails, create a structured response
      analysis = {
        atsScore: 50,
        relevanceScore: 50,
        missingKeywords: ['Unable to parse detailed analysis'],
        redFlags: [],
        suggestions: ['Please try uploading your CV again'],
        revisedSummary: 'Analysis could not be completed',
        overallFeedback: analysisText
      }
    }

    return new Response(
      JSON.stringify(analysis),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Error analyzing CV:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to analyze CV', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})
