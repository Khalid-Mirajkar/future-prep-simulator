
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
          <AlertTitle className="text-xl font-bold">Error Generating Questions</AlertTitle>
          <AlertDescription className="mt-2">
            <p className="mb-3 text-lg">{error}</p>
            {isQuotaError && (
              <div className="mt-4 text-sm space-y-3 bg-red-900/30 p-4 rounded-md border border-red-800/50">
                <p className="font-semibold text-base">
                  The OpenAI API quota has been exceeded or there's a billing issue.
                </p>
                <ul className="list-disc pl-5 mt-2 space-y-2">
                  <li>Ensure your OpenAI account has available credits or is properly set up for billing</li>
                  <li>Check if you've exceeded your rate limits (new accounts have lower limits)</li>
                  <li>Try creating a new API key with a higher quota</li>
                  <li>Consider waiting a few minutes if you've made many requests recently</li>
                </ul>
              </div>
            )}
            {isApiKeyError && (
              <div className="mt-4 text-sm space-y-3 bg-red-900/30 p-4 rounded-md border border-red-800/50">
                <p className="font-semibold text-base">
                  There's an issue with your OpenAI API key configuration.
                </p>
                <ul className="list-disc pl-5 mt-2 space-y-2">
                  <li>Verify that the API key starts with "sk-" and is entered correctly</li>
                  <li>Make sure there are no invisible whitespace characters before or after the key</li>
                  <li>Check that the key has been saved with the name "OPENAI_API_KEY" (case sensitive)</li>
                  <li>Ensure your OpenAI account is properly set up and the key has not been revoked</li>
                </ul>
              </div>
            )}
            {isGeneralError && (
              <div className="mt-4 text-sm space-y-3 bg-red-900/30 p-4 rounded-md border border-red-800/50">
                <p className="font-semibold text-base">
                  There was an unexpected error while generating questions.
                </p>
                <ul className="list-disc pl-5 mt-2 space-y-2">
                  <li>This may be due to a temporary issue with the OpenAI API service</li>
                  <li>Check the Edge Function logs for more detailed information</li>
                  <li>Try refreshing and making another attempt</li>
                </ul>
              </div>
            )}
          </AlertDescription>
        </Alert>

        <div className="bg-purple-900/20 p-5 rounded-lg border border-purple-700/30 mb-6">
          <h3 className="font-semibold text-lg mb-2">Try a Different Approach</h3>
          <p className="mb-4">Sometimes changing the random seed or retrying the request can resolve temporary issues.</p>
          <Button onClick={regenerateWithNewSeed} size="lg" className="w-full mb-2 bg-purple-600 hover:bg-purple-700">
            <Repeat className="mr-2 h-5 w-5" />
            Generate New Questions
          </Button>
        </div>
        
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
            <Button onClick={handleRetry} size="lg" className="mr-1">
              <RefreshCcw className="mr-2 h-4 w-4" />
              Retry
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
