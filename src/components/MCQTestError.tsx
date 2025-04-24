
import React from 'react';
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface MCQTestErrorProps {
  error: string;
  handleRetry: () => void;
}

const MCQTestError: React.FC<MCQTestErrorProps> = ({ error, handleRetry }) => {
  const navigate = useNavigate();

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
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Start
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MCQTestError;
