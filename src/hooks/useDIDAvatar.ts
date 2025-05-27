
import { useState, useCallback } from 'react';
import DIDService from '@/services/didService';
import { useToast } from '@/hooks/use-toast';

interface UseDIDAvatarReturn {
  isGenerating: boolean;
  currentVideoUrl: string | null;
  speakText: (text: string) => Promise<void>;
  isPlaying: boolean;
}

export const useDIDAvatar = (): UseDIDAvatarReturn => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const { toast } = useToast();

  const speakText = useCallback(async (text: string) => {
    try {
      setIsGenerating(true);
      setIsPlaying(false);
      const didService = new DIDService();
      
      // Create the talk
      const talkResponse = await didService.createTalk({
        text,
        voice: {
          type: 'microsoft',
          voice_id: 'en-US-JennyNeural'
        }
      });

      // Wait for completion and get video URL
      const videoUrl = await didService.waitForCompletion(talkResponse.id);
      setCurrentVideoUrl(videoUrl);
      setIsPlaying(true);
      
    } catch (error) {
      console.error('D-ID avatar error:', error);
      toast({
        variant: "destructive",
        title: "Avatar Error",
        description: "Failed to generate avatar video. Using fallback audio.",
      });
      
      // Fallback to browser text-to-speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      
      utterance.onend = () => {
        setIsPlaying(false);
      };
      
      speechSynthesis.speak(utterance);
      setIsPlaying(true);
      
    } finally {
      setIsGenerating(false);
    }
  }, [toast]);

  return {
    isGenerating,
    currentVideoUrl,
    speakText,
    isPlaying
  };
};
