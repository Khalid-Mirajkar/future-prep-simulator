
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
    const { companyName, jobTitle, seed } = await req.json()
    
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

    // Set up OpenAI client
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) {
      console.error("Missing OpenAI API key");
      return new Response(
        JSON.stringify({ error: "OpenAI API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

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

    // Create an appropriate prompt based on job category
    let promptBase = `Generate 10 multiple choice interview questions with 4 options each for a ${jobTitle} position at ${companyName}. `;

    switch (jobCategory) {
      case "technical":
        promptBase += "Focus on technical skills, problem-solving abilities, and relevant technologies, but avoid overly complex coding questions or highly specialized knowledge unless directly relevant to the job title.";
        break;
      case "management":
        promptBase += "Focus on leadership, team management, conflict resolution, strategic thinking, and relevant business metrics.";
        break;
      case "customer_service":
        promptBase += "Focus on customer interactions, conflict resolution, company policies, product knowledge, and service quality. Questions should be practical and scenario-based, not technical.";
        break;
      default:
        promptBase += "Focus on soft skills, company culture fit, and general job knowledge. Keep questions practical and relevant to day-to-day job responsibilities.";
    }

    promptBase += `
    
    Return the response as a JSON array with each question having the following structure:
    {
      "id": number,
      "question": "Question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": number from 0-3 representing the index of the correct option,
      "explanation": "Explanation of why this is the correct answer"
    }
    
    IMPORTANT RULES:
    1. Every question MUST have EXACTLY 4 options - no more, no fewer.
    2. The correctAnswer should be RANDOMLY distributed (not always the same position).
    3. Questions must be HIGHLY RELEVANT to both the job title and company.
    4. Make the questions challenging but fair.
    5. Include company-specific knowledge where appropriate.
    6. Avoid questions that require deep specialized knowledge unless directly relevant to the role.
    7. For customer service roles, focus on practical scenarios, NOT technical questions.
    8. Seed: ${seed} (use this to generate different questions).
    `;

    console.log("Calling OpenAI API with prompt");
    
    try {
      // Make the API call to OpenAI using the updated SDK format
      const chatCompletion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        temperature: 0.7,
        messages: [
          { role: "system", content: "You are an expert job interview coach who creates realistic interview questions." },
          { role: "user", content: promptBase }
        ],
      });

      // Extract content from the response
      const content = chatCompletion.choices[0].message.content;
      
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
            q.explanation = "This is the most appropriate answer for this situation.";
          }
          
          return q;
        });
        
        console.log(`Successfully generated ${questions.length} questions`);
      } catch (error) {
        console.error('Error parsing questions:', error);
        return new Response(
          JSON.stringify({ error: "Failed to parse questions" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Return the questions
      return new Response(
        JSON.stringify(questions),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );

    } catch (error: any) {
      console.error('Error calling OpenAI API:', error);
      
      // Check if it's a quota exceeded error
      if (error.status === 429 || (error.error && error.error.type === "insufficient_quota")) {
        return new Response(
          JSON.stringify({ 
            error: "OpenAI API quota exceeded. Please update your API key or try again later.",
            code: "insufficient_quota"
          }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Handle other potential OpenAI API errors
      return new Response(
        JSON.stringify({ 
          error: "Error generating questions with OpenAI API. Please try again.",
          details: error.message
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
  } catch (error) {
    console.error('Error in generate-questions function:', error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
})
