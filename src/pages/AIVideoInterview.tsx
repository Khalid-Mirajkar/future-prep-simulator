
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Settings, Phone } from 'lucide-react';
import AIInterviewSession from '@/components/AIInterviewSession';
import AIInterviewResults from '@/components/AIInterviewResults';

interface LocationState {
  companyName: string;
  jobTitle: string;
  companyLogo?: string;
}

interface InterviewResponse {
  questionId: number;
  question: string;
  answer: string;
  score: number;
  evaluation: string;
  timeSpent: number;
}

const AIVideoInterview = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [interviewCompleted, setInterviewCompleted] = useState(false);
  const [interviewResults, setInterviewResults] = useState<{
    responses: InterviewResponse[];
    totalTime: number;
  } | null>(null);
  
  const locationState = location.state as LocationState | undefined;

  if (!locationState) {
    navigate('/start-practice');
    return null;
  }

  const handleInterviewComplete = (responses: InterviewResponse[], totalTime: number) => {
    setInterviewResults({ responses, totalTime });
    setInterviewCompleted(true);
  };

  if (interviewCompleted && interviewResults) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] text-white p-6">
        <AIInterviewResults
          responses={interviewResults.responses}
          totalTime={interviewResults.totalTime}
          companyName={locationState.companyName}
          jobTitle={locationState.jobTitle}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white flex flex-col">
      {/* Header with meeting info */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <div className="flex items-center space-x-3">
          <h1 className="text-lg font-semibold">AI Interview Simulation</h1>
          <span className="text-sm text-gray-400">•</span>
          <span className="text-sm text-gray-400">{locationState.companyName} - {locationState.jobTitle}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Main interview area */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-4xl w-full">
          <AIInterviewSession
            companyName={locationState.companyName}
            jobTitle={locationState.jobTitle}
            onInterviewComplete={handleInterviewComplete}
          />
        </div>
      </div>

      {/* Bottom controls (Google Meet style) */}
      <div className="p-6 border-t border-gray-800">
        <div className="flex items-center justify-center">
          <Button 
            variant="ghost" 
            size="icon" 
            className="bg-red-600 hover:bg-red-700 rounded-full w-12 h-12"
            onClick={() => navigate('/start-practice')}
          >
            <Phone className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AIVideoInterview;
