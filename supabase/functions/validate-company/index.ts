
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
    
    // Call Clearbit API to validate company
    const response = await fetch(`https://company.clearbit.com/v2/companies/find?domain=${encodeURIComponent(companyName)}`, {
      headers: {
        'Authorization': `Bearer ${clearbitApiKey}`,
      },
    })

    if (!response.ok) {
      throw new Error('Company not found')
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
