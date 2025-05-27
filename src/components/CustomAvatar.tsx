
import React, { useRef, useEffect, useState } from 'react';
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
  const [blinkState, setBlinkState] = useState(0);

  const setupAudioAnalysis = (audioElement: HTMLAudioElement) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    const audioContext = audioContextRef.current;
    const source = audioContext.createMediaElementSource(audioElement);
    const analyser = audioContext.createAnalyser();
    
    analyser.fftSize = 512;
    analyser.smoothingTimeConstant = 0.3;
    
    source.connect(analyser);
    analyser.connect(audioContext.destination);
    
    analyserRef.current = analyser;
    
    return analyser;
  };

  const drawRealisticHuman = (mouthValue: number, blinkValue: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Professional office background
    const bgGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    bgGradient.addColorStop(0, '#f5f5f5');
    bgGradient.addColorStop(0.4, '#e8e8e8');
    bgGradient.addColorStop(1, '#d0d0d0');
    
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Office elements - modern office background
    // Window with light
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillRect(canvas.width - 80, 10, 70, 100);
    
    // Window frames
    ctx.strokeStyle = '#888';
    ctx.lineWidth = 2;
    ctx.strokeRect(canvas.width - 80, 10, 35, 100);
    ctx.strokeRect(canvas.width - 45, 10, 35, 100);
    
    // Blurred office furniture
    ctx.fillStyle = 'rgba(100, 100, 100, 0.3)';
    ctx.fillRect(10, 140, 60, 40);
    ctx.fillRect(canvas.width - 70, 130, 50, 50);
    
    // Professional blazer - more realistic colors
    const blazerGradient = ctx.createLinearGradient(80, 180, 80, canvas.height);
    blazerGradient.addColorStop(0, '#2c3e50');
    blazerGradient.addColorStop(1, '#34495e');
    
    ctx.fillStyle = blazerGradient;
    ctx.beginPath();
    ctx.moveTo(50, canvas.height);
    ctx.lineTo(45, 185);
    ctx.lineTo(65, 175);
    ctx.lineTo(95, 175);
    ctx.lineTo(115, 185);
    ctx.lineTo(110, canvas.height);
    ctx.closePath();
    ctx.fill();
    
    // Professional shirt
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(70, canvas.height);
    ctx.lineTo(68, 190);
    ctx.lineTo(92, 190);
    ctx.lineTo(90, canvas.height);
    ctx.closePath();
    ctx.fill();
    
    // Collar
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(68, 190);
    ctx.lineTo(75, 185);
    ctx.lineTo(80, 190);
    ctx.lineTo(85, 185);
    ctx.lineTo(92, 190);
    ctx.stroke();
    
    // Neck - more realistic skin tone
    ctx.fillStyle = '#f4c2a1';
    ctx.beginPath();
    ctx.ellipse(80, 165, 12, 18, 0, 0, 2 * Math.PI);
    ctx.fill();
    
    // Head - realistic proportions
    const headGradient = ctx.createRadialGradient(75, 115, 5, 80, 120, 40);
    headGradient.addColorStop(0, '#f8d0b8');
    headGradient.addColorStop(1, '#f4c2a1');
    
    ctx.fillStyle = headGradient;
    ctx.beginPath();
    ctx.ellipse(80, 125, 32, 38, 0, 0, 2 * Math.PI);
    ctx.fill();
    
    // Professional hairstyle - blonde/light brown
    ctx.fillStyle = '#c8a882';
    ctx.beginPath();
    ctx.ellipse(80, 95, 35, 28, 0, 0, Math.PI);
    ctx.fill();
    
    // Hair highlights
    ctx.fillStyle = '#d4b896';
    ctx.beginPath();
    ctx.ellipse(70, 90, 8, 15, -0.3, 0, Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(90, 90, 8, 15, 0.3, 0, Math.PI);
    ctx.fill();
    
    // Eyebrows - well-groomed
    ctx.fillStyle = '#8b6f47';
    ctx.beginPath();
    ctx.ellipse(68, 108, 10, 3, -0.1, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(92, 108, 10, 3, 0.1, 0, 2 * Math.PI);
    ctx.fill();
    
    // Eyes - more realistic with blinking
    const eyeHeight = blinkValue > 0.8 ? 2 : 8;
    
    // Eye whites
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(68, 118, 9, eyeHeight, 0, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(92, 118, 9, eyeHeight, 0, 0, 2 * Math.PI);
    ctx.fill();
    
    if (eyeHeight > 2) {
      // Irises - blue eyes
      ctx.fillStyle = '#4a90c2';
      ctx.beginPath();
      ctx.arc(68, 118, 5, 0, 2 * Math.PI);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(92, 118, 5, 0, 2 * Math.PI);
      ctx.fill();
      
      // Pupils
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(68, 118, 3, 0, 2 * Math.PI);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(92, 118, 3, 0, 2 * Math.PI);
      ctx.fill();
      
      // Eye highlights
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(69, 116, 1, 0, 2 * Math.PI);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(93, 116, 1, 0, 2 * Math.PI);
      ctx.fill();
    }
    
    // Eyelashes
    ctx.strokeStyle = '#2c1810';
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.moveTo(60 + i * 4, 114);
      ctx.lineTo(60 + i * 4, 112);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(84 + i * 4, 114);
      ctx.lineTo(84 + i * 4, 112);
      ctx.stroke();
    }
    
    // Nose - more refined
    ctx.fillStyle = '#f0b896';
    ctx.beginPath();
    ctx.ellipse(80, 128, 3, 6, 0, 0, 2 * Math.PI);
    ctx.fill();
    
    // Nostrils
    ctx.fillStyle = '#e8a882';
    ctx.beginPath();
    ctx.arc(78, 131, 1, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(82, 131, 1, 0, 2 * Math.PI);
    ctx.fill();
    
    // Mouth with realistic lip-sync
    const mouthY = 142;
    const mouthWidth = 16;
    const mouthHeight = Math.max(2, mouthValue * 10);
    
    // Lips
    ctx.fillStyle = '#d4838f';
    ctx.beginPath();
    if (mouthValue > 0.1) {
      // Open mouth
      ctx.ellipse(80, mouthY, mouthWidth, mouthHeight, 0, 0, 2 * Math.PI);
    } else {
      // Closed mouth - natural smile
      ctx.arc(80, mouthY, mouthWidth, 0.1, Math.PI - 0.1);
    }
    ctx.fill();
    
    // Lip line when mouth is closed
    if (mouthValue < 0.1) {
      ctx.strokeStyle = '#c47682';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(80, mouthY, mouthWidth, 0.1, Math.PI - 0.1);
      ctx.stroke();
    }
    
    // Teeth when mouth is open
    if (mouthValue > 0.3) {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(80, mouthY - 2, mouthWidth - 4, mouthHeight - 4, 0, 0, 2 * Math.PI);
      ctx.fill();
    }
    
    // Cheek contours for dimension
    ctx.fillStyle = 'rgba(240, 184, 150, 0.3)';
    ctx.beginPath();
    ctx.ellipse(60, 130, 8, 12, 0, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(100, 130, 8, 12, 0, 0, 2 * Math.PI);
    ctx.fill();
    
    // Subtle makeup/professional appearance
    ctx.fillStyle = 'rgba(200, 150, 140, 0.2)';
    ctx.beginPath();
    ctx.ellipse(68, 124, 12, 6, 0, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(92, 124, 12, 6, 0, 0, 2 * Math.PI);
    ctx.fill();
  };

  const analyzeAudio = () => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);
    
    // Calculate average frequency for mouth movement
    const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
    const normalized = Math.min(average / 80, 1); // More sensitive
    
    setMouthOpenness(normalized);
    
    if (isPlaying) {
      animationFrameRef.current = requestAnimationFrame(analyzeAudio);
    }
  };

  // Blinking animation
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlinkState(1);
      setTimeout(() => setBlinkState(0), 150);
    }, 3000 + Math.random() * 2000);

    return () => clearInterval(blinkInterval);
  }, []);

  useEffect(() => {
    drawRealisticHuman(mouthOpenness, blinkState);
  }, [mouthOpenness, blinkState]);

  useEffect(() => {
    if (isPlaying) {
      analyzeAudio();
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      setMouthOpenness(0);
      drawRealisticHuman(0, blinkState);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, blinkState]);

  if (isGenerating) {
    return (
      <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-300">
        <div className="text-center">
          <Loader2 className="h-8 w-8 text-gray-600 animate-spin mx-auto mb-2" />
          <p className="text-gray-600 text-sm">Connecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        width={320}
        height={240}
        className="w-full h-full object-cover"
      />
      {isPlaying && (
        <div className="absolute top-3 right-3 bg-green-500/80 rounded-full p-2">
          <Volume2 className="h-3 w-3 text-white" />
        </div>
      )}
    </div>
  );
};

export default CustomAvatar;
