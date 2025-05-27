import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Mic, MicOff } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useDIDAvatar } from '@/hooks/useDIDAvatar';
import DIDAvatar from '@/components/DIDAvatar';

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
  const [isListening, setIsListening] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [responses, setResponses] = useState<InterviewResponse[]>([]);
  const [interviewStartTime, setInterviewStartTime] = useState<number>(0);
  const [questionStartTime, setQuestionStartTime] = useState<number>(0);
  const [showTranscript, setShowTranscript] = useState(false);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const { toast } = useToast();

  // Get D-ID API key from environment or fallback
  const { isGenerating, currentVideoUrl, speakText, isPlaying } = useDIDAvatar();

  // Sample interview questions (we'll generate these dynamically later)
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

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        setCurrentTranscript(finalTranscript || interimTranscript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        toast({
          variant: "destructive",
          title: "Speech Recognition Error",
          description: "Please check your microphone permissions and try again.",
        });
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [toast]);

  const startInterview = async () => {
    setInterviewStarted(true);
    setInterviewStartTime(Date.now());
    
    // Avatar greeting using D-ID
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
      await speakText(question.question);
      
      // Start listening after avatar finishes speaking
      setTimeout(() => {
        startListening();
      }, 2000);
    }
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setCurrentTranscript('');
      setShowTranscript(true);
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      setShowTranscript(false);
    }
  };

  const submitAnswer = async () => {
    if (!currentTranscript.trim()) {
      toast({
        variant: "destructive",
        title: "No Response Detected",
        description: "Please provide an answer before proceeding.",
      });
      return;
    }

    stopListening();
    
    const question = questions[currentQuestionIndex];
    const timeSpent = Math.round((Date.now() - questionStartTime) / 1000);
    
    // Evaluate the response (placeholder for now)
    const evaluation = await evaluateResponse(question.question, currentTranscript);
    
    const response: InterviewResponse = {
      questionId: question.id,
      question: question.question,
      answer: currentTranscript,
      score: evaluation.score,
      evaluation: evaluation.feedback,
      timeSpent
    };

    setResponses(prev => [...prev, response]);
    setCurrentTranscript('');
    
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
    // Placeholder evaluation - we'll integrate with OpenAI API later
    const wordCount = answer.split(' ').length;
    const score = Math.min(10, Math.max(1, Math.round(wordCount / 10)));
    const feedback = wordCount > 20 ? "Good detailed response!" : "Consider providing more specific examples.";
    
    return { score, feedback };
  };

  const endInterview = async () => {
    await speakText("Thank you for your time today. Your interview responses are being evaluated. Best of luck with your application!");
    
    const totalTime = Math.round((Date.now() - interviewStartTime) / 1000);
    setTimeout(() => {
      onInterviewComplete(responses, totalTime);
    }, 5000);
  };

  if (!interviewStarted) {
    return (
      <div className="flex flex-col items-center space-y-6">
        <DIDAvatar
          videoUrl={currentVideoUrl}
          isGenerating={isGenerating}
          isPlaying={isPlaying}
        />
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Meet Your AI Recruiter</h2>
          <p className="text-gray-400">Ready to conduct your interview simulation</p>
        </div>
        <Button 
          onClick={startInterview}
          size="lg"
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-8 py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
        >
          Start Interview
        </Button>
        <p className="text-gray-400 text-sm max-w-md text-center">
          Click to begin your AI-powered video interview simulation.
        </p>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="flex flex-col items-center space-y-6">
      {/* AI Recruiter Avatar with D-ID Integration */}
      <DIDAvatar
        videoUrl={currentVideoUrl}
        isGenerating={isGenerating}
        isPlaying={isPlaying}
        onVideoEnd={() => {
          // Avatar finished speaking, ready for user input
        }}
      />

      {/* Question Display */}
      <Card className="max-w-2xl w-full bg-gray-900 border-gray-700">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-purple-400">Question {currentQuestionIndex + 1} of {questions.length}</span>
            <span className="text-sm text-gray-400">{currentQuestion.category}</span>
          </div>
          <p className="text-lg text-white">{currentQuestion.question}</p>
        </CardContent>
      </Card>

      {/* Transcript Display */}
      {showTranscript && (
        <Card className="max-w-2xl w-full bg-gray-800 border-gray-600">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Mic className={`h-4 w-4 ${isListening ? 'text-red-500 animate-pulse' : 'text-gray-400'}`} />
              <span className="text-sm text-gray-400">
                {isListening ? 'Listening...' : 'Stopped listening'}
              </span>
            </div>
            <p className="text-white min-h-[60px]">
              {currentTranscript || "Start speaking..."}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Controls */}
      <div className="flex items-center gap-4">
        {!isGenerating && !isPlaying && (
          <>
            <Button
              onClick={isListening ? stopListening : startListening}
              variant="outline"
              size="lg"
              className={`${isListening ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'} text-white border-0`}
            >
              {isListening ? <MicOff className="h-5 w-5 mr-2" /> : <Mic className="h-5 w-5 mr-2" />}
              {isListening ? 'Stop Recording' : 'Start Recording'}
            </Button>
            
            {currentTranscript && (
              <Button
                onClick={submitAnswer}
                size="lg"
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Submit Answer
              </Button>
            )}
          </>
        )}
      </div>

      {/* Progress */}
      <div className="w-full max-w-2xl bg-gray-800 rounded-full h-2">
        <div 
          className="bg-purple-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
        />
      </div>
    </div>
  );
};

export default AIInterviewSession;
