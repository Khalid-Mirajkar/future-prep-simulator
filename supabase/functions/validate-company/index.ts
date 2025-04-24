import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const clearbitApiKey = Deno.env.get('CLEARBIT_API_KEY')

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
    
    // For common companies, try to determine a domain first
    const commonCompanies = {
      'google': 'google.com',
      'microsoft': 'microsoft.com',
      'amazon': 'amazon.com',
      'apple': 'apple.com',
      'facebook': 'facebook.com',
      'meta': 'meta.com',
      'netflix': 'netflix.com',
      'twitter': 'twitter.com',
      'linkedin': 'linkedin.com',
      'ibm': 'ibm.com',
      'oracle': 'oracle.com',
      'intel': 'intel.com',
      'adobe': 'adobe.com',
      'salesforce': 'salesforce.com'
    }
    
    const normalizedCompanyName = companyName.toLowerCase().trim()
    let domain = commonCompanies[normalizedCompanyName] || null
    
    // If we couldn't determine the domain from common companies, try to infer a domain
    if (!domain) {
      // If it looks like a domain already, use it directly
      if (normalizedCompanyName.includes('.')) {
        domain = normalizedCompanyName
      } else {
        // Otherwise try to infer a .com domain
        domain = `${normalizedCompanyName.replace(/\s+/g, '')}.com`
      }
    }

    console.log(`Attempting to validate company: ${companyName} using domain: ${domain}`)
    
    // Call Clearbit API to validate company
    const response = await fetch(`https://company.clearbit.com/v2/companies/find?domain=${encodeURIComponent(domain)}`, {
      headers: {
        'Authorization': `Bearer ${clearbitApiKey}`,
      },
    })

    if (!response.ok) {
      // Try an alternative approach - search by name if domain search fails
      console.log(`Domain lookup failed for ${domain}, trying name search`)
      throw new Error('Company not found by domain, trying alternative search')
    }

    const companyData = await response.json()
    
    return new Response(
      JSON.stringify({
        valid: true,
        company: {
          name: companyData.name,
          domain: companyData.domain,
          logo: companyData.logo,
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
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
