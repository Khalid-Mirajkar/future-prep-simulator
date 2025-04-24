
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useCompanyValidation() {
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [companyData, setCompanyData] = useState<{
    name: string;
    domain: string;
    logo: string;
  } | null>(null);

  const validateCompany = async (companyName: string) => {
    if (!companyName.trim()) {
      setValidationError('Company name is required');
      return false;
    }

    setIsValidating(true);
    setValidationError(null);

    try {
      const { data, error } = await supabase.functions.invoke('validate-company', {
        body: { companyName }
      });

      if (error || !data.valid) {
        setValidationError(data?.error || 'Unable to verify company');
        return false;
      }

      setCompanyData(data.company);
      return true;
    } catch (error) {
      setValidationError('An error occurred while validating the company');
      return false;
    } finally {
      setIsValidating(false);
    }
  };

  return {
    validateCompany,
    isValidating,
    validationError,
    companyData,
  };
}
