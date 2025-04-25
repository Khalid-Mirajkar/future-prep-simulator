
import React from 'react';
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, RefreshCcw, Key, ExternalLink, Bug, Repeat } from "lucide-react";
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
  const isQuotaError = error.toLowerCase().includes('quota') || 
                       error.toLowerCase().includes('insufficient_quota') || 
                       error.toLowerCase().includes('exceeded');
                       
  const isApiKeyError = error.toLowerCase().includes('api key') || 
                       error.toLowerCase().includes('authentication') || 
                       error.toLowerCase().includes('authorization') ||
                       error.toLowerCase().includes('invalid') ||
                       error.toLowerCase().includes('missing');
                       
  const isGeneralError = !isQuotaError && !isApiKeyError;

  const openSupabaseFunctions = () => {
    window.open("https://supabase.com/dashboard/project/jdknamkvstwuihynclbr/settings/functions", "_blank");
    toast({
      title: "Opening Supabase Functions Settings",
      description: "Update your OpenAI API key in the 'Secrets' section"
    });
  };
  
  const openSupabaseLogs = () => {
    window.open("https://supabase.com/dashboard/project/jdknamkvstwuihynclbr/functions/generate-questions/logs", "_blank");
    toast({
      title: "Opening Edge Function Logs",
      description: "Check the logs for more detailed error information"
    });
  };

  const regenerateWithNewSeed = () => {
    toast({
      title: "Retrying with new seed",
      description: "Generating new questions with a different random seed"
    });
    handleRetry();
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white py-20">
      <div className="container mx-auto px-6 max-w-2xl">
        <Alert variant="destructive" className="mb-6">
          <AlertTitle className="text-lg">Error Generating Questions</AlertTitle>
          <AlertDescription>
            {error}
            {isQuotaError && (
              <div className="mt-2 text-sm space-y-2">
                <p>
                  The OpenAI API quota has been exceeded. Please try one of the following:
                </p>
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li>Wait for your quota to reset (usually daily or monthly)</li>
                  <li>Update your API key in Supabase Edge Functions secrets</li>
                  <li>Create a new API key with sufficient quota</li>
                </ul>
              </div>
            )}
            {isApiKeyError && (
              <div className="mt-2 text-sm space-y-2">
                <p>
                  Please ensure a valid OpenAI API key is configured in the Supabase Edge Function Secrets with the name "OPENAI_API_KEY".
                </p>
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li>Verify that the API key starts with "sk-" and is entered correctly</li>
                  <li>Check if there are any extra spaces before or after the key</li>
                  <li>Ensure the key has the proper permissions for the GPT models</li>
                  <li>Try creating a new API key from your OpenAI dashboard</li>
                </ul>
              </div>
            )}
            {isGeneralError && (
              <p className="mt-2 text-sm">
                This may be due to a connection issue or server problem. Please check the Edge Function logs for more details or try again.
              </p>
            )}
          </AlertDescription>
        </Alert>
        <div className="text-center mt-8 space-y-4">
          <div className="flex flex-wrap gap-4 justify-center mb-4">
            <Button onClick={openSupabaseFunctions} size="lg" className="mr-1">
              <Key className="mr-2 h-4 w-4" />
              Update API Key
            </Button>
            <Button onClick={openSupabaseLogs} size="lg" className="mr-1" variant="outline">
              <Bug className="mr-2 h-4 w-4" />
              View Logs
            </Button>
          </div>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button onClick={regenerateWithNewSeed} size="lg" className="mr-1 bg-purple-600 hover:bg-purple-700">
              <Repeat className="mr-2 h-4 w-4" />
              Try New Questions
            </Button>
            <Button onClick={handleRetry} size="lg" className="mr-1">
              <RefreshCcw className="mr-2 h-4 w-4" />
              Retry Same Questions
            </Button>
            <Button onClick={() => navigate('/start-practice')} variant="outline" size="lg">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Start
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MCQTestError;
