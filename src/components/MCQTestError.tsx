
import React from 'react';
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, RefreshCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface MCQTestErrorProps {
  error: string;
  handleRetry: () => void;
}

const MCQTestError: React.FC<MCQTestErrorProps> = ({ error, handleRetry }) => {
  const navigate = useNavigate();
  
  // Detect specific error types
  const isQuotaError = error.includes('quota');
  const isApiKeyError = error.includes('API key');

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white py-20">
      <div className="container mx-auto px-6 max-w-2xl">
        <Alert variant="destructive" className="mb-6">
          <AlertTitle className="text-lg">Error</AlertTitle>
          <AlertDescription>
            {error}
            {isQuotaError && (
              <p className="mt-2 text-sm">
                The OpenAI API quota has been exceeded. Please try again later or use a different API key.
              </p>
            )}
            {isApiKeyError && (
              <p className="mt-2 text-sm">
                Please ensure a valid OpenAI API key is configured in the Supabase Edge Function Secrets.
              </p>
            )}
            {!isQuotaError && !isApiKeyError && (
              <p className="mt-2 text-sm">
                This may be due to a connection issue or server problem.
              </p>
            )}
          </AlertDescription>
        </Alert>
        <div className="text-center mt-8 space-y-4">
          <Button onClick={handleRetry} size="lg" className="mr-4">
            <RefreshCcw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
          <Button onClick={() => navigate('/start-practice')} variant="outline" size="lg">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Start
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MCQTestError;
