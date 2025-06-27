
import { useState, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

interface UseCustomAvatarReturn {
  isGenerating: boolean;
  isPlaying: boolean;
  currentSubtitle: string;
  speakText: (text: string) => Promise<void>;
}

export const useCustomAvatar = (): UseCustomAvatarReturn => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSubtitle, setCurrentSubtitle] = useState('');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  const speakText = useCallback(async (text: string) => {
    console.log('Starting enhanced avatar speech for text:', text);
    
    try {
      setIsGenerating(true);
      setIsPlaying(false);
      setCurrentSubtitle(text);
      
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
      
      // Create speech synthesis utterance with enhanced settings
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Enhanced voice settings for more natural sound
      utterance.rate = 0.95; // Slightly faster for more natural pace
      utterance.pitch = 1.1; // Slightly higher pitch for warmth
      utterance.volume = 0.95; // Clear, confident volume
      
      // Find the best premium female voice available
      const voices = speechSynthesis.getVoices();
      console.log('Available voices:', voices.map(v => ({ 
        name: v.name, 
        lang: v.lang, 
        localService: v.localService,
        default: v.default 
      })));
      
      // Priority order for high-quality female voices
      const preferredVoices = [
        // Premium English voices (UK/US)
        'Microsoft Zira - English (United States)',
        'Microsoft Hazel - English (Great Britain)',
        'Google UK English Female',
        'Google US English Female',
        'Karen', // Australian premium voice
        'Veena', // Indian English premium voice
        'Tessa', // South African premium voice
        'Moira', // Irish premium voice
        'Fiona', // Scottish premium voice
        'Samantha', // macOS premium voice
        'Victoria', // macOS premium voice
        'Allison', // macOS premium voice
        'Ava', // Premium neural voice
        'Emma', // Premium neural voice
        'Jenny', // Premium neural voice
        'Aria', // Premium neural voice
        // Enhanced fallbacks
        'Microsoft Zira Desktop',
        'Microsoft Hazel Desktop',
        'Google UK English Female',
        'Google US English Female'
      ];
      
      // Find the best available voice
      let selectedVoice = null;
      
      // First try to find premium voices by exact name match
      for (const preferredName of preferredVoices) {
        selectedVoice = voices.find(voice => 
          voice.name === preferredName && voice.lang.startsWith('en')
        );
        if (selectedVoice) {
          console.log('Found premium voice:', selectedVoice.name);
          break;
        }
      }
      
      // If no exact match, try partial matches for premium voices
      if (!selectedVoice) {
        const premiumKeywords = ['premium', 'enhanced', 'neural', 'wavenet', 'natural', 'zira', 'hazel', 'karen', 'samantha'];
        
        selectedVoice = voices.find(voice => {
          const name = voice.name.toLowerCase();
          const isEnglish = voice.lang.startsWith('en');
          const isPremium = premiumKeywords.some(keyword => name.includes(keyword));
          const isFemale = name.includes('female') || 
                          ['zira', 'hazel', 'karen', 'samantha', 'victoria', 'allison', 'ava', 'emma', 'jenny', 'aria'].some(n => name.includes(n));
          
          return isEnglish && (isPremium || isFemale);
        });
      }
      
      // Fallback to best available English female voice
      if (!selectedVoice) {
        selectedVoice = voices.find(voice => {
          const name = voice.name.toLowerCase();
          const isEnglish = voice.lang.startsWith('en');
          const isFemale = name.includes('female') || 
                          name.includes('woman') ||
                          ['zira', 'hazel', 'karen', 'moira', 'fiona', 'tessa', 'veena'].some(n => name.includes(n));
          
          return isEnglish && isFemale;
        });
      }
      
      // Final fallback to any good English voice
      if (!selectedVoice) {
        selectedVoice = voices.find(voice => 
          voice.lang.startsWith('en-US') || voice.lang.startsWith('en-GB')
        );
      }
      
      if (selectedVoice) {
        utterance.voice = selectedVoice;
        console.log('Selected voice:', selectedVoice.name, '| Lang:', selectedVoice.lang, '| Local:', selectedVoice.localService);
        
        // Adjust settings based on voice type
        if (selectedVoice.name.toLowerCase().includes('neural') || 
            selectedVoice.name.toLowerCase().includes('premium') ||
            selectedVoice.name.toLowerCase().includes('wavenet')) {
          // Premium voices can handle slightly faster pace
          utterance.rate = 1.0;
          utterance.pitch = 1.05;
        } else if (selectedVoice.name.toLowerCase().includes('samantha') ||
                   selectedVoice.name.toLowerCase().includes('karen')) {
          // These voices sound better with specific settings
          utterance.rate = 0.9;
          utterance.pitch = 1.0;
        }
      } else {
        console.log('Using default voice');
      }
      
      utterance.onstart = () => {
        console.log('Enhanced speech started with voice:', utterance.voice?.name || 'default');
        setIsGenerating(false);
        setIsPlaying(true);
      };
      
      utterance.onend = () => {
        console.log('Enhanced speech finished');
        setIsPlaying(false);
        setCurrentSubtitle('');
      };
      
      utterance.onerror = (event) => {
        console.error('Enhanced speech synthesis error:', event);
        setIsGenerating(false);
        setIsPlaying(false);
        setCurrentSubtitle('');
        
        toast({
          variant: "destructive",
          title: "Speech Error",
          description: "Failed to generate enhanced speech. Please check your browser's speech synthesis support.",
        });
      };
      
      // Add natural pauses between sentences for better pacing
      const enhancedText = text
        .replace(/\./g, '. ') // Add pause after periods
        .replace(/\?/g, '? ') // Add pause after questions
        .replace(/!/g, '! ') // Add pause after exclamations
        .replace(/,/g, ', ') // Slight pause after commas
        .replace(/\s+/g, ' ') // Clean up extra spaces
        .trim();
      
      utterance.text = enhancedText;
      
      // Cancel any ongoing speech before starting new one
      speechSynthesis.cancel();
      
      // Small delay to ensure cancellation is processed
      setTimeout(() => {
        speechSynthesis.speak(utterance);
      }, 150);
      
    } catch (error) {
      console.error('Enhanced avatar error:', error);
      setIsGenerating(false);
      setIsPlaying(false);
      setCurrentSubtitle('');
      
      toast({
        variant: "destructive",
        title: "Avatar Error",
        description: "Failed to generate enhanced speech with custom avatar.",
      });
    }
  }, [toast]);

  return {
    isGenerating,
    isPlaying,
    currentSubtitle,
    speakText
  };
};
