
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
    const { cvText, industry, jobTitle, company, wordCount, isShortCV } = await req.json()
    
    // Input validation
    if (!cvText || typeof cvText !== 'string' || cvText.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'CV text is required and must be a non-empty string' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Limit CV text to 50KB (approximately 50,000 characters)
    if (cvText.length > 50000) {
      return new Response(
        JSON.stringify({ error: 'CV text is too large. Maximum size is 50KB' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!industry || typeof industry !== 'string' || industry.length > 100) {
      return new Response(
        JSON.stringify({ error: 'Invalid industry. Must be a string of max 100 characters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!jobTitle || typeof jobTitle !== 'string' || jobTitle.length > 100) {
      return new Response(
        JSON.stringify({ error: 'Invalid job title. Must be a string of max 100 characters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!company || typeof company !== 'string' || company.length > 100) {
      return new Response(
        JSON.stringify({ error: 'Invalid company. Must be a string of max 100 characters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    const prompt = `You are a world-class ATS resume reviewer, with expertise in HR recruitment, AI scoring systems, and job fit analysis.

Below is a resume submitted by the user, along with the role and company they are applying for:

• Industry: ${industry}
• Job Title: ${jobTitle}
• Target Company: ${company}
• Word Count: ${wordCount} words
• Is Short CV: ${isShortCV ? 'Yes' : 'No'}

Here is the parsed CV content:
${cvText}

Your tasks:

1. **ATS Compatibility Score** (Out of 100):
   - Evaluate how well the resume fits standard Applicant Tracking Systems.
   - Consider formatting, readability, keyword presence, layout, photo usage, colored elements, etc.
   - For short CVs, don't penalize too harshly but suggest improvements.

2. **Job Relevance Score** (Out of 100):
   - Based on the job title and company, assess how well the content aligns with expected skills, experience, and achievements for the role.
   - For short CVs, focus on potential and what's present rather than what's missing.

3. **Missing Keywords & Skills**:
   - List critical **keywords** not found in the resume that are common in top resumes for this job.
   - List important **skills** that should be added based on the role.
   - Always provide at least 3-5 suggestions even for short CVs.

4. **Improvement Suggestions**:
   - Provide at least 5 specific, actionable steps to improve the CV and increase both scores to 90+.
   - Focus on formatting, clarity, ATS-readiness, and role relevance.
   - For short CVs, prioritize content expansion strategies.

5. **AI-Generated Resume Summary**:
   - If the original CV has a summary, suggest a better version tailored to the job title and company.
   - If no summary is found, generate a professional summary using available candidate info and role requirements.
   - Always provide a summary, even if based on limited information.

6. **Red Flags**:
   - Identify any formatting issues, unprofessional elements, or ATS-unfriendly features.
   - For short CVs, focus on structural improvements rather than content gaps.

IMPORTANT: Never return "Unable to parse" or similar error messages. Always provide constructive feedback and suggestions, even for minimal input. If the CV is very short, focus on growth opportunities and potential rather than deficiencies.

Please respond in the following JSON format:
{
  "atsScore": number,
  "relevanceScore": number,
  "missingKeywords": string[],
  "missingSkills": string[],
  "redFlags": string[],
  "suggestions": string[],
  "revisedSummary": string,
  "overallFeedback": string,
  "wordCount": number,
  "isShortCV": boolean
}`

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
        max_tokens: 3000,
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
      
      // Ensure all required fields are present with fallbacks
      analysis = {
        atsScore: analysis.atsScore || 50,
        relevanceScore: analysis.relevanceScore || 50,
        missingKeywords: analysis.missingKeywords || ['Industry-specific terminology', 'Technical skills', 'Action verbs'],
        missingSkills: analysis.missingSkills || ['Communication', 'Problem-solving', 'Leadership'],
        redFlags: analysis.redFlags || [],
        suggestions: analysis.suggestions || [
          'Add more quantifiable achievements',
          'Include relevant technical skills',
          'Improve formatting for ATS compatibility',
          'Add a professional summary section',
          'Use industry-specific keywords'
        ],
        revisedSummary: analysis.revisedSummary || `Results-driven ${jobTitle} with experience in ${industry}. Seeking to leverage skills and expertise to contribute to ${company}'s success. Committed to delivering high-quality work and continuous professional development.`,
        overallFeedback: analysis.overallFeedback || 'Your CV shows potential. Focus on adding more specific achievements and technical skills relevant to your target role.',
        wordCount: wordCount,
        isShortCV: isShortCV
      }
    } catch (e) {
      console.error('JSON parsing failed, using fallback structure:', e)
      // Comprehensive fallback response
      analysis = {
        atsScore: isShortCV ? 45 : 55,
        relevanceScore: isShortCV ? 40 : 50,
        missingKeywords: [
          `${industry} terminology`,
          `${jobTitle} keywords`,
          'Technical expertise',
          'Industry standards',
          'Professional achievements'
        ],
        missingSkills: [
          'Leadership',
          'Communication',
          'Problem-solving',
          'Technical proficiency',
          'Project management'
        ],
        redFlags: isShortCV ? ['CV appears too brief - consider adding more content'] : ['Standard formatting could be improved'],
        suggestions: [
          'Expand your CV with more detailed work experience',
          'Add quantifiable achievements and metrics',
          'Include relevant technical skills and certifications',
          'Use action verbs to describe your responsibilities',
          'Optimize formatting for Applicant Tracking Systems',
          'Add a professional summary at the top'
        ],
        revisedSummary: `Dynamic ${jobTitle} with a passion for ${industry}. Eager to bring fresh perspectives and strong work ethic to ${company}. Committed to continuous learning and delivering exceptional results in fast-paced environments.`,
        overallFeedback: `Your CV has good potential! ${isShortCV ? 'Consider expanding it with more details about your experience and achievements. ' : ''}Focus on highlighting your unique value proposition and quantifying your impact in previous roles.`,
        wordCount: wordCount,
        isShortCV: isShortCV
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
    
    // Provide a helpful fallback even for errors
    const fallbackAnalysis = {
      atsScore: 40,
      relevanceScore: 35,
      missingKeywords: ['Technical skills', 'Industry keywords', 'Professional terminology'],
      missingSkills: ['Communication', 'Leadership', 'Problem-solving'],
      redFlags: ['Analysis could not be completed - please try uploading again'],
      suggestions: [
        'Ensure your PDF contains readable text',
        'Use a standard resume format',
        'Include relevant work experience',
        'Add technical skills section',
        'Include education and certifications'
      ],
      revisedSummary: 'Professional seeking opportunities to contribute expertise and grow within the organization.',
      overallFeedback: 'We encountered an issue analyzing your CV, but here are some general recommendations to improve your resume.',
      wordCount: 0,
      isShortCV: true
    }
    
    return new Response(
      JSON.stringify(fallbackAnalysis),
      { 
        status: 200, // Return 200 with fallback data instead of error
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})
