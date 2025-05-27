
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

  useEffect(() => {
    if (videoUrl && videoRef.current && isPlaying) {
      setVideoError(false);
      videoRef.current.src = videoUrl;
      videoRef.current.play().catch(() => {
        setVideoError(true);
      });
    }
  }, [videoUrl, isPlaying]);

  const handleVideoEnd = () => {
    onVideoEnd?.();
  };

  const handleVideoError = () => {
    setVideoError(true);
    onVideoEnd?.();
  };

  if (isGenerating) {
    return (
      <div className="relative">
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
      <div className="relative">
        <video
          ref={videoRef}
          className="w-40 h-40 rounded-full object-cover border-4 border-green-500"
          onEnded={handleVideoEnd}
          onError={handleVideoError}
          autoPlay
          muted={false}
        />
        <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-2">
          <Volume2 className="h-4 w-4 text-white" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <Avatar className="w-40 h-40 border-4 border-purple-500/50">
        <AvatarImage src={fallbackImageUrl} alt="AI Recruiter" />
        <AvatarFallback className="bg-gradient-to-br from-purple-600 to-pink-600 text-3xl font-bold">
          AI
        </AvatarFallback>
      </Avatar>
    </div>
  );
};

export default DIDAvatar;
