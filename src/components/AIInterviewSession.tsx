
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useCustomAvatar } from '@/hooks/useCustomAvatar';
import { useUserCamera } from '@/hooks/useUserCamera';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import CustomAvatar from '@/components/CustomAvatar';
import UserVideoFeed from '@/components/UserVideoFeed';
import SubtitleDisplay from '@/components/SubtitleDisplay';
import InterviewControls from '@/components/InterviewControls';

interface InterviewQuestion {
  id: number;
  question: string;
  category: string;
}

interface InterviewResponse {
  questionId: number;
  question: string;
  answer: string;
  score: number;
  evaluation: string;
  timeSpent: number;
}

interface AIInterviewSessionProps {
  companyName: string;
  jobTitle: string;
  onInterviewComplete: (responses: InterviewResponse[], totalTime: number) => void;
}

const AIInterviewSession: React.FC<AIInterviewSessionProps> = ({
  companyName,
  jobTitle,
  onInterviewComplete
}) => {
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<InterviewResponse[]>([]);
  const [interviewStartTime, setInterviewStartTime] = useState<number>(0);
  const [questionStartTime, setQuestionStartTime] = useState<number>(0);
  const [isWaitingForAnswer, setIsWaitingForAnswer] = useState(false);

  // Custom hooks
  const { isGenerating, isPlaying, currentSubtitle, speakText } = useCustomAvatar();
  const { 
    videoRef, 
    isVideoEnabled, 
    isAudioEnabled, 
    toggleVideo, 
    toggleAudio, 
    initializeCamera,
    stopCamera 
  } = useUserCamera();
  const { 
    isListening, 
    transcript, 
    startListening, 
    stopListening, 
    resetTranscript 
  } = useSpeechRecognition();

  // Sample interview questions
  const questions: InterviewQuestion[] = [
    {
      id: 1,
      question: `Tell me about yourself and why you're interested in the ${jobTitle} position at ${companyName}.`,
      category: 'Introduction'
    },
    {
      id: 2,
      question: "Describe a challenging project you've worked on and how you overcame the obstacles.",
      category: 'Problem Solving'
    },
    {
      id: 3,
      question: "How do you handle working under pressure and tight deadlines?",
      category: 'Work Style'
    },
    {
      id: 4,
      question: "What are your greatest strengths and how do they relate to this role?",
      category: 'Self Assessment'
    },
    {
      id: 5,
      question: `Where do you see yourself in 5 years, and how does this role at ${companyName} fit into your career goals?`,
      category: 'Career Goals'
    }
  ];

  const startInterview = async () => {
    setInterviewStarted(true);
    setInterviewStartTime(Date.now());
    
    // Avatar greeting
    await speakText(`Hi there! Welcome to your mock interview for the ${jobTitle} position at ${companyName}. I'm excited to get to know you better. Let's begin with our first question.`);
    
    // Start first question after greeting
    setTimeout(() => {
      askCurrentQuestion();
    }, 2000);
  };

  const askCurrentQuestion = async () => {
    if (currentQuestionIndex < questions.length) {
      const question = questions[currentQuestionIndex];
      setQuestionStartTime(Date.now());
      setIsWaitingForAnswer(false);
      
      await speakText(question.question);
      
      // Start listening after avatar finishes speaking
      setTimeout(() => {
        setIsWaitingForAnswer(true);
        startListening();
      }, 2000);
    }
  };

  const submitAnswer = async () => {
    if (!transcript.trim()) return;

    stopListening();
    setIsWaitingForAnswer(false);
    
    const question = questions[currentQuestionIndex];
    const timeSpent = Math.round((Date.now() - questionStartTime) / 1000);
    
    // Evaluate the response (placeholder for now)
    const evaluation = await evaluateResponse(question.question, transcript);
    
    const response: InterviewResponse = {
      questionId: question.id,
      question: question.question,
      answer: transcript,
      score: evaluation.score,
      evaluation: evaluation.feedback,
      timeSpent
    };

    setResponses(prev => [...prev, response]);
    resetTranscript();
    
    // Move to next question or end interview
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setTimeout(() => {
        askCurrentQuestion();
      }, 2000);
    } else {
      endInterview();
    }
  };

  const evaluateResponse = async (question: string, answer: string): Promise<{ score: number; feedback: string }> => {
    // Placeholder evaluation
    const wordCount = answer.split(' ').length;
    const score = Math.min(10, Math.max(1, Math.round(wordCount / 10)));
    const feedback = wordCount > 20 ? "Good detailed response!" : "Consider providing more specific examples.";
    
    return { score, feedback };
  };

  const endInterview = async () => {
    await speakText("Thank you for your time today. Your interview responses are being evaluated. Best of luck with your application!");
    
    const totalTime = Math.round((Date.now() - interviewStartTime) / 1000);
    setTimeout(() => {
      stopCamera();
      onInterviewComplete(responses, totalTime);
    }, 5000);
  };

  const handleEndCall = () => {
    stopCamera();
    stopListening();
    // Navigate back or end interview
    window.history.back();
  };

  // Auto-submit answer when user stops talking for 3 seconds
  useEffect(() => {
    if (isWaitingForAnswer && transcript && !isListening) {
      const timer = setTimeout(() => {
        submitAnswer();
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [isWaitingForAnswer, transcript, isListening]);

  if (!interviewStarted) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] text-white flex flex-col">
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center space-y-6 max-w-md">
            <CustomAvatar
              isGenerating={isGenerating}
              isPlaying={isPlaying}
            />
            <div>
              <h2 className="text-2xl font-semibold mb-2">Meet Your AI Interviewer</h2>
              <p className="text-gray-400">Ready to conduct your interview simulation</p>
            </div>
            <Button 
              onClick={startInterview}
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-8 py-4 text-lg rounded-xl"
            >
              Start Interview
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <div className="flex items-center space-x-3">
          <h1 className="text-lg font-semibold">AI Interview</h1>
          <span className="text-sm text-gray-400">•</span>
          <span className="text-sm text-gray-400">{companyName} - {jobTitle}</span>
        </div>
        <div className="text-sm text-gray-400">
          Question {currentQuestionIndex + 1} of {questions.length}
        </div>
      </div>

      {/* Main Interview Area - Split Screen */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Left Side - AI Interviewer */}
        <div className="flex-1 flex flex-col p-4 space-y-4">
          <div className="flex-1 flex items-center justify-center">
            <CustomAvatar
              isGenerating={isGenerating}
              isPlaying={isPlaying}
            />
          </div>
          
          {/* AI Subtitles */}
          <SubtitleDisplay
            text={currentSubtitle}
            isActive={isPlaying}
            title="AI Interviewer"
          />

          {/* Current Question */}
          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-purple-400">{currentQuestion.category}</span>
              </div>
              <p className="text-white">{currentQuestion.question}</p>
            </CardContent>
          </Card>
        </div>

        {/* Right Side - User */}
        <div className="flex-1 flex flex-col p-4 space-y-4">
          <div className="flex-1">
            <UserVideoFeed
              videoRef={videoRef}
              isVideoEnabled={isVideoEnabled}
              onInitialize={initializeCamera}
            />
          </div>
          
          {/* User Subtitles */}
          <SubtitleDisplay
            text={transcript}
            isActive={isListening}
            title="Your Response"
          />

          {/* Answer Status */}
          {isWaitingForAnswer && (
            <Card className="bg-blue-900/50 border-blue-700">
              <CardContent className="p-3">
                <p className="text-blue-300 text-sm text-center">
                  {isListening ? "Listening... Speak your answer" : "Processing your response..."}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Bottom Controls */}
      <InterviewControls
        isVideoEnabled={isVideoEnabled}
        isAudioEnabled={isAudioEnabled}
        onToggleVideo={toggleVideo}
        onToggleAudio={toggleAudio}
        onEndCall={handleEndCall}
      />
    </div>
  );
};

export default AIInterviewSession;
