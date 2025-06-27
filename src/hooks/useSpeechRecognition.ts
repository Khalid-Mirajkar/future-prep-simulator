
import { useState, useRef, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface UseSpeechRecognitionReturn {
  isListening: boolean;
  transcript: string;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
  forceRestart: () => void;
}

export const useSpeechRecognition = (): UseSpeechRecognitionReturn => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onstart = () => {
        console.log('🎙️ Speech recognition started successfully');
        setIsListening(true);
      };

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

        setTranscript(finalTranscript || interimTranscript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        
        // Don't show toast for common errors that we can handle
        if (event.error !== 'aborted' && event.error !== 'no-speech') {
          toast({
            variant: "destructive",
            title: "Speech Recognition Error",
            description: "Please check your microphone permissions and try again.",
          });
        }
      };

      recognitionRef.current.onend = () => {
        console.log('🛑 Speech recognition ended');
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [toast]);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      try {
        console.log('⏺️ Starting speech recognition...');
        setTranscript('');
        recognitionRef.current.start();
      } catch (error) {
        console.error('❌ Failed to start speech recognition:', error);
        setIsListening(false);
      }
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      console.log('⏹️ Stopping speech recognition...');
      recognitionRef.current.stop();
    }
  }, [isListening]);

  const forceRestart = useCallback(() => {
    if (recognitionRef.current) {
      console.log('🔄 Force restarting speech recognition...');
      
      // Stop current recognition
      try {
        recognitionRef.current.abort();
      } catch (error) {
        console.log('Note: abort() failed, continuing with restart...');
      }
      
      // Wait a moment then restart
      setTimeout(() => {
        try {
          console.log('⏺️ Starting fresh speech recognition...');
          setTranscript('');
          setIsListening(false);
          recognitionRef.current?.start();
        } catch (error) {
          console.error('❌ Failed to restart speech recognition:', error);
          setIsListening(false);
        }
      }, 100);
    }
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
  }, []);

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    resetTranscript,
    forceRestart
  };
};
