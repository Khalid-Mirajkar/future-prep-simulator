
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CVAnalysisResult {
  atsScore: number;
  relevanceScore: number;
  missingKeywords: string[];
  redFlags: string[];
  suggestions: string[];
  revisedSummary: string;
  overallFeedback: string;
}

interface CVAnalysisData {
  id: string;
  industry: string;
  job_title: string;
  company: string;
  ats_score: number;
  analysis_result: CVAnalysisResult;
  created_at: string;
}

export const useCVAnalysis = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<CVAnalysisResult | null>(null);
  const [analysisHistory, setAnalysisHistory] = useState<CVAnalysisData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const extractTextFromPDF = async (file: File): Promise<string> => {
    // Simple PDF text extraction - in production, you might want to use a more robust solution
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        try {
          // For now, we'll use a simple approach - you might want to integrate pdf-parse or similar
          // This is a placeholder that will work with text-based PDFs
          const text = new TextDecoder().decode(arrayBuffer);
          resolve(text);
        } catch (error) {
          console.error('PDF extraction error:', error);
          resolve('Unable to extract text from PDF. Please ensure your CV is text-based and try again.');
        }
      };
      reader.readAsArrayBuffer(file);
    });
  };

  const analyzeCV = async (file: File, industry: string, jobTitle: string, company: string) => {
    try {
      setIsAnalyzing(true);
      
      // Extract text from PDF
      const cvText = await extractTextFromPDF(file);
      
      if (!cvText || cvText.length < 50) {
        throw new Error('Unable to extract sufficient text from PDF. Please ensure your CV is text-based.');
      }

      // Call the edge function for analysis
      const { data, error } = await supabase.functions.invoke('analyze-cv', {
        body: {
          cvText,
          industry,
          jobTitle,
          company
        }
      });

      if (error) throw error;

      // Save to database
      const { data: savedAnalysis, error: saveError } = await supabase
        .from('cv_analyses')
        .insert({
          industry,
          job_title: jobTitle,
          company,
          ats_score: data.atsScore,
          analysis_result: data,
          user_id: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (saveError) throw saveError;

      setAnalysisResult(data);
      
      toast({
        title: "CV Analysis Complete",
        description: `Your CV scored ${data.atsScore}/100 for ATS compatibility.`,
      });

      return data;

    } catch (error) {
      console.error('CV analysis error:', error);
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Failed to analyze CV",
      });
      throw error;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const fetchAnalysisHistory = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('cv_analyses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAnalysisHistory(data || []);
    } catch (error) {
      console.error('Error fetching analysis history:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load analysis history",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isAnalyzing,
    analysisResult,
    analysisHistory,
    isLoading,
    analyzeCV,
    fetchAnalysisHistory,
    setAnalysisResult
  };
};
