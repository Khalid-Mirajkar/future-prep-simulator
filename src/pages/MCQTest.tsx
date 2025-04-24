
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { MCQQuestion, TestResult } from "@/types/mcq";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";

const MCQTest = () => {
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
        
        console.log('Calling generate-questions with:', { companyName, jobTitle });
        
        const { data, error } = await supabase.functions.invoke('generate-questions', {
          body: { companyName, jobTitle }
        });

        if (error) {
          console.error('Error calling generate-questions function:', error);
          throw new Error(error.message || 'Failed to load questions');
        }

        if (!data || !Array.isArray(data)) {
          console.error('Invalid response format:', data);
          throw new Error('Received invalid question data');
        }

        console.log('Successfully loaded questions:', data.length);
        setQuestions(data);
      } catch (err) {
        console.error('Error loading questions:', err);
        setError('Failed to load questions. Please try again.');
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load interview questions. Please try again later."
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadQuestions();
  }, [companyName, jobTitle, toast, retryCount]);

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] text-white py-20 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-purple-500" />
          <div className="text-center">
            <p className="text-xl font-medium">Generating questions...</p>
            <p className="text-sm text-gray-400 mt-2">This may take a few moments</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] text-white py-20">
        <div className="container mx-auto px-6 max-w-2xl">
          <Alert variant="destructive" className="mb-6">
            <AlertTitle className="text-lg">Error</AlertTitle>
            <AlertDescription>
              {error}
              <p className="mt-2 text-sm">This may be due to a missing OpenAI API key or connection issue.</p>
            </AlertDescription>
          </Alert>
          <div className="text-center mt-8 space-y-4">
            <Button onClick={handleRetry} size="lg" className="mr-4">
              Try Again
            </Button>
            <Button onClick={() => navigate('/start-practice')} variant="outline" size="lg">
              Back to Start
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] text-white py-20">
        <div className="container mx-auto px-6 max-w-2xl">
          <Alert variant="destructive" className="mb-6">
            <AlertTitle className="text-lg">No Questions Available</AlertTitle>
            <AlertDescription>
              We couldn't generate questions for this combination of company and job title.
              Please try again with different inputs.
            </AlertDescription>
          </Alert>
          <div className="text-center mt-8">
            <Button onClick={() => navigate('/start-practice')} size="lg">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (showResults && testResult) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] text-white py-20">
        <div className="container mx-auto px-6">
          <h1 className="text-4xl font-bold mb-8 text-center">Test Results</h1>
          
          <div className="max-w-2xl mx-auto glass-card p-8 rounded-xl">
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">
                Score: {testResult.score}/{testResult.totalQuestions}
              </h2>
              <div className="h-2 bg-gray-700 rounded-full mb-4">
                <div 
                  className="h-full bg-green-500 rounded-full transition-all duration-500"
                  style={{ width: `${(testResult.score / testResult.totalQuestions) * 100}%` }}
                />
              </div>
            </div>

            {testResult.incorrectAnswers.length > 0 ? (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold mb-4">Areas for Improvement</h3>
                {testResult.incorrectAnswers.map((answer, index) => (
                  <div key={index} className="p-4 bg-gray-800/50 rounded-lg">
                    <p className="font-medium mb-2">{answer.question}</p>
                    <p className="text-red-400 mb-1">Your answer: {answer.userAnswer}</p>
                    <p className="text-green-400 mb-2">Correct answer: {answer.correctAnswer}</p>
                    <p className="text-gray-400 text-sm">{answer.explanation}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-green-400">
                Perfect score! You answered all questions correctly.
              </div>
            )}

            <Button 
              onClick={() => navigate('/start-practice')} 
              className="w-full mt-8"
            >
              Take Another Test
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white py-20">
      <div className="container mx-auto px-6">
        <h1 className="text-4xl font-bold mb-8 text-center">MCQ Interview Practice</h1>
        
        <div className="max-w-2xl mx-auto glass-card p-8 rounded-xl">
          <div className="mb-6">
            <p className="text-gray-400">Company: {companyName}</p>
            <p className="text-gray-400">Position: {jobTitle}</p>
          </div>

          <div className="mb-6">
            <p className="text-lg font-medium mb-4">
              Question {currentQuestion + 1} of {questions.length}
            </p>
            <p className="text-xl mb-6">{questions[currentQuestion]?.question}</p>

            <div className="space-y-4">
              {questions[currentQuestion]?.options.map((option, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg cursor-pointer transition-all ${
                    selectedAnswers[questions[currentQuestion].id] === index
                      ? "bg-deep-purple text-white"
                      : "bg-gray-800 hover:bg-gray-700"
                  }`}
                  onClick={() => handleOptionSelect(questions[currentQuestion].id, index)}
                >
                  {option}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between gap-4">
            <Button
              onClick={() => setCurrentQuestion(prev => prev - 1)}
              disabled={currentQuestion === 0}
              variant="outline"
              className="w-1/2"
            >
              Previous
            </Button>
            
            {currentQuestion < questions.length - 1 ? (
              <Button
                onClick={() => setCurrentQuestion(prev => prev + 1)}
                disabled={selectedAnswers[questions[currentQuestion]?.id] === undefined}
                className="w-1/2"
              >
                Next Question
              </Button>
            ) : (
              <Button
                onClick={evaluateTest}
                disabled={Object.keys(selectedAnswers).length !== questions.length}
                className="w-1/2"
              >
                Submit Test
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MCQTest;
