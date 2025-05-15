
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import MCQTestResults from "@/components/MCQTestResults";

const Results = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: testResult, isLoading } = useQuery({
    queryKey: ['interview-result', id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('interview_results')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return {
        score: data.score,
        totalQuestions: data.total_questions,
        incorrectAnswers: [] // This would need to be expanded based on your data structure
      };
    },
    enabled: !!id
  });

  const handleRestartTest = () => {
    navigate('/start-practice');
  };

  const handleTakeAnotherTest = () => {
    navigate('/start-practice');
  };
  
  const handleBackToHome = () => {
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] text-white py-20">
        <div className="container mx-auto px-6 text-center">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!testResult) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] text-white py-20">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl font-bold mb-8">No Results Found</h1>
          <p className="text-xl text-gray-300">
            We couldn't find the interview results you're looking for.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white py-20">
      <MCQTestResults
        testResult={testResult}
        handleRestartTest={handleRestartTest}
        handleTakeAnotherTest={handleTakeAnotherTest}
        handleBackToHome={handleBackToHome}
      />
    </div>
  );
};

export default Results;
