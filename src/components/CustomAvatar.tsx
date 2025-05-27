
import React, { useRef, useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Volume2, Loader2 } from 'lucide-react';

interface CustomAvatarProps {
  isGenerating: boolean;
  isPlaying: boolean;
  onSpeechEnd?: () => void;
  fallbackImageUrl?: string;
}

const CustomAvatar: React.FC<CustomAvatarProps> = ({
  isGenerating,
  isPlaying,
  onSpeechEnd,
  fallbackImageUrl = '/placeholder.svg'
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const [mouthOpenness, setMouthOpenness] = useState(0);

  const setupAudioAnalysis = (audioElement: HTMLAudioElement) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    const audioContext = audioContextRef.current;
    const source = audioContext.createMediaElementSource(audioElement);
    const analyser = audioContext.createAnalyser();
    
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.8;
    
    source.connect(analyser);
    analyser.connect(audioContext.destination);
    
    analyserRef.current = analyser;
    
    return analyser;
  };

  const drawAvatar = (mouthValue: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw head (circle)
    ctx.fillStyle = '#8B5CF6';
    ctx.beginPath();
    ctx.arc(80, 80, 70, 0, 2 * Math.PI);
    ctx.fill();
    
    // Draw eyes
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(60, 65, 8, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(100, 65, 8, 0, 2 * Math.PI);
    ctx.fill();
    
    // Draw pupils
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(60, 65, 4, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(100, 65, 4, 0, 2 * Math.PI);
    ctx.fill();
    
    // Draw mouth based on audio analysis
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    const mouthY = 100;
    const mouthHeight = Math.max(2, mouthValue * 20);
    ctx.ellipse(80, mouthY, 15, mouthHeight, 0, 0, 2 * Math.PI);
    ctx.fill();
  };

  const analyzeAudio = () => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);
    
    // Calculate average frequency for mouth movement
    const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
    const normalized = Math.min(average / 128, 1);
    
    setMouthOpenness(normalized);
    drawAvatar(normalized);
    
    if (isPlaying) {
      animationFrameRef.current = requestAnimationFrame(analyzeAudio);
    }
  };

  useEffect(() => {
    drawAvatar(mouthOpenness);
  }, [mouthOpenness]);

  useEffect(() => {
    if (isPlaying) {
      analyzeAudio();
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      setMouthOpenness(0);
      drawAvatar(0);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying]);

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

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={160}
        height={160}
        className="rounded-full border-4 border-green-500"
        style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
      />
      {isPlaying && (
        <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-2">
          <Volume2 className="h-4 w-4 text-white" />
        </div>
      )}
    </div>
  );
};

export default CustomAvatar;
