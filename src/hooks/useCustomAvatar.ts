
import { useState, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

interface UseCustomAvatarReturn {
  isGenerating: boolean;
  isPlaying: boolean;
  speakText: (text: string) => Promise<void>;
}

export const useCustomAvatar = (): UseCustomAvatarReturn => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  const speakText = useCallback(async (text: string) => {
    console.log('Starting custom avatar speech for text:', text);
    
    try {
      setIsGenerating(true);
      setIsPlaying(false);
      
      // Wait for voices to be loaded
      await new Promise<void>((resolve) => {
        const checkVoices = () => {
          const voices = speechSynthesis.getVoices();
          if (voices.length > 0) {
            resolve();
          } else {
            setTimeout(checkVoices, 100);
          }
        };
        checkVoices();
      });
      
      // Create speech synthesis utterance
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Optimal settings for professional, Siri-like voice
      utterance.rate = 1.1; // Slightly faster than normal for professional pace
      utterance.pitch = 1.0; // Natural pitch
      utterance.volume = 0.9; // Clear volume
      
      // Find the best female voice (prioritize natural sounding voices)
      const voices = speechSynthesis.getVoices();
      console.log('Available voices:', voices.map(v => ({ name: v.name, lang: v.lang, gender: v.name })));
      
      // Prioritize high-quality female voices
      const preferredVoice = voices.find(voice => {
        const name = voice.name.toLowerCase();
        const isEnglish = voice.lang.startsWith('en');
        
        // Look for premium/natural voices first
        if (isEnglish && (
          name.includes('samantha') || // macOS high-quality voice
          name.includes('alex') ||     // macOS clear voice
          name.includes('karen') ||    // High-quality Australian
          name.includes('tessa') ||    // South African clear voice
          name.includes('moira') ||    // Irish clear voice
          name.includes('fiona') ||    // Scottish clear voice
          name.includes('premium') ||
          name.includes('enhanced') ||
          name.includes('neural')
        )) {
          return true;
        }
        
        // Fallback to other good female voices
        return isEnglish && (
          name.includes('female') ||
          name.includes('woman') ||
          name.includes('zira') ||     // Windows female voice
          name.includes('hazel') ||    // UK female voice
          name.includes('jenny') ||    // US female voice
          name.includes('aria')        // Another quality voice
        );
      }) || voices.find(voice => 
        voice.lang.startsWith('en') && voice.name.toLowerCase().includes('female')
      ) || voices.find(voice => 
        voice.lang.startsWith('en-US')
      );
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
        console.log('Selected voice:', preferredVoice.name, preferredVoice.lang);
      } else {
        console.log('Using default voice');
      }
      
      utterance.onstart = () => {
        console.log('Speech started with voice:', utterance.voice?.name || 'default');
        setIsGenerating(false);
        setIsPlaying(true);
      };
      
      utterance.onend = () => {
        console.log('Speech finished');
        setIsPlaying(false);
      };
      
      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        setIsGenerating(false);
        setIsPlaying(false);
        
        toast({
          variant: "destructive",
          title: "Speech Error",
          description: "Failed to generate speech. Please check your browser's speech synthesis support.",
        });
      };
      
      // Cancel any ongoing speech before starting new one
      speechSynthesis.cancel();
      
      // Small delay to ensure cancellation is processed
      setTimeout(() => {
        speechSynthesis.speak(utterance);
      }, 100);
      
    } catch (error) {
      console.error('Custom avatar error:', error);
      setIsGenerating(false);
      setIsPlaying(false);
      
      toast({
        variant: "destructive",
        title: "Avatar Error",
        description: "Failed to generate speech with custom avatar.",
      });
    }
  }, [toast]);

  return {
    isGenerating,
    isPlaying,
    speakText
  };
};
