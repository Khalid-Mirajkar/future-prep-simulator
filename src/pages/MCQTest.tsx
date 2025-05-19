
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useMCQTest } from '@/hooks/useMCQTest';
import MCQQuestionDisplay from '@/components/MCQQuestionDisplay';
import MCQTestResults from '@/components/MCQTestResults';
import MCQTestLoading from '@/components/MCQTestLoading';
import MCQTestError from '@/components/MCQTestError';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import PageHeader from '@/components/PageHeader';

// Define TypeScript interface for location state
interface LocationState {
  companyName: string;
  jobTitle: string;
  companyLogo?: string;
}

const MCQTest: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Safely access location.state with proper typing
  const locationState = location.state as LocationState | undefined;
  
  const {
    questions,
    currentQuestion,
    selectedAnswers,
    isLoading,
    error,
    showResults,
    testResult,
    isIncompatibleJob,
    initialSeconds,
    remainingSeconds,
    handleOptionSelect,
    setCurrentQuestion,
    evaluateTest,
    handleRetry,
    handleRestartTest,
    handleTakeAnotherTest,
    handleBackToStart,
    handleBackToHome,
  } = useMCQTest();

  if (isLoading) return <MCQTestLoading />;
  
  if (error) return <MCQTestError error={error} handleRetry={handleRetry} />;
  
  if (isIncompatibleJob && questions.length === 1) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] text-white py-20">
        <div className="container mx-auto px-6 max-w-2xl">
          <Alert className="mb-6 border-amber-500 bg-amber-500/20">
            <AlertTitle className="text-lg">Job-Company Mismatch</AlertTitle>
            <AlertDescription>
              {questions[0].question}
              {questions[0].explanation && (
                <p className="mt-2 text-sm">{questions[0].explanation}</p>
              )}
            </AlertDescription>
          </Alert>
          <div className="text-center mt-8">
            <Button onClick={handleBackToStart} size="lg">
              <ArrowLeft className="mr-2 h-4 w-4" />
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

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white py-20">
      <div className="container mx-auto px-6">
        <PageHeader 
          title="MCQ Interview Practice"
          highlightedWord="Interview"
        />
        
        {showResults && testResult ? (
          <MCQTestResults
            testResult={testResult}
            handleRestartTest={handleRestartTest}
            handleTakeAnotherTest={handleTakeAnotherTest}
            handleBackToHome={handleBackToHome}
          />
        ) : (
          <div className="max-w-2xl mx-auto">
            <div className="mb-6">
              <p className="text-gray-400 text-center">Company: {locationState?.companyName}</p>
              <p className="text-gray-400 text-center">Position: {locationState?.jobTitle}</p>
            </div>

            <MCQQuestionDisplay
              questions={questions}
              currentQuestion={currentQuestion}
              selectedAnswers={selectedAnswers}
              handleOptionSelect={handleOptionSelect}
              setCurrentQuestion={setCurrentQuestion}
              evaluateTest={evaluateTest}
              initialSeconds={initialSeconds}
              remainingSeconds={remainingSeconds}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MCQTest;
