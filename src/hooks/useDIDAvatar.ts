
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
      // Create the talk with enhanced voice settings
      const talkResponse = await didService.createTalk({
        text,
        voice: {
          type: 'microsoft',
          voice_id: 'en-US-AriaNeural' // Premium neural voice for more natural sound
        }
      });

      console.log('D-ID talk created, waiting for completion...');
      // Wait for completion and get video URL
      const videoUrl = await didService.waitForCompletion(talkResponse.id);
      
      console.log('D-ID video generated successfully:', videoUrl);
      setCurrentVideoUrl(videoUrl);
      setIsGenerating(false);
      setIsPlaying(true);
      
      // Auto-stop playing after estimated duration plus buffer
      const estimatedDuration = Math.max(5000, text.length * 100); // Rough estimate
      setTimeout(() => {
        console.log('Auto-stopping D-ID video playback');
        setIsPlaying(false);
      }, estimatedDuration);
      
    } catch (error) {
      console.error('D-ID avatar error:', error);
      setIsGenerating(false);
      setIsPlaying(false);
      
      // Show specific error message
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      toast({
        variant: "destructive",
        title: "Avatar Generation Failed",
        description: `Failed to generate avatar video: ${errorMessage}. Using enhanced fallback audio.`,
      });
      
      // Enhanced fallback to browser text-to-speech
      console.log('Falling back to enhanced browser text-to-speech...');
      try {
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

        const utterance = new SpeechSynthesisUtterance(text);
        
        // Enhanced voice settings for fallback
        utterance.rate = 0.95;
        utterance.pitch = 1.1;
        utterance.volume = 0.95;
        
        // Find premium voice for fallback
        const voices = speechSynthesis.getVoices();
        const premiumVoice = voices.find(voice => {
          const name = voice.name.toLowerCase();
          const isEnglish = voice.lang.startsWith('en');
          const isPremium = name.includes('neural') || name.includes('premium') || 
                           name.includes('zira') || name.includes('hazel') || 
                           name.includes('aria') || name.includes('jenny');
          return isEnglish && isPremium;
        }) || voices.find(voice => 
          voice.lang.startsWith('en') && voice.name.toLowerCase().includes('female')
        );
        
        if (premiumVoice) {
          utterance.voice = premiumVoice;
          console.log('Using premium fallback voice:', premiumVoice.name);
        }
        
        // Add natural pauses for better pacing
        const enhancedText = text
          .replace(/\./g, '. ')
          .replace(/\?/g, '? ')
          .replace(/!/g, '! ')
          .replace(/,/g, ', ')
          .replace(/\s+/g, ' ')
          .trim();
        
        utterance.text = enhancedText;
        
        utterance.onstart = () => {
          console.log('Enhanced fallback speech started');
          setIsPlaying(true);
        };
        
        utterance.onend = () => {
          console.log('Enhanced fallback speech finished');
          setIsPlaying(false);
        };
        
        utterance.onerror = (event) => {
          console.error('Enhanced fallback speech error:', event);
          setIsPlaying(false);
        };
        
        speechSynthesis.cancel();
        setTimeout(() => {
          speechSynthesis.speak(utterance);
        }, 150);
        
      } catch (speechError) {
        console.error('Enhanced text-to-speech fallback failed:', speechError);
        setIsPlaying(false);
      }
    }
  }, [toast]);

  return {
    isGenerating,
    currentVideoUrl,
    speakText,
    isPlaying
  };
};
