
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
  
  // Try to get data from location.state or localStorage
  let locationState = location.state as LocationState | undefined;
  
  if (!locationState || !locationState.companyName || !locationState.jobTitle) {
    const stored = localStorage.getItem('testData');
    if (stored) {
      locationState = JSON.parse(stored) as LocationState;
    }
  }

  if (!locationState || !locationState.companyName || !locationState.jobTitle) {
    navigate('/start-practice', { replace: true });
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
    <AIInterviewSession
      companyName={locationState.companyName}
      jobTitle={locationState.jobTitle}
      onInterviewComplete={handleInterviewComplete}
    />
  );
};

export default AIVideoInterview;
