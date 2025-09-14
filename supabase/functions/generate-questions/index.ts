
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.5"
import OpenAI from "https://esm.sh/openai@4.12.1"

// CORS headers for browser access
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    })
  }

  try {
    // Parse the request body
    const { companyName, jobTitle, seed, numberOfQuestions = "10" } = await req.json()
    
    // Validate inputs
    if (!companyName || !jobTitle) {
      return new Response(
        JSON.stringify({ error: "Missing company name or job title" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // Define categories of companies and compatible job types
    const companyTypes = {
      "tech": ["Google", "Microsoft", "Apple", "Amazon", "Facebook", "Meta", "Twitter", "LinkedIn", "Netflix", "Spotify"],
      "food": ["McDonald's", "Burger King", "Wendy's", "Starbucks", "Subway", "Domino's", "KFC", "Pizza Hut", "Chipotle", "Taco Bell"],
      "retail": ["Walmart", "Target", "Costco", "Home Depot", "Best Buy", "Macy's", "Nike", "Adidas", "Ikea", "Lowe's"],
      "finance": ["JPMorgan Chase", "Bank of America", "Wells Fargo", "Citigroup", "Goldman Sachs", "Morgan Stanley", "Visa", "Mastercard", "American Express", "Capital One"]
    };

    // Define compatible job categories for company types
    const compatibleJobs = {
      "tech": ["Software Engineer", "Product Manager", "UX Designer", "Data Scientist", "DevOps Engineer", "QA Engineer", "Technical Writer", "IT Support", "Network Administrator", "Security Analyst"],
      "food": ["Server", "Chef", "Baker", "Barista", "Cashier", "Host", "Food Runner", "Line Cook", "Restaurant Manager", "Dishwasher"],
      "retail": ["Sales Associate", "Store Manager", "Cashier", "Customer Service Representative", "Visual Merchandiser", "Inventory Specialist", "Loss Prevention Officer", "Retail Buyer", "Warehouse Associate", "Floor Supervisor"],
      "finance": ["Financial Analyst", "Investment Banker", "Accountant", "Loan Officer", "Financial Advisor", "Auditor", "Risk Manager", "Compliance Officer", "Credit Analyst", "Trader"]
    };

    // Find company type
    let companyType = null;
    for (const [type, companies] of Object.entries(companyTypes)) {
      if (companies.some(company => companyName.toLowerCase().includes(company.toLowerCase()))) {
        companyType = type;
        break;
      }
    }

    // Check job compatibility
    let isCompatible = true;
    let failureMessage = null;
    
    if (companyType) {
      // For known company types, check if job is compatible
      const jobMatch = compatibleJobs[companyType].some(job => 
        jobTitle.toLowerCase().includes(job.toLowerCase()) || 
        job.toLowerCase().includes(jobTitle.toLowerCase())
      );
      
      if (!jobMatch) {
        isCompatible = false;
        failureMessage = `The role "${jobTitle}" is not typically found at a ${companyType} company like ${companyName}.`;
      }
    }

    // If job-company pair is not compatible, return a descriptive error
    if (!isCompatible) {
      return new Response(
        JSON.stringify([
          {
            id: 1,
            question: `This seems to be an unusual job-company combination. ${failureMessage} Would you like to try a different job role that might be more suited for ${companyName}?`,
            options: ["Try a different job role"],
            correctAnswer: 0,
            explanation: "It's important to research and apply for roles that align with the company's industry and services."
          }
        ]),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Try multiple possible API key formats and names
    let openaiApiKey = Deno.env.get("OPENAI_API_KEY") || 
                       Deno.env.get("OPENAI_API") || 
                       Deno.env.get("Open AI API") || 
                       Deno.env.get("OPEN_AI_API_KEY");
    
    // Debug information about available environment variables
    const envVars = Object.keys(Deno.env.toObject()).filter(key => !key.startsWith("SUPABASE_"));
    console.log("Available non-Supabase environment variables:", envVars);
    
    // Remove any potential whitespace from the key
    if (openaiApiKey) {
      openaiApiKey = openaiApiKey.trim();
      console.log("OpenAI API key found with length:", openaiApiKey.length);
      console.log("API key prefix:", openaiApiKey.substring(0, 5) + "...");
    } else {
      console.error("Missing OpenAI API key - Available env vars:", envVars);
      return new Response(
        JSON.stringify({ 
          error: "OpenAI API key not found in environment variables", 
          details: "Please add your OpenAI API key to the Edge Function secrets with the name 'OPENAI_API_KEY'",
          availableSecrets: envVars
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify the API key format
    if (!openaiApiKey.startsWith("sk-")) {
      return new Response(
        JSON.stringify({ 
          error: "Invalid OpenAI API key format", 
          details: "API key should start with 'sk-'. Please check the key in your Edge Function secrets."
        }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    try {
      const openai = new OpenAI({
        apiKey: openaiApiKey,
      });

      // Categorize job for relevant question generation
      let jobCategory = "general";
      if (jobTitle.toLowerCase().includes("manager") || 
          jobTitle.toLowerCase().includes("director") || 
          jobTitle.toLowerCase().includes("lead")) {
        jobCategory = "management";
      } else if (jobTitle.toLowerCase().includes("engineer") || 
                 jobTitle.toLowerCase().includes("developer") || 
                 jobTitle.toLowerCase().includes("programmer") || 
                 jobTitle.toLowerCase().includes("data") || 
                 jobTitle.toLowerCase().includes("tech")) {
        jobCategory = "technical";
      } else if (jobTitle.toLowerCase().includes("service") || 
                 jobTitle.toLowerCase().includes("support") || 
                 jobTitle.toLowerCase().includes("representative") || 
                 jobTitle.toLowerCase().includes("cashier") || 
                 jobTitle.toLowerCase().includes("sales") ||
                 jobTitle.toLowerCase().includes("server") ||
                 jobTitle.toLowerCase().includes("assistant") ||
                 jobTitle.toLowerCase().includes("baker") ||
                 jobTitle.toLowerCase().includes("barista") ||
                 jobTitle.toLowerCase().includes("chef")) {
        jobCategory = "customer_service";
      }

      // Create an improved prompt based on job category that focuses on realistic interview questions
      const numQuestions = parseInt(numberOfQuestions) || 10;
      let promptBase = `Generate ${numQuestions} multiple choice interview questions for a ${jobTitle} position at ${companyName}.

QUESTION TYPES TO INCLUDE (distribute evenly):
1. Behavioral questions (teamwork, communication, adaptability)
2. Situational/decision-making questions (role-specific scenarios)
3. Light conceptual knowledge (no deep technical questions)
4. Communication & collaboration skills

FOCUS AREAS:
- Real interview-style questions that assess fit for the role
- Questions that reveal the candidate's soft skills and decision-making
- Company culture alignment for ${companyName}
- Role-specific scenarios a ${jobTitle} would encounter

ABSOLUTELY AVOID:
- Quiz-style technical questions
- Computer science exam questions
- Algorithm details or low-level coding questions
- Questions that feel like university exams

Each question MUST have 4 options with one correct answer and 3 plausible distractors.
Include a brief explanation of why the correct answer aligns with what interviewers look for.`;

      switch (jobCategory) {
        case "technical":
          promptBase += `
          
For technical roles, focus on:
- Problem-solving approach rather than specific algorithms
- Communication of technical concepts
- Handling of technical disagreements
- Prioritization of technical tasks
- Very light domain knowledge (no deep CS theory)`;
          break;
        case "management":
          promptBase += `
          
For management roles, focus on:
- Leadership style and team management
- Conflict resolution approaches
- Resource allocation and prioritization
- Performance management
- Strategic thinking and decision-making`;
          break;
        case "customer_service":
          promptBase += `
          
For customer service roles, focus on:
- Handling difficult customer interactions
- Prioritizing service requests
- Communication style and tone
- Problem-solving in service contexts
- Maintaining service quality under pressure`;
          break;
        default:
          promptBase += `
          
Focus on:
- Role-specific situations
- Professional communication and teamwork
- Adaptability and problem-solving
- Work style and priorities
- Company culture alignment`;
      }

      promptBase += `
      
      Return the response as a JSON array with each question having the following structure:
      {
        "id": number,
        "question": "Question text",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correctAnswer": number from 0-3 representing the index of the correct option,
        "explanation": "Explanation of why this is the best answer from an interviewer's perspective"
      }
      
      IMPORTANT RULES:
      1. Every question MUST have EXACTLY 4 options - no more, no fewer.
      2. The correctAnswer should be RANDOMLY distributed (not always the same position).
      3. Questions must be HIGHLY RELEVANT to both the job title and company.
      4. The questions should feel like a REAL INTERVIEW, not a knowledge test.
      5. Include company-specific context where appropriate.
      6. Seed: ${seed} (use this to generate different questions).
      `;

      console.log("Calling OpenAI API with prompt");
      
      try {
        // Use a cost-effective model with retry logic
        let chatCompletion = null;
        let attempts = 0;
        const maxAttempts = 3;
        
        while (attempts < maxAttempts && !chatCompletion) {
          try {
            attempts++;
            // Try with gpt-4o-mini first as it's more cost-effective
            chatCompletion = await openai.chat.completions.create({
              model: "gpt-4o-mini",
              temperature: 0.7,
              messages: [
                { role: "system", content: "You are an expert job interviewer who creates realistic interview questions." },
                { role: "user", content: promptBase }
              ],
            });
          } catch (modelError) {
            console.log(`Attempt ${attempts} failed with model gpt-4o-mini:`, modelError.message);
            
            // If we've tried all attempts with the primary model, try a fallback
            if (attempts === maxAttempts) {
              console.log("Trying fallback to gpt-3.5-turbo model");
              chatCompletion = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                temperature: 0.7,
                messages: [
                  { role: "system", content: "You are an expert job interviewer who creates realistic interview questions." },
                  { role: "user", content: promptBase }
                ],
              });
            }
          }
        }

        if (!chatCompletion) {
          throw new Error("Failed to generate questions after multiple attempts");
        }

        // Extract content from the response
        const content = chatCompletion.choices[0].message.content;
        console.log("Successfully received response from OpenAI");
        
        // Parse the JSON from the content
        let questions = [];
        try {
          // Extract JSON from the content (it might be wrapped in markdown code blocks)
          let jsonContent = content || "";
          if (jsonContent.includes('```json')) {
            jsonContent = jsonContent.split('```json')[1].split('```')[0].trim();
          } else if (jsonContent.includes('```')) {
            jsonContent = jsonContent.split('```')[1].split('```')[0].trim();
          }
          
          questions = JSON.parse(jsonContent);
          console.log(`Successfully parsed ${questions.length} questions`);
          
          // Validate the questions format
          questions = questions.map((q, index) => {
            // Ensure each question has an ID
            if (!q.id) {
              q.id = index + 1;
            }
            
            // Ensure there are exactly 4 options
            if (!q.options || q.options.length !== 4) {
              console.warn(`Question ${q.id} has ${q.options?.length || 0} options, fixing...`);
              q.options = q.options || [];
              while (q.options.length < 4) {
                q.options.push(`Option ${q.options.length + 1}`);
              }
              q.options = q.options.slice(0, 4);
            }
            
            // Ensure there is a valid correct answer
            if (q.correctAnswer === undefined || q.correctAnswer === null || 
                q.correctAnswer < 0 || q.correctAnswer > 3) {
              console.warn(`Question ${q.id} has invalid correctAnswer, fixing...`);
              q.correctAnswer = Math.floor(Math.random() * 4); // Random index between 0-3
            }
            
            // Ensure there is an explanation
            if (!q.explanation) {
              q.explanation = "This is the most appropriate answer for this interview question.";
            }
            
            return q;
          });
          
        } catch (error) {
          console.error('Error parsing questions:', error);
          console.error('Raw content:', content);
          return new Response(
            JSON.stringify({ 
              error: "Failed to parse questions from OpenAI response",
              details: error.message,
              rawContent: content
            }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Return the questions
        return new Response(
          JSON.stringify(questions),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );

      } catch (error) {
        console.error('Error calling OpenAI API:', error);
        
        // Print more detailed error info to help diagnose
        const errorDetails = JSON.stringify(error, Object.getOwnPropertyNames(error));
        console.error("Detailed error:", errorDetails);
        
        // Check if it's a quota exceeded error
        if (error.status === 429 || (error.error && error.error.type === "insufficient_quota")) {
          return new Response(
            JSON.stringify({ 
              error: "OpenAI API quota exceeded. Please check your billing details or try again later.",
              code: "insufficient_quota",
              details: error.message || "You have exceeded your current quota",
              resolution: "Please check that your OpenAI account is properly set up for billing and has available credits."
            }),
            { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        // Handle authentication errors
        if (error.status === 401 || error.status === 403 || 
            (error.error && (error.error.type === "invalid_request_error" || error.error.type === "authentication_error"))) {
          return new Response(
            JSON.stringify({ 
              error: "Invalid OpenAI API key. Please check your API key and update it in the Edge Function secrets.",
              code: "authentication_error",
              details: error.message || "Authentication failed",
              resolution: "Make sure your API key is valid, starts with 'sk-', and doesn't have any extra whitespace."
            }),
            { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        // Handle other potential OpenAI API errors
        return new Response(
          JSON.stringify({ 
            error: "Error generating questions with OpenAI API. Please try again.",
            details: error.message,
            code: error.error?.type || "error"
          }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
    } catch (error) {
      // Handle OpenAI initialization errors
      console.error('Error initializing OpenAI client:', error);
      return new Response(
        JSON.stringify({ 
          error: "Failed to initialize OpenAI client", 
          details: error.message 
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
  } catch (error) {
    console.error('Error in generate-questions function:', error);
    return new Response(
      JSON.stringify({ 
        error: "Internal server error", 
        details: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
})
