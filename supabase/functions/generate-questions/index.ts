
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { companyName, jobTitle } = await req.json()
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY')

    if (!openAIApiKey) {
      console.error('Error: OPENAI_API_KEY is not set')
      return new Response(
        JSON.stringify({ error: 'OpenAI API key is not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('Generating questions for:', { companyName, jobTitle })

    const prompt = `Generate 7 multiple-choice questions for a ${jobTitle} role at ${companyName}. 
    Format the response as a JSON array with the following structure for each question:
    {
      "question": "the question text",
      "options": ["option1", "option2", "option3", "option4"],
      "correctAnswer": 0, // index of correct answer (0-3)
      "explanation": "explanation why this answer is correct"
    }
    
    Questions should:
    - Be specific to the role and company
    - Cover key technical skills and knowledge required
    - Range from beginner to intermediate difficulty
    - Have one correct answer and three plausible distractors
    - Include a clear explanation for the correct answer
    
    Return ONLY the JSON array with 7 questions, no other text.`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'You are a technical interviewer creating multiple choice questions.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('OpenAI API error:', errorData)
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`)
    }

    const data = await response.json()
    
    // Validate the response from OpenAI
    if (!data || !data.choices || !data.choices[0] || !data.choices[0].message || !data.choices[0].message.content) {
      console.error('Unexpected OpenAI response format:', data)
      throw new Error('Invalid response from OpenAI')
    }
    
    // Parse the response content and validate it's a valid JSON array
    let questions
    try {
      questions = JSON.parse(data.choices[0].message.content)
      
      if (!Array.isArray(questions) || questions.length === 0) {
        console.error('OpenAI did not return a valid question array:', data.choices[0].message.content)
        throw new Error('Invalid question format returned from OpenAI')
      }
    } catch (parseError) {
      console.error('Failed to parse questions JSON:', parseError, data.choices[0].message.content)
      throw new Error('Failed to parse questions from OpenAI response')
    }

    // Add IDs to questions
    const questionsWithIds = questions.map((q, index) => ({
      id: index + 1,
      ...q,
    }))

    console.log('Successfully generated questions:', questionsWithIds.length)

    return new Response(JSON.stringify(questionsWithIds), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error generating questions:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to generate questions' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
