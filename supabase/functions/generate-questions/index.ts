import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Generate mock questions with enhanced relevance based on job categories
const generateMockQuestions = (companyName: string, jobTitle: string, seed = Date.now()) => {
  console.log('Using mock questions for:', companyName, jobTitle, 'with seed:', seed);
  
  // Use seed for pseudo-random number generation
  const seededRandom = createSeededRandom(seed);
  
  // Identify job category for more relevant questions
  const jobTitleLower = jobTitle.toLowerCase();
  
  // Customer service related roles
  const isCustomerService = 
    jobTitleLower.includes('customer') || 
    jobTitleLower.includes('service') || 
    jobTitleLower.includes('support') || 
    jobTitleLower.includes('assistant') || 
    jobTitleLower.includes('representative') ||
    jobTitleLower.includes('cashier') ||
    jobTitleLower.includes('associate');
  
  // Technical/IT related roles
  const isTechnical = 
    jobTitleLower.includes('developer') || 
    jobTitleLower.includes('engineer') || 
    jobTitleLower.includes('programmer') || 
    jobTitleLower.includes('analyst') || 
    jobTitleLower.includes('architect') ||
    jobTitleLower.includes('tech');
  
  // Management related roles
  const isManagement = 
    jobTitleLower.includes('manager') || 
    jobTitleLower.includes('director') || 
    jobTitleLower.includes('supervisor') || 
    jobTitleLower.includes('lead') || 
    jobTitleLower.includes('chief');

  // Common questions for all roles - extended pool
  const commonQuestions = [
    {
      question: `Which of the following best describes ${companyName}'s primary business?`,
      options: getCompanySpecificOptions(companyName),
      explanation: `Understanding ${companyName}'s business is fundamental for any role within the company.`
    },
    {
      question: `What would you consider the most important quality for someone working at ${companyName}?`,
      options: ["Customer focus", "Attention to detail", "Teamwork", "Innovation"],
      explanation: "Most successful companies prioritize customer focus as their primary value."
    },
    {
      question: `Which of these values is most emphasized at companies like ${companyName}?`,
      options: ["Customer satisfaction", "Profit maximization", "Employee comfort", "Minimal training"],
      explanation: "Customer satisfaction is the cornerstone of successful service businesses."
    },
    {
      question: `During an interview at ${companyName}, how should you primarily present yourself?`,
      options: ["As customer-oriented and reliable", "As independent and innovative", "As technical and analytical", "As strongly opinionated"],
      explanation: "Service roles require customer orientation and reliability above all else."
    },
    {
      question: `Which type of experience would be most valuable for a role at ${companyName}?`,
      options: ["Previous customer-facing roles", "Advanced technical degrees", "Solo project work", "Theoretical knowledge"],
      explanation: "Practical experience in customer-facing positions demonstrates required skills for service roles."
    }
  ];

  // Customer service specific questions - extended pool
  const customerServiceQuestions = [
    {
      question: `A customer at ${companyName} is upset because their order is incorrect. What's the best first step?`,
      options: ["Apologize and listen to their concern", "Call the manager immediately", "Tell them mistakes happen", "Suggest they place a new order"],
      explanation: "The first step in handling customer complaints is to acknowledge their concerns and listen actively."
    },
    {
      question: `Which approach is most effective when handling a long queue of customers at ${companyName}?`,
      options: ["Acknowledge the wait and work efficiently", "Rush through each customer interaction", "Take your normal pace", "Ask customers to return later"],
      explanation: "Acknowledging the wait shows respect while maintaining efficiency helps reduce the queue."
    },
    {
      question: "What's the best way to handle a situation where you don't know the answer to a customer's question?",
      options: ["Say you'll find out and get back to them", "Make your best guess", "Tell them you don't know", "Change the subject"],
      explanation: "It's best to be honest about not knowing, while showing commitment to finding the right answer."
    },
    {
      question: `Which of these is NOT typically an acceptable policy for handling refunds at companies like ${companyName}?`,
      options: ["Making exceptions without manager approval", "Requiring a receipt", "Following company guidelines", "Explaining the refund policy"],
      explanation: "Following established protocols for refunds is important for consistency and financial accountability."
    },
    {
      question: `A colleague at ${companyName} is being rude to a customer. What should you do?`,
      options: ["Politely intervene and help the customer", "Ignore it as it's not your problem", "Join in to support your colleague", "Leave the area immediately"],
      explanation: "Customer service requires teamwork to ensure all customers are treated respectfully."
    },
    {
      question: "Which communication style is most effective when explaining menu options to a customer?",
      options: ["Clear, friendly and patient", "Technical and detailed", "Quick and minimal", "Formal and businesslike"],
      explanation: "Clear, friendly communication ensures customers understand their options and feel valued."
    },
    {
      question: `What's the most important information to verify when taking a food order at ${companyName}?`,
      options: ["Order accuracy and any special requests", "Customer's name and contact details", "How they heard about the business", "Their past ordering history"],
      explanation: "Order accuracy is crucial to customer satisfaction and efficient service."
    },
    {
      question: "Which of the following would be most appropriate when a customer complains about wait time?",
      options: ["Apologize and explain the current situation", "Tell them other customers are waiting too", "Suggest they order something simpler", "Ignore the complaint"],
      explanation: "Acknowledging the issue with an explanation shows respect while managing expectations."
    },
    {
      question: "How should you respond to a customer who is speaking rudely to you?",
      options: ["Remain calm and professional", "Match their tone to show confidence", "Walk away from the situation", "Call security immediately"],
      explanation: "Maintaining professionalism during difficult interactions is key to de-escalation."
    },
    {
      question: `What's the most important safety practice for food handlers at ${companyName}?`,
      options: ["Proper handwashing", "Working quickly", "Keeping conversations minimal", "Focusing only on cleanliness"],
      explanation: "Handwashing prevents contamination and is the foundation of food safety practices."
    },
    {
      question: "Which approach is best when training new employees?",
      options: ["Patient explanation with demonstration", "Providing written materials only", "Letting them learn by making mistakes", "Minimal interaction"],
      explanation: "Combining explanation with demonstration provides the most effective learning experience."
    },
    {
      question: "What is the appropriate way to handle cash transactions?",
      options: ["Count money carefully in front of the customer", "Count quickly to save time", "Count only after the customer leaves", "Trust the customer's count"],
      explanation: "Counting money in front of customers ensures transparency and minimizes errors."
    },
    {
      question: "How can you best assist customers with dietary restrictions?",
      options: ["Know ingredient information and available substitutions", "Tell them to check online", "Suggest they order something else", "Ask them to speak to the chef"],
      explanation: "Having knowledge of ingredients helps provide safe and satisfactory service to all customers."
    },
    {
      question: "When is it appropriate to offer additional menu items to a customer?",
      options: ["After they've made their primary selection", "Before they've decided", "When they're paying", "If they look indecisive"],
      explanation: "Suggesting additional items after the main selection avoids confusion and enhances the customer experience."
    }
  ];

  // Technical specific questions
  const technicalQuestions = [
    {
      question: "Which design pattern would be most appropriate for implementing a notification system?",
      options: ["Observer", "Singleton", "Factory", "Decorator"],
      explanation: "The Observer pattern is ideal for implementing notification systems where multiple objects need to be notified of state changes."
    },
    {
      question: "What is the most efficient data structure for implementing a cache?",
      options: ["Hash Map", "Linked List", "Array", "Binary Tree"],
      explanation: "Hash Maps provide O(1) average time complexity for lookups, making them ideal for cache implementations."
    },
    {
      question: "Which testing approach should be prioritized in a CI/CD pipeline?",
      options: ["Unit Testing", "Manual Testing", "End-to-End Testing", "Stress Testing"],
      explanation: "Unit tests are fundamental to CI/CD pipelines as they provide fast feedback and catch issues early."
    },
    {
      question: "What is the recommended approach for handling asynchronous operations in modern web applications?",
      options: ["Async/Await", "Callbacks", "Plain Promises", "setTimeout"],
      explanation: "Async/await provides cleaner, more readable code for handling asynchronous operations compared to callbacks or plain promises."
    },
    {
      question: "Which security practice is most critical for protecting user data?",
      options: ["Input Validation", "Basic Authentication", "Console Logging", "Client-side Encryption"],
      explanation: "Input validation is the first line of defense against many common security vulnerabilities like SQL injection and XSS attacks."
    }
  ];

  // Management specific questions
  const managementQuestions = [
    {
      question: `When leading a team at ${companyName}, what's the most effective approach for introducing a new process?`,
      options: ["Explain the benefits and provide training", "Send an email with the new guidelines", "Implement immediately", "Let team members figure it out"],
      explanation: "Change management is most effective when benefits are clear and proper training is provided."
    },
    {
      question: `How should a ${jobTitle} at ${companyName} best handle conflict between team members?`,
      options: ["Meet privately with each person to understand perspectives", "Ignore it unless performance suffers", "Take sides with who you think is right", "Address it in a team meeting"],
      explanation: "Private conversations allow for understanding different perspectives before attempting resolution."
    },
    {
      question: `What's the most important factor when scheduling staff at a busy ${companyName} location?`,
      options: ["Balance of skill levels across all shifts", "Staff preferences", "Minimizing labor costs", "Keeping the same teams together"],
      explanation: "Ensuring each shift has the right mix of experience and skills helps maintain service quality."
    },
    {
      question: "Which approach to employee feedback is most effective for improving performance?",
      options: ["Regular, specific and balanced feedback", "Annual formal reviews", "Addressing issues as they become serious", "Focusing primarily on areas for improvement"],
      explanation: "Regular and specific feedback that includes both strengths and development areas helps employees grow."
    },
    {
      question: `What's the best way to handle a situation where ${companyName} is understaffed during a busy period?`,
      options: ["Prioritize critical tasks and communicate with customers", "Call employees who are off-duty", "Focus only on the fastest transactions", "Turn away excess customers"],
      explanation: "Prioritization and transparent communication help manage customer expectations when resources are limited."
    }
  ];

  // Choose appropriate question set based on job category
  let jobSpecificQuestions = [];
  if (isCustomerService) {
    jobSpecificQuestions = customerServiceQuestions;
  } else if (isTechnical) {
    jobSpecificQuestions = technicalQuestions;
  } else if (isManagement) {
    jobSpecificQuestions = managementQuestions;
  } else {
    // For other job types, use a mix of customer service and general questions
    jobSpecificQuestions = customerServiceQuestions.slice(0, 5);
  }

  // Seeded random number generator
  function createSeededRandom(seed: number) {
    return function() {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
  }

  // Shuffle array using seeded random function
  const shuffleArray = (array: any[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(seededRandom() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Randomize the correct answer for each question
  const randomizeCorrectAnswer = (question: any) => {
    const options = [...question.options];
    const correctAnswer = Math.floor(seededRandom() * 4); // Random index between 0-3
    const correctOption = options[0]; // The first option was originally the correct one
    
    // Swap the correct answer to the random position
    options[0] = options[correctAnswer];
    options[correctAnswer] = correctOption;
    
    return {
      ...question,
      options: options,
      correctAnswer: correctAnswer
    };
  };

  // Combine, randomize correct answers, and select questions
  const allQuestionsPool = [...commonQuestions, ...shuffleArray(jobSpecificQuestions)];
  const shuffledPool = shuffleArray(allQuestionsPool);
  
  // Select questions and add IDs
  const selectedQuestions = shuffledPool.slice(0, 7).map((q, index) => {
    const questionWithRandomAnswer = randomizeCorrectAnswer(q);
    return {
      id: index + 1,
      ...questionWithRandomAnswer
    };
  });
  
  return selectedQuestions;
};

// Helper function to generate company-specific options for the first question
function getCompanySpecificOptions(companyName: string): string[] {
  const companyLower = companyName.toLowerCase();
  
  if (companyLower.includes('mcdonalds')) {
    return ["Fast food restaurant", "Grocery store", "Electronics retailer", "Car manufacturer"];
  }
  else if (companyLower.includes('amazon')) {
    return ["E-commerce and cloud computing", "Social media platform", "Fast food chain", "Automobile manufacturer"];
  }
  else if (companyLower.includes('google')) {
    return ["Technology and online services", "Fast food restaurant", "Banking services", "Clothing retailer"];
  }
  else if (companyLower.includes('apple')) {
    return ["Consumer electronics and software", "Grocery store chain", "Online marketplace", "Clothing brand"];
  }
  else if (companyLower.includes('microsoft')) {
    return ["Software and technology", "Food delivery service", "Furniture retailer", "Hotel chain"];
  }
  else if (companyLower.includes('walmart')) {
    return ["Retail and grocery", "Streaming service", "Social media platform", "Car manufacturer"];
  }
  else if (companyLower.includes('netflix')) {
    return ["Streaming entertainment service", "Fast food restaurant", "Retail store", "Financial institution"];
  }
  else if (companyLower.includes('starbucks')) {
    return ["Coffee shop chain", "Fast food restaurant", "Grocery store", "Tech company"];
  }
  else if (companyLower.includes('target')) {
    return ["Retail store", "Online marketplace", "Restaurant chain", "Automotive service"];
  }
  else if (companyLower.includes('subway')) {
    return ["Fast food sandwich restaurant", "Public transportation", "Electronics retailer", "Clothing brand"];
  }
  // Default options for any other company
  return ["Customer service", "Software development", "Financial services", "Manufacturing"];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { companyName, jobTitle, seed } = await req.json()
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY')

    console.log('Generating questions for:', { companyName, jobTitle, seed });
    console.log('OpenAI API Key available:', !!openAIApiKey);

    // If no API key is set, use enhanced mock data
    if (!openAIApiKey) {
      console.log('No OpenAI API key found, using mock questions');
      const mockQuestions = generateMockQuestions(companyName, jobTitle, seed);
      return new Response(JSON.stringify(mockQuestions), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const prompt = `Generate 7 multiple-choice questions for a ${jobTitle} role at ${companyName}. 
    The questions must be highly relevant to this specific job role and company. DO NOT create generic technical questions unless the job specifically requires technical knowledge.
    
    For example, for customer service roles, ask about handling customers, resolving complaints, and company-specific policies.
    For technical roles, ask about relevant technologies and methodologies.
    For management roles, ask about leadership, team management, and decision making.
    
    Format the response as a JSON array with the following structure for each question:
    {
      "question": "the question text",
      "options": ["option1", "option2", "option3", "option4"],
      "correctAnswer": 0, // index of correct answer (0-3)
      "explanation": "explanation why this answer is correct"
    }
    
    Questions should:
    - Be tailored specifically for a ${jobTitle} at ${companyName}
    - Cover key skills and knowledge required for this exact role
    - Range from beginner to intermediate difficulty
    - Have EXACTLY four options for each question
    - Have one correct answer and three plausible distractors
    - Include a clear explanation for the correct answer
    - AVOID technical programming questions for non-technical roles
    
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
          { role: 'system', content: 'You are a specialized job interview question creator, focused on creating highly relevant multiple-choice questions tailored to specific job roles and companies.' },
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
      
      // Validate that each question has exactly 4 options
      for (const q of questions) {
        if (!q.options || !Array.isArray(q.options) || q.options.length !== 4) {
          console.error('Question has invalid options:', q)
          q.options = q.options || []
          // Fill in missing options if needed
          while (q.options.length < 4) {
            q.options.push(`Option ${q.options.length + 1}`)
          }
          // Trim excess options if needed
          if (q.options.length > 4) {
            q.options = q.options.slice(0, 4)
          }
        }
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
    
    // Shuffle questions with seed
    const shuffleWithSeed = (array: any[], seedVal = seed || Date.now()) => {
      const seededRandom = () => {
        seedVal = (seedVal * 9301 + 49297) % 233280;
        return seedVal / 233280;
      };
      
      const shuffled = [...array];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(seededRandom() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    };
    
    const shuffledQuestions = shuffleWithSeed(questionsWithIds);
    console.log('Successfully generated questions:', shuffledQuestions.length);

    // Use mock data as fallback in case of empty response or other issues
    if (shuffledQuestions.length < 3) {
      console.log('OpenAI returned too few questions, using mock questions instead');
      const mockQuestions = generateMockQuestions(companyName, jobTitle, seed);
      return new Response(JSON.stringify(mockQuestions), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(shuffledQuestions), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error generating questions:', error)
    // Use mock questions as fallback in case of any error
    try {
      const { companyName, jobTitle, seed } = await req.json();
      const mockQuestions = generateMockQuestions(companyName, jobTitle, seed);
      console.log('Error occurred, falling back to mock questions');
      
      return new Response(JSON.stringify(mockQuestions), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (fallbackError) {
      console.error('Error generating fallback questions:', fallbackError);
      return new Response(
        JSON.stringify({ error: 'Failed to generate questions' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
  }
})
