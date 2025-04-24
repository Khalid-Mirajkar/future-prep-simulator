
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
      console.log('Validating company:', companyName);
      
      const { data, error } = await supabase.functions.invoke('validate-company', {
        body: { companyName }
      });
      
      console.log('Validation response:', data, error);

      if (error) {
        console.error('Supabase function error:', error);
        setValidationError('An error occurred while validating the company');
        setCompanyData(null);
        return false;
      }

      if (!data.valid) {
        setValidationError(data?.error || 'Unable to verify company');
        setCompanyData(null);
        return false;
      }

      setCompanyData(data.company);
      return true;
    } catch (error) {
      console.error('Validation error:', error);
      setValidationError('An error occurred while validating the company');
      setCompanyData(null);
      return false;
    } finally {
      setIsValidating(false);
    }
  };

  const clearValidation = () => {
    setValidationError(null);
    setCompanyData(null);
  };

  return {
    validateCompany,
    clearValidation,
    isValidating,
    validationError,
    companyData,
  };
}
