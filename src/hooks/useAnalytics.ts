
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface InterviewResult {
  id: string;
  score: number;
  total_questions: number;
  created_at: string;
  company_name: string | null;
  job_title: string | null;
}

export function useAnalytics() {
  return useQuery({
    queryKey: ['interview-results'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('interview_results')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as InterviewResult[];
    }
  });
}
