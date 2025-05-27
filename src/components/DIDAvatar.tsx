
import React, { useRef, useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Volume2, Loader2 } from 'lucide-react';

interface DIDAvatarProps {
  videoUrl: string | null;
  isGenerating: boolean;
  isPlaying: boolean;
  onVideoEnd?: () => void;
  fallbackImageUrl?: string;
}

const DIDAvatar: React.FC<DIDAvatarProps> = ({
  videoUrl,
  isGenerating,
  isPlaying,
  onVideoEnd,
  fallbackImageUrl = '/placeholder.svg'
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoError, setVideoError] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Handle user interaction to enable autoplay
  useEffect(() => {
    const handleUserInteraction = () => {
      setHasInteracted(true);
    };

    document.addEventListener('click', handleUserInteraction, { once: true });
    document.addEventListener('touchstart', handleUserInteraction, { once: true });

    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
    };
  }, []);

  useEffect(() => {
    if (videoUrl && videoRef.current && isPlaying && hasInteracted) {
      console.log('Playing D-ID video with audio:', videoUrl);
      setVideoError(false);
      
      const video = videoRef.current;
      video.src = videoUrl;
      video.muted = false; // Ensure audio is not muted
      video.volume = 1; // Set volume to maximum
      
      video.play().catch((error) => {
        console.error('Video play error:', error);
        setVideoError(true);
      });
    }
  }, [videoUrl, isPlaying, hasInteracted]);

  const handleVideoEnd = () => {
    console.log('D-ID video ended');
    onVideoEnd?.();
  };

  const handleVideoError = () => {
    console.error('D-ID video error');
    setVideoError(true);
    onVideoEnd?.();
  };

  const handleVideoCanPlay = () => {
    console.log('D-ID video can play');
    if (videoRef.current && isPlaying) {
      videoRef.current.play().catch(console.error);
    }
  };

  if (isGenerating) {
    return (
      <div className="relative w-full h-full flex items-center justify-center">
        <Avatar className="w-40 h-40 border-4 border-blue-500 animate-pulse">
          <AvatarImage src={fallbackImageUrl} alt="AI Recruiter" />
          <AvatarFallback className="bg-gradient-to-br from-purple-600 to-pink-600 text-3xl font-bold">
            AI
          </AvatarFallback>
        </Avatar>
        <div className="absolute -bottom-2 -right-2 bg-blue-500 rounded-full p-2">
          <Loader2 className="h-4 w-4 text-white animate-spin" />
        </div>
      </div>
    );
  }

  if (videoUrl && !videoError && isPlaying) {
    return (
      <div className="relative w-full h-full">
        <video
          ref={videoRef}
          className="w-full h-full object-cover rounded-lg"
          onEnded={handleVideoEnd}
          onError={handleVideoError}
          onCanPlay={handleVideoCanPlay}
          autoPlay
          playsInline
          muted={false}
          controls={false}
        />
        
        {/* Speaking indicator */}
        <div className="absolute top-3 right-3">
          <div className="bg-green-500/80 rounded-full px-3 py-1">
            <Volume2 className="h-4 w-4 text-white" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <Avatar className="w-40 h-40 border-4 border-purple-500/50">
        <AvatarImage src={fallbackImageUrl} alt="AI Recruiter" />
        <AvatarFallback className="bg-gradient-to-br from-purple-600 to-pink-600 text-3xl font-bold">
          AI
        </AvatarFallback>
      </Avatar>
      {!hasInteracted && (
        <div className="absolute bottom-2 left-2 right-2 bg-black/80 rounded px-2 py-1">
          <p className="text-white text-xs text-center">Click anywhere to enable audio</p>
        </div>
      )}
    </div>
  );
};

export default DIDAvatar;
