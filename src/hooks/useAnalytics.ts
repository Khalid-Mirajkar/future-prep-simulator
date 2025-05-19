
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface InterviewResult {
  id: string;
  score: number;
  total_questions: number;
  created_at: string;
  company_name: string | null;
  job_title: string | null;
  time_seconds: number | null;
}

export interface AnalyticsSummary {
  totalInterviews: number;
  averageScore: number;
  bestScore: number;
  averageTimeSeconds: number;
  recentCompanies: string[];
  recentJobTitles: string[];
  scoreByDate: {
    date: string;
    score: number;
  }[];
  scoreByCompany: {
    company: string;
    averageScore: number;
    count: number;
  }[];
}

export function useAnalytics() {
  const { user } = useAuth();
  
  const fetchResults = async (): Promise<InterviewResult[]> => {
    if (!user) return [];
    
    const { data, error } = await supabase
      .from('interview_results')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as InterviewResult[];
  };
  
  const calculateAnalytics = (data: InterviewResult[]): AnalyticsSummary => {
    if (!data || data.length === 0) {
      return {
        totalInterviews: 0,
        averageScore: 0,
        bestScore: 0,
        averageTimeSeconds: 0,
        recentCompanies: [],
        recentJobTitles: [],
        scoreByDate: [],
        scoreByCompany: []
      };
    }
    
    // Calculate total and average scores
    const totalInterviews = data.length;
    const totalScorePercentage = data.reduce((sum, result) => 
      sum + (result.score / result.total_questions * 100), 0);
    const averageScore = totalScorePercentage / totalInterviews;
    
    // Calculate average time
    const resultsWithTime = data.filter(result => result.time_seconds != null);
    const averageTimeSeconds = resultsWithTime.length > 0 
      ? resultsWithTime.reduce((sum, result) => sum + (result.time_seconds || 0), 0) / resultsWithTime.length
      : 0;
    
    // Find best score
    const bestScorePercentage = Math.max(...data.map(result => 
      (result.score / result.total_questions * 100)));
    
    // Get recent unique companies and job titles (last 5 of each)
    const recentCompanies = [...new Set(
      data.filter(r => r.company_name)
         .map(r => r.company_name as string)
    )].slice(0, 5);
    
    const recentJobTitles = [...new Set(
      data.filter(r => r.job_title)
         .map(r => r.job_title as string)
    )].slice(0, 5);
    
    // Score by date
    const scoreByDate = data.map(result => ({
      date: new Date(result.created_at).toLocaleDateString(),
      score: (result.score / result.total_questions * 100)
    })).slice(0, 10).reverse(); // Last 10 interviews in chronological order
    
    // Score by company
    const companiesMap = new Map<string, {total: number, count: number}>();
    
    data.forEach(result => {
      if (!result.company_name) return;
      
      const company = result.company_name;
      const score = (result.score / result.total_questions * 100);
      
      if (companiesMap.has(company)) {
        const existing = companiesMap.get(company)!;
        companiesMap.set(company, {
          total: existing.total + score,
          count: existing.count + 1
        });
      } else {
        companiesMap.set(company, {
          total: score,
          count: 1
        });
      }
    });
    
    const scoreByCompany = Array.from(companiesMap.entries())
      .map(([company, {total, count}]) => ({
        company,
        averageScore: total / count,
        count
      }))
      .sort((a, b) => b.count - a.count); // Sort by most interviews
    
    return {
      totalInterviews,
      averageScore,
      bestScore: bestScorePercentage,
      averageTimeSeconds,
      recentCompanies,
      recentJobTitles,
      scoreByDate,
      scoreByCompany
    };
  };

  const result = useQuery({
    queryKey: ['interview-results', user?.id],
    queryFn: fetchResults,
    enabled: !!user
  });
  
  const analytics = result.data ? calculateAnalytics(result.data) : undefined;

  return {
    ...result,
    analytics
  };
}
