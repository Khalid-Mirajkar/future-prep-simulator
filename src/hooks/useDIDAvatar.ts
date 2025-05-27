
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
    console.log('Starting D-ID avatar generation for text:', text);
    
    try {
      setIsGenerating(true);
      setIsPlaying(false);
      setCurrentVideoUrl(null);
      
      const didService = new DIDService();
      
      console.log('Creating D-ID talk...');
      // Create the talk
      const talkResponse = await didService.createTalk({
        text,
        voice: {
          type: 'microsoft',
          voice_id: 'en-US-JennyNeural'
        }
      });

      console.log('D-ID talk created, waiting for completion...');
      // Wait for completion and get video URL
      const videoUrl = await didService.waitForCompletion(talkResponse.id);
      
      console.log('D-ID video generated successfully:', videoUrl);
      setCurrentVideoUrl(videoUrl);
      setIsPlaying(true);
      
    } catch (error) {
      console.error('D-ID avatar error:', error);
      
      // Show specific error message
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      toast({
        variant: "destructive",
        title: "Avatar Generation Failed",
        description: `Failed to generate avatar video: ${errorMessage}. Using fallback audio.`,
      });
      
      // Fallback to browser text-to-speech
      console.log('Falling back to browser text-to-speech...');
      try {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 0.8;
        
        utterance.onend = () => {
          console.log('Text-to-speech finished');
          setIsPlaying(false);
        };
        
        utterance.onerror = (event) => {
          console.error('Text-to-speech error:', event);
          setIsPlaying(false);
        };
        
        speechSynthesis.speak(utterance);
        setIsPlaying(true);
      } catch (speechError) {
        console.error('Text-to-speech fallback failed:', speechError);
        setIsPlaying(false);
      }
      
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
