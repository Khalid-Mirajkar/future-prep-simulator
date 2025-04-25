
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MCQQuestion, TestResult } from "@/types/mcq";

export const useMCQTest = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { companyName, jobTitle } = location.state || {};
  const { toast } = useToast();
  
  const [questions, setQuestions] = useState<MCQQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [questionSeed, setQuestionSeed] = useState(() => 
    Math.floor(Math.random() * 1000000) + Date.now() % 10000
  );
  const [isIncompatibleJob, setIsIncompatibleJob] = useState(false);

  useEffect(() => {
    if (!companyName || !jobTitle) {
      setError("Missing company name or job title. Please return to the start page.");
      setIsLoading(false);
      return;
    }

    const loadQuestions = async () => {
      try {
        setIsLoading(true);
        setError(null);
        setIsIncompatibleJob(false);
        
        console.log(`Loading questions for ${companyName} - ${jobTitle} with seed ${questionSeed}`);
        
        const { data, error: supabaseError } = await supabase.functions.invoke('generate-questions', {
          body: { 
            companyName, 
            jobTitle, 
            seed: questionSeed
          }
        });

        if (supabaseError) {
          console.error('Error calling generate-questions function:', supabaseError);
          
          // Check for specific error types from the edge function response
          if (supabaseError.message) {
            if (supabaseError.message.includes("Edge Function returned a non-2xx status code")) {
              if (data && data.error) {
                if (data.code === "insufficient_quota") {
                  throw new Error('OpenAI API quota exceeded. Please update your API key or try again later.');
                } else {
                  throw new Error(data.error);
                }
              } else {
                // Try to get more detailed error information
                console.error('Edge function response data:', data);
                throw new Error('Error generating questions. This may be due to an issue with the OpenAI API key configuration or API quota limits.');
              }
            } else if (supabaseError.message.includes("quota")) {
              throw new Error('OpenAI API quota exceeded. Please try again later or contact support.');
            } else if (supabaseError.message.includes("API key")) {
              throw new Error('Invalid or missing OpenAI API key. Please check the configuration in Supabase Edge Function Secrets.');
            } else {
              throw new Error(supabaseError.message || 'Failed to load questions');
            }
          }
        }

        if (!data || !Array.isArray(data)) {
          console.error('Invalid response format:', data);
          throw new Error('Received invalid question data from the server');
        }

        if (data.length === 1 && data[0].options && data[0].options.length === 1 && 
            data[0].options[0] === "Try a different job role") {
          setIsIncompatibleJob(true);
        }
        
        const validatedData = data.map(question => {
          if (!question.options || question.options.length !== 4) {
            console.warn('Question with incorrect number of options found, fixing:', question);
            return {
              ...question,
              options: question.options?.length ? 
                [...question.options].concat(["Option 2", "Option 3", "Option 4"]).slice(0, 4) : 
                ["Option 1", "Option 2", "Option 3", "Option 4"]
            };
          }
          return question;
        });

        console.log('Successfully loaded questions:', validatedData.length);
        setQuestions(validatedData);
      } catch (err) {
        console.error('Error loading questions:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to load questions. Please try again.';
        setError(errorMessage);
        toast({
          variant: "destructive",
          title: "Error",
          description: errorMessage
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadQuestions();
  }, [companyName, jobTitle, toast, retryCount, questionSeed]);

  const handleOptionSelect = (questionId: number, optionIndex: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const evaluateTest = () => {
    const incorrect = questions.filter(
      (q) => selectedAnswers[q.id] !== q.correctAnswer
    ).map(q => ({
      questionId: q.id,
      question: q.question,
      userAnswer: q.options[selectedAnswers[q.id]],
      correctAnswer: q.options[q.correctAnswer],
      explanation: q.explanation || ''
    }));

    const score = questions.length - incorrect.length;

    setTestResult({
      score,
      totalQuestions: questions.length,
      incorrectAnswers: incorrect
    });
    setShowResults(true);
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  const handleRestartTest = () => {
    setQuestions([]);
    setCurrentQuestion(0);
    setSelectedAnswers({});
    setShowResults(false);
    setTestResult(null);
    setQuestionSeed(Math.floor(Math.random() * 1000000) + Date.now() % 10000);
    setIsLoading(true);
  };

  const handleTakeAnotherTest = () => {
    navigate('/start-practice');
  };

  const handleBackToStart = () => {
    navigate('/start-practice');
  };

  return {
    questions,
    currentQuestion,
    selectedAnswers,
    isLoading,
    error,
    showResults,
    testResult,
    isIncompatibleJob,
    handleOptionSelect,
    setCurrentQuestion,
    evaluateTest,
    handleRetry,
    handleRestartTest,
    handleTakeAnotherTest,
    handleBackToStart,
  };
};
