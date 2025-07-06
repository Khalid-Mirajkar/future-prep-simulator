import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UseDIAVoiceReturn {
  isGenerating: boolean;
  isPlaying: boolean;
  currentSubtitle: string;
  speakText: (text: string) => Promise<void>;
}

export const useDIAVoice = (): UseDIAVoiceReturn => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSubtitle, setCurrentSubtitle] = useState('');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  const speakText = useCallback(async (text: string) => {
    console.log('Starting DIA voice generation for text:', text);
    
    try {
      setIsGenerating(true);
      setIsPlaying(false);
      setCurrentSubtitle(text);

      // Call our Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('dia-voice-generation', {
        body: { text }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.success || !data.audioContent) {
        throw new Error('Failed to generate voice with DIA model');
      }

      console.log('DIA voice generated successfully');

      // Create audio blob from base64
      const audioData = atob(data.audioContent);
      const audioArray = new Uint8Array(audioData.length);
      for (let i = 0; i < audioData.length; i++) {
        audioArray[i] = audioData.charCodeAt(i);
      }
      
      const audioBlob = new Blob([audioArray], { type: 'audio/wav' });
      const audioUrl = URL.createObjectURL(audioBlob);

      // Stop any current audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      // Create and play new audio
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onloadstart = () => {
        console.log('DIA audio loading...');
      };

      audio.oncanplay = () => {
        console.log('DIA audio ready to play');
        setIsGenerating(false);
        setIsPlaying(true);
        audio.play();
      };

      audio.onended = () => {
        console.log('DIA audio playback finished');
        setIsPlaying(false);
        setCurrentSubtitle('');
        URL.revokeObjectURL(audioUrl);
        audioRef.current = null;
      };

      audio.onerror = (event) => {
        console.error('DIA audio playback error:', event);
        setIsGenerating(false);
        setIsPlaying(false);
        setCurrentSubtitle('');
        URL.revokeObjectURL(audioUrl);
        audioRef.current = null;
        
        toast({
          variant: "destructive",
          title: "Audio Playback Error",
          description: "Failed to play generated voice audio.",
        });
      };

      // Load the audio
      audio.load();

    } catch (error) {
      console.error('DIA voice error:', error);
      setIsGenerating(false);
      setIsPlaying(false);
      setCurrentSubtitle('');

      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      toast({
        variant: "destructive",
        title: "Voice Generation Failed",
        description: `DIA voice generation failed: ${errorMessage}. Falling back to browser voice.`,
      });

      // Fallback to browser speech synthesis
      try {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.95;
        utterance.pitch = 1.1;
        utterance.volume = 0.95;

        utterance.onstart = () => {
          console.log('Fallback speech started');
          setIsPlaying(true);
        };

        utterance.onend = () => {
          console.log('Fallback speech finished');
          setIsPlaying(false);
          setCurrentSubtitle('');
        };

        speechSynthesis.speak(utterance);
      } catch (fallbackError) {
        console.error('Fallback speech failed:', fallbackError);
        setCurrentSubtitle('');
      }
    }
  }, [toast]);

  return {
    isGenerating,
    isPlaying,
    currentSubtitle,
    speakText
  };
};