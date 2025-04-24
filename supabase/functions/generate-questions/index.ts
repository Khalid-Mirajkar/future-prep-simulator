
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

    const data = await response.json()
    const questions = JSON.parse(data.choices[0].message.content)

    // Add IDs to questions
    const questionsWithIds = questions.map((q: any, index: number) => ({
      id: index + 1,
      ...q,
    }))

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
