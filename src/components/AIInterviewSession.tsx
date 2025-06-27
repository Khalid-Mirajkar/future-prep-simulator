
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useDIDAvatar } from '@/hooks/useDIDAvatar';
import { useUserCamera } from '@/hooks/useUserCamera';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import DIDAvatar from '@/components/DIDAvatar';
import UserVideoFeed from '@/components/UserVideoFeed';
import InterviewControls from '@/components/InterviewControls';
import { Mic, MicOff, Camera, CameraOff, Users, Clock } from 'lucide-react';

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
  const [showSubtitles, setShowSubtitles] = useState(true);
  const [conversationState, setConversationState] = useState<'greeting' | 'question' | 'waiting' | 'transitioning' | 'acknowledging'>('greeting');
  const [inactivityTimer, setInactivityTimer] = useState<NodeJS.Timeout | null>(null);
  const [speechEndTimer, setSpeechEndTimer] = useState<NodeJS.Timeout | null>(null);
  const [isGreetingPhase, setIsGreetingPhase] = useState(true);
  const [lastTranscript, setLastTranscript] = useState('');

  const { isGenerating, currentVideoUrl, speakText, isPlaying } = useDIDAvatar();
  const { 
    videoRef, 
    isVideoEnabled, 
    isAudioEnabled, 
    toggleVideo, 
    toggleAudio, 
    initializeCamera,
    stopCamera,
    hasPermissionError
  } = useUserCamera();
  const { 
    isListening, 
    transcript, 
    startListening, 
    stopListening, 
    resetTranscript 
  } = useSpeechRecognition();

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

  // Clear all timers
  const clearAllTimers = () => {
    if (inactivityTimer) {
      clearTimeout(inactivityTimer);
      setInactivityTimer(null);
    }
    if (speechEndTimer) {
      clearTimeout(speechEndTimer);
      setSpeechEndTimer(null);
    }
  };

  // Set inactivity timer
  const setInactivityTimeout = () => {
    clearAllTimers();
    const timer = setTimeout(() => {
      if (isWaitingForAnswer && conversationState === 'waiting') {
        handleInactivity();
      }
    }, 15000); // 15 seconds
    setInactivityTimer(timer);
  };

  const handleInactivity = async () => {
    const promptText = "Whenever you're ready, feel free to respond!";
    setCurrentSubtitle(promptText);
    await speakText(promptText);
    
    // Restart listening after prompt
    setTimeout(() => {
      if (isWaitingForAnswer && conversationState === 'waiting') {
        startListening();
        setInactivityTimeout();
      }
    }, 3000);
  };

  const startInterview = async () => {
    setInterviewStarted(true);
    setInterviewStartTime(Date.now());
    setConversationState('greeting');
    setIsGreetingPhase(true);
    
    // Initial greeting
    const greetingText = `Hi! I'm your AI Interviewer for the role of ${jobTitle} at ${companyName}. It's great to meet you. Before we begin, how are you feeling today?`;
    setCurrentSubtitle(greetingText);
    await speakText(greetingText);
    
    // Start listening for response after greeting
    setTimeout(() => {
      console.log('Starting to listen for greeting response...');
      setConversationState('waiting');
      setIsWaitingForAnswer(true);
      startListening();
      setInactivityTimeout();
    }, 2000);
  };

  const handleGreetingResponse = async (userResponse: string) => {
    console.log('Processing greeting response:', userResponse);
    clearAllTimers();
    setConversationState('acknowledging');
    setIsWaitingForAnswer(false);
    stopListening();
    
    // Acknowledge response and move to first question
    const acknowledgments = [
      "Thank you for sharing.",
      "Glad to hear that.",
      "Thanks, let's begin!"
    ];
    const acknowledgment = acknowledgments[Math.floor(Math.random() * acknowledgments.length)];
    
    setCurrentSubtitle(acknowledgment);
    await speakText(acknowledgment);
    
    resetTranscript();
    setLastTranscript('');
    setIsGreetingPhase(false);
    
    setTimeout(() => {
      askCurrentQuestion();
    }, 2000);
  };

  const askCurrentQuestion = async () => {
    if (currentQuestionIndex < questions.length) {
      const question = questions[currentQuestionIndex];
      setQuestionStartTime(Date.now());
      setConversationState('question');
      
      console.log('Asking question:', question.question);
      setCurrentSubtitle(question.question);
      await speakText(question.question);
      
      // Start listening after question finishes
      setTimeout(() => {
        console.log('Starting to listen for answer...');
        setConversationState('waiting');
        setIsWaitingForAnswer(true);
        startListening();
        setInactivityTimeout();
      }, 2000);
    }
  };

  const submitAnswer = async (userAnswer: string) => {
    console.log('Submitting answer:', userAnswer);
    clearAllTimers();
    stopListening();
    setIsWaitingForAnswer(false);
    setConversationState('acknowledging');
    
    const question = questions[currentQuestionIndex];
    const timeSpent = Math.round((Date.now() - questionStartTime) / 1000);
    
    // Evaluate the response
    const evaluation = await evaluateResponse(question.question, userAnswer);
    
    const response: InterviewResponse = {
      questionId: question.id,
      question: question.question,
      answer: userAnswer,
      score: evaluation.score,
      evaluation: evaluation.feedback,
      timeSpent
    };

    setResponses(prev => [...prev, response]);
    
    // Acknowledge the answer
    const acknowledgments = [
      "Thank you for that detailed response.",
      "I appreciate your thoughtful answer.",
      "That's a great perspective, thank you."
    ];
    const acknowledgment = acknowledgments[Math.floor(Math.random() * acknowledgments.length)];
    setCurrentSubtitle(acknowledgment);
    await speakText(acknowledgment);
    
    resetTranscript();
    setLastTranscript('');
    
    // Move to next question or end interview
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setTimeout(() => {
        askCurrentQuestion();
      }, 2000);
    } else {
      setTimeout(() => {
        endInterview();
      }, 2000);
    }
  };

  const evaluateResponse = async (question: string, answer: string): Promise<{ score: number; feedback: string }> => {
    const wordCount = answer.split(' ').length;
    const score = Math.min(10, Math.max(1, Math.round(wordCount / 10)));
    const feedback = wordCount > 20 ? "Good detailed response!" : "Consider providing more specific examples.";
    
    return { score, feedback };
  };

  const endInterview = async () => {
    clearAllTimers();
    const endingText = "Thank you for your time today. Your interview responses are being evaluated. Best of luck with your application!";
    setCurrentSubtitle(endingText);
    await speakText(endingText);
    
    const totalTime = Math.round((Date.now() - interviewStartTime) / 1000);
    setTimeout(() => {
      stopCamera();
      onInterviewComplete(responses, totalTime);
    }, 4000);
  };

  const handleEndCall = () => {
    clearAllTimers();
    stopCamera();
    stopListening();
    window.history.back();
  };

  const handleVideoEnd = () => {
    console.log('Video ended, clearing subtitle');
    if (conversationState === 'waiting') {
      setCurrentSubtitle('');
    }
  };

  // Enhanced speech detection with proper end-of-speech detection
  useEffect(() => {
    if (transcript && transcript.trim().length > 0) {
      console.log('Transcript updated:', transcript);
      
      // Clear any existing speech end timer
      if (speechEndTimer) {
        clearTimeout(speechEndTimer);
        setSpeechEndTimer(null);
      }
      
      // Set new timer to detect end of speech
      const timer = setTimeout(() => {
        console.log('Speech end detected, processing response...');
        
        if (conversationState === 'waiting' && transcript.trim() && transcript !== lastTranscript) {
          setLastTranscript(transcript);
          
          if (isGreetingPhase) {
            handleGreetingResponse(transcript);
          } else {
            submitAnswer(transcript);
          }
        }
      }, 1500); // 1.5 seconds of silence
      
      setSpeechEndTimer(timer);
      
      // Clear inactivity timer since user is speaking
      if (inactivityTimer) {
        clearTimeout(inactivityTimer);
        setInactivityTimer(null);
      }
    }
  }, [transcript, conversationState, isGreetingPhase, lastTranscript]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      clearAllTimers();
    };
  }, []);

  // Pre-interview setup screen
  if (!interviewStarted) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] text-white">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <div className="flex items-center space-x-3">
            <h1 className="text-xl font-semibold">AI Interview</h1>
            <span className="text-gray-400">•</span>
            <span className="text-gray-400">{companyName} - {jobTitle}</span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <Users className="h-4 w-4" />
              <span>2 participants</span>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-4xl w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* AI Interviewer Preview */}
              <div className="space-y-4">
                <h2 className="text-lg font-medium text-center">AI Interviewer</h2>
                <div className="relative bg-gray-900 rounded-xl overflow-hidden aspect-video">
                  <DIDAvatar
                    videoUrl={currentVideoUrl}
                    isGenerating={isGenerating}
                    isPlaying={isPlaying}
                    onVideoEnd={handleVideoEnd}
                    fallbackImageUrl="https://d-id-public-bucket.s3.us-west-2.amazonaws.com/alice.jpg"
                  />
                  
                  <div className="absolute bottom-3 left-3">
                    <div className="bg-black/60 px-2 py-1 rounded text-xs">
                      AI Interviewer
                    </div>
                  </div>
                </div>
              </div>

              {/* User Preview */}
              <div className="space-y-4">
                <h2 className="text-lg font-medium text-center">You</h2>
                <div className="relative bg-gray-900 rounded-xl overflow-hidden aspect-video">
                  <UserVideoFeed
                    videoRef={videoRef}
                    isVideoEnabled={isVideoEnabled}
                    onInitialize={initializeCamera}
                    hasPermissionError={hasPermissionError}
                    showPreviewLabel={true}
                  />
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="mt-8 flex flex-col items-center space-y-6">
              <div className="flex items-center space-x-6">
                <Button
                  onClick={toggleAudio}
                  variant="ghost"
                  size="icon"
                  className={`rounded-full w-14 h-14 transition-all duration-200 ${
                    isAudioEnabled 
                      ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                      : 'bg-red-600 hover:bg-red-700 text-white'
                  }`}
                >
                  {isAudioEnabled ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
                </Button>

                <Button
                  onClick={toggleVideo}
                  variant="ghost"
                  size="icon"
                  className={`rounded-full w-14 h-14 transition-all duration-200 ${
                    isVideoEnabled 
                      ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                      : 'bg-red-600 hover:bg-red-700 text-white'
                  }`}
                >
                  {isVideoEnabled ? <Camera className="h-6 w-6" /> : <CameraOff className="h-6 w-6" />}
                </Button>
              </div>

              <div className="text-center space-y-2">
                <p className="text-gray-400 text-sm">
                  Make sure your camera and microphone are working properly
                </p>
                <Button 
                  onClick={startInterview}
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white hover:shadow-[0_0_25px_rgba(168,85,247,0.4)] hover:scale-105 font-semibold px-12 py-4 text-lg rounded-xl transition-all duration-300 border border-white/20"
                >
                  Start Interview
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white relative overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 bg-gray-900/95 backdrop-blur-sm border-b border-gray-700 z-20">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center space-x-3">
            <h1 className="text-white font-semibold">AI Interview</h1>
            <span className="text-gray-400">•</span>
            <span className="text-gray-400 text-sm">{companyName} - {jobTitle}</span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <Clock className="h-4 w-4" />
              <span>
                {isGreetingPhase ? 'Greeting' : `Question ${currentQuestionIndex + 1} of ${questions.length}`}
              </span>
            </div>
            <div className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-medium">
              REC
            </div>
          </div>
        </div>
      </div>

      {/* Debug Status Indicator */}
      <div className="absolute bottom-24 left-4 z-30">
        <div className="bg-black/80 backdrop-blur-sm rounded-lg px-3 py-2 text-xs text-gray-300">
          {conversationState === 'greeting' && '🟢 AI Speaking...'}
          {conversationState === 'question' && '🟢 AI Asking Question...'}
          {conversationState === 'waiting' && '🟡 Listening for your response...'}
          {conversationState === 'acknowledging' && '🔵 AI Acknowledging...'}
          {conversationState === 'transitioning' && '🔄 Moving to next question...'}
        </div>
      </div>

      {/* Main Video Grid */}
      <div className="absolute inset-0 pt-16 pb-20 grid grid-cols-1 lg:grid-cols-2 gap-2 p-2">
        {/* AI Interviewer */}
        <div className="relative bg-gray-900 rounded-lg overflow-hidden">
          <DIDAvatar
            videoUrl={currentVideoUrl}
            isGenerating={isGenerating}
            isPlaying={isPlaying}
            onVideoEnd={handleVideoEnd}
            fallbackImageUrl="https://d-id-public-bucket.s3.us-west-2.amazonaws.com/alice.jpg"
          />
          
          <div className="absolute bottom-3 left-3">
            <div className="bg-black/60 px-2 py-1 rounded text-xs">
              AI Interviewer
            </div>
          </div>

          {/* Subtitles */}
          {showSubtitles && currentSubtitle && (
            <div className="absolute bottom-16 left-4 right-4">
              <div className="bg-black/80 backdrop-blur-sm rounded-lg px-4 py-2">
                <p className="text-white text-sm text-center leading-relaxed">
                  {currentSubtitle}
                </p>
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
            hasPermissionError={hasPermissionError}
          />
        </div>
      </div>

      {/* Current Question Overlay */}
      {currentQuestion && conversationState === 'question' && !isGreetingPhase && (
        <div className="absolute top-20 left-4 right-4 z-10">
          <Card className="bg-gray-900/90 backdrop-blur-sm border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-blue-400 font-medium">{currentQuestion.category}</span>
                {isWaitingForAnswer && (
                  <span className="text-xs text-green-400 animate-pulse">Listening...</span>
                )}
              </div>
              <p className="text-white text-sm">{currentQuestion.question}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Conversation Status */}
      {conversationState === 'waiting' && (
        <div className="absolute bottom-32 left-4 right-4 z-10">
          <div className="bg-blue-600/20 backdrop-blur-sm border border-blue-500/30 rounded-lg px-4 py-2">
            <p className="text-blue-300 text-sm text-center">
              {isGreetingPhase ? "Please share how you're feeling today..." : "Please share your response..."}
            </p>
          </div>
        </div>
      )}

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
