
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
      
      // Create speech synthesis utterance
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      
      // Find a good voice (prefer female voices for consistency)
      const voices = speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.name.includes('Jenny') || 
        voice.name.includes('Zira') || 
        voice.name.includes('Female') ||
        voice.lang.startsWith('en')
      );
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      
      utterance.onstart = () => {
        console.log('Speech started');
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
      
      speechSynthesis.speak(utterance);
      
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
