
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

// We don't need an API key anymore since we'll validate internally
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { companyName } = await req.json()
    
    // Input validation
    if (!companyName || typeof companyName !== 'string') {
      return new Response(
        JSON.stringify({ 
          valid: false, 
          error: 'Company name is required and must be a string' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (companyName.length > 100) {
      return new Response(
        JSON.stringify({ 
          valid: false, 
          error: 'Company name must be less than 100 characters' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Enhanced validation logic with a more extensive list of known companies
    const knownCompanies = {
      'google': { name: 'Google', domain: 'google.com', logo: 'https://logo.clearbit.com/google.com' },
      'microsoft': { name: 'Microsoft', domain: 'microsoft.com', logo: 'https://logo.clearbit.com/microsoft.com' },
      'amazon': { name: 'Amazon', domain: 'amazon.com', logo: 'https://logo.clearbit.com/amazon.com' },
      'apple': { name: 'Apple', domain: 'apple.com', logo: 'https://logo.clearbit.com/apple.com' },
      'facebook': { name: 'Facebook', domain: 'facebook.com', logo: 'https://logo.clearbit.com/facebook.com' },
      'meta': { name: 'Meta', domain: 'meta.com', logo: 'https://logo.clearbit.com/meta.com' },
      'netflix': { name: 'Netflix', domain: 'netflix.com', logo: 'https://logo.clearbit.com/netflix.com' },
      'twitter': { name: 'Twitter', domain: 'twitter.com', logo: 'https://logo.clearbit.com/twitter.com' },
      'linkedin': { name: 'LinkedIn', domain: 'linkedin.com', logo: 'https://logo.clearbit.com/linkedin.com' },
      'ibm': { name: 'IBM', domain: 'ibm.com', logo: 'https://logo.clearbit.com/ibm.com' },
      'oracle': { name: 'Oracle', domain: 'oracle.com', logo: 'https://logo.clearbit.com/oracle.com' },
      'intel': { name: 'Intel', domain: 'intel.com', logo: 'https://logo.clearbit.com/intel.com' },
      'adobe': { name: 'Adobe', domain: 'adobe.com', logo: 'https://logo.clearbit.com/adobe.com' },
      'salesforce': { name: 'Salesforce', domain: 'salesforce.com', logo: 'https://logo.clearbit.com/salesforce.com' },
      'tesla': { name: 'Tesla', domain: 'tesla.com', logo: 'https://logo.clearbit.com/tesla.com' },
      'uber': { name: 'Uber', domain: 'uber.com', logo: 'https://logo.clearbit.com/uber.com' },
      'lyft': { name: 'Lyft', domain: 'lyft.com', logo: 'https://logo.clearbit.com/lyft.com' },
      'airbnb': { name: 'Airbnb', domain: 'airbnb.com', logo: 'https://logo.clearbit.com/airbnb.com' },
      'spotify': { name: 'Spotify', domain: 'spotify.com', logo: 'https://logo.clearbit.com/spotify.com' },
      'stripe': { name: 'Stripe', domain: 'stripe.com', logo: 'https://logo.clearbit.com/stripe.com' },
      'square': { name: 'Square', domain: 'squareup.com', logo: 'https://logo.clearbit.com/squareup.com' },
      'dropbox': { name: 'Dropbox', domain: 'dropbox.com', logo: 'https://logo.clearbit.com/dropbox.com' },
      'slack': { name: 'Slack', domain: 'slack.com', logo: 'https://logo.clearbit.com/slack.com' },
      'zoom': { name: 'Zoom', domain: 'zoom.us', logo: 'https://logo.clearbit.com/zoom.us' },
      'twilio': { name: 'Twilio', domain: 'twilio.com', logo: 'https://logo.clearbit.com/twilio.com' }
    }
    
    const normalizedCompanyName = companyName.toLowerCase().trim()
    
    // Check if it's a known company
    if (knownCompanies[normalizedCompanyName]) {
      return new Response(
        JSON.stringify({
          valid: true,
          company: knownCompanies[normalizedCompanyName],
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }
    
    // For companies not in our list, perform a basic validation
    // Accept any company name that's at least 2 characters
    if (normalizedCompanyName.length >= 2) {
      // Generate a domain and logo from the company name
      const simplifiedName = normalizedCompanyName.replace(/[^a-z0-9]/g, '')
      const inferredDomain = `${simplifiedName}.com`
      
      return new Response(
        JSON.stringify({
          valid: true,
          company: {
            name: companyName, // Use the original casing
            domain: inferredDomain,
            logo: `https://logo.clearbit.com/${inferredDomain}`,
          },
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }
    
    // If company name is too short
    return new Response(
      JSON.stringify({ 
        valid: false, 
        error: 'Company name must be at least 2 characters.' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  } catch (error) {
    console.error(`Error validating company: ${error.message}`)
    
    return new Response(
      JSON.stringify({ 
        valid: false, 
        error: 'Unable to verify company. Please check the name and try again.' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
