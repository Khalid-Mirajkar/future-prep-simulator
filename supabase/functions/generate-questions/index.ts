
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Generate mock questions with enhanced relevance
const generateMockQuestions = (companyName: string, jobTitle: string) => {
  console.log('Using mock questions for:', companyName, jobTitle);
  
  const commonQuestions = [
    {
      id: 1,
      question: `Which software development methodology is most commonly used at ${companyName}?`,
      options: ["Agile/Scrum", "Waterfall", "Spiral", "Big Bang"],
      correctAnswer: 0,
      explanation: "Most modern tech companies, including " + companyName + ", use Agile methodologies for their flexibility and iterative approach."
    },
    {
      id: 2,
      question: `For a ${jobTitle} position at ${companyName}, which soft skill is typically most valued?`,
      options: ["Communication", "Time Management", "Leadership", "Creativity"],
      correctAnswer: 0,
      explanation: "Strong communication skills are essential for collaboration in modern development teams."
    },
    // ... more questions specific to the role and company
  ];

  const technicalQuestions = [
    {
      id: 3,
      question: "Which design pattern would be most appropriate for implementing a notification system?",
      options: ["Observer", "Singleton", "Factory", "Decorator"],
      correctAnswer: 0,
      explanation: "The Observer pattern is ideal for implementing notification systems where multiple objects need to be notified of state changes."
    },
    {
      id: 4,
      question: "What is the most efficient data structure for implementing a cache?",
      options: ["Hash Map", "Linked List", "Array", "Binary Tree"],
      correctAnswer: 0,
      explanation: "Hash Maps provide O(1) average time complexity for lookups, making them ideal for cache implementations."
    },
    {
      id: 5,
      question: "Which testing approach should be prioritized in a CI/CD pipeline?",
      options: ["Unit Testing", "Manual Testing", "End-to-End Testing", "Stress Testing"],
      correctAnswer: 0,
      explanation: "Unit tests are fundamental to CI/CD pipelines as they provide fast feedback and catch issues early."
    },
    {
      id: 6,
      question: "What is the recommended approach for handling asynchronous operations in modern web applications?",
      options: ["Async/Await", "Callbacks", "Plain Promises", "setTimeout"],
      correctAnswer: 0,
      explanation: "Async/await provides cleaner, more readable code for handling asynchronous operations compared to callbacks or plain promises."
    },
    {
      id: 7,
      question: "Which security practice is most critical for protecting user data?",
      options: ["Input Validation", "Basic Authentication", "Console Logging", "Client-side Encryption"],
      correctAnswer: 0,
      explanation: "Input validation is the first line of defense against many common security vulnerabilities like SQL injection and XSS attacks."
    }
  ];

  // Randomly select and shuffle questions to ensure variety
  const shuffleArray = (array: any[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const allQuestions = [...commonQuestions, ...technicalQuestions];
  return shuffleArray(allQuestions).slice(0, 7);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { companyName, jobTitle } = await req.json()
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY')

    console.log('Generating questions for:', { companyName, jobTitle });
    console.log('OpenAI API Key available:', !!openAIApiKey);

    // If no API key is set, use enhanced mock data
    if (!openAIApiKey) {
      console.log('No OpenAI API key found, using mock questions');
      const mockQuestions = generateMockQuestions(companyName, jobTitle);
      return new Response(JSON.stringify(mockQuestions), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

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
