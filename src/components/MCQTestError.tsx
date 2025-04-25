
import React from 'react';
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, RefreshCcw, Key, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

interface MCQTestErrorProps {
  error: string;
  handleRetry: () => void;
}

const MCQTestError: React.FC<MCQTestErrorProps> = ({ error, handleRetry }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Detect specific error types
  const isQuotaError = error.includes('quota') || error.includes('insufficient_quota');
  const isApiKeyError = error.includes('API key') || error.includes('authentication') || error.includes('Authorization');

  const openSupabaseFunctions = () => {
    window.open("https://supabase.com/dashboard/project/jdknamkvstwuihynclbr/settings/functions", "_blank");
    toast({
      title: "Opening Supabase Functions Settings",
      description: "Update your OpenAI API key in the 'Secrets' section"
    });
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white py-20">
      <div className="container mx-auto px-6 max-w-2xl">
        <Alert variant="destructive" className="mb-6">
          <AlertTitle className="text-lg">Error</AlertTitle>
          <AlertDescription>
            {error}
            {isQuotaError && (
              <p className="mt-2 text-sm">
                The OpenAI API quota has been exceeded. Please update your API key in the Supabase Edge Functions secrets 
                or try again later when your quota resets.
              </p>
            )}
            {isApiKeyError && (
              <p className="mt-2 text-sm">
                Please ensure a valid OpenAI API key is configured in the Supabase Edge Function Secrets with the name "OPENAI_API_KEY".
              </p>
            )}
            {!isQuotaError && !isApiKeyError && (
              <p className="mt-2 text-sm">
                This may be due to a connection issue or server problem. Please check the Edge Function logs for more details.
              </p>
            )}
          </AlertDescription>
        </Alert>
        <div className="text-center mt-8 space-y-4">
          <Button onClick={openSupabaseFunctions} size="lg" className="mr-4">
            <Key className="mr-2 h-4 w-4" />
            Update API Key in Supabase
          </Button>
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
