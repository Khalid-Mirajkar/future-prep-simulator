
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useDIDAvatar } from '@/hooks/useDIDAvatar';
import { useUserCamera } from '@/hooks/useUserCamera';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import DIDAvatar from '@/components/DIDAvatar';
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
  const [currentSubtitle, setCurrentSubtitle] = useState('');

  // Updated to use D-ID avatar instead of custom avatar
  const { isGenerating, currentVideoUrl, speakText, isPlaying } = useDIDAvatar();
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
    
    // Avatar greeting with D-ID
    const greetingText = `Hi there! Welcome to your mock interview for the ${jobTitle} position at ${companyName}. I'm excited to get to know you better. Let's begin with our first question.`;
    setCurrentSubtitle(greetingText);
    await speakText(greetingText);
    
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
      
      setCurrentSubtitle(question.question);
      await speakText(question.question);
      
      // Start listening after avatar finishes speaking
      setTimeout(() => {
        setIsWaitingForAnswer(true);
        startListening();
        setCurrentSubtitle('');
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
    const endingText = "Thank you for your time today. Your interview responses are being evaluated. Best of luck with your application!";
    setCurrentSubtitle(endingText);
    await speakText(endingText);
    
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

  const handleVideoEnd = () => {
    setCurrentSubtitle('');
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
            <DIDAvatar
              videoUrl={currentVideoUrl}
              isGenerating={isGenerating}
              isPlaying={isPlaying}
              onVideoEnd={handleVideoEnd}
              fallbackImageUrl="https://d-id-public-bucket.s3.us-west-2.amazonaws.com/alice.jpg"
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
    <div className="min-h-screen bg-[#0D0D0D] text-white relative overflow-hidden">
      {/* Main Video Grid - Split Screen Layout */}
      <div className="absolute inset-0 grid grid-cols-1 lg:grid-cols-2 gap-1 p-1 pb-20">
        {/* AI Interviewer Video */}
        <div className="relative bg-gray-900 rounded-lg overflow-hidden">
          <DIDAvatar
            videoUrl={currentVideoUrl}
            isGenerating={isGenerating}
            isPlaying={isPlaying}
            onVideoEnd={handleVideoEnd}
            fallbackImageUrl="https://d-id-public-bucket.s3.us-west-2.amazonaws.com/alice.jpg"
          />
          
          {/* AI Interviewer Label */}
          <div className="absolute bottom-3 left-3">
            <div className="bg-black/60 px-2 py-1 rounded text-white text-xs font-medium">
              AI Interviewer
            </div>
          </div>

          {/* AI Subtitles Overlay */}
          <SubtitleDisplay
            text={currentSubtitle}
            isActive={isPlaying}
            title="AI Interviewer"
            isOverlay={true}
          />

          {/* Speaking indicator */}
          {isPlaying && (
            <div className="absolute top-3 right-3">
              <div className="bg-green-500/80 rounded-full px-3 py-1">
                <span className="text-white text-xs font-medium">Speaking</span>
              </div>
            </div>
          )}
        </div>

        {/* User Video */}
        <div className="relative">
          <UserVideoFeed
            videoRef={videoRef}
            isVideoEnabled={isVideoEnabled}
            onInitialize={initializeCamera}
            subtitle={transcript}
            isListening={isListening}
          />
        </div>
      </div>

      {/* Top Bar with Meeting Info */}
      <div className="absolute top-0 left-0 right-0 bg-gray-900/90 backdrop-blur-sm border-b border-gray-700 z-10">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center space-x-3">
            <h1 className="text-white font-semibold">AI Interview Session</h1>
            <span className="text-gray-400">•</span>
            <span className="text-gray-400 text-sm">{companyName} - {jobTitle}</span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-400">
              Question {currentQuestionIndex + 1} of {questions.length}
            </div>
            <div className="bg-red-500 text-white px-2 py-1 rounded text-xs">
              REC
            </div>
          </div>
        </div>
      </div>

      {/* Current Question Overlay */}
      {currentQuestion && (
        <div className="absolute top-20 left-4 right-4 z-10">
          <Card className="bg-gray-900/90 backdrop-blur-sm border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-purple-400 font-medium">{currentQuestion.category}</span>
                {isWaitingForAnswer && (
                  <span className="text-xs text-blue-400 animate-pulse">Listening for your response...</span>
                )}
              </div>
              <p className="text-white text-sm">{currentQuestion.question}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Video Call Controls */}
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
