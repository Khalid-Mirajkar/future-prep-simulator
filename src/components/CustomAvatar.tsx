
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

  const drawRealisticAvatar = (mouthValue: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw office background gradient
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#f8f9fa');
    gradient.addColorStop(0.3, '#e9ecef');
    gradient.addColorStop(0.7, '#dee2e6');
    gradient.addColorStop(1, '#ced4da');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw office elements (bookshelf, window)
    // Bookshelf
    ctx.fillStyle = '#8b4513';
    ctx.fillRect(canvas.width - 60, 20, 50, 120);
    
    // Books
    ctx.fillStyle = '#dc3545';
    ctx.fillRect(canvas.width - 55, 25, 8, 30);
    ctx.fillStyle = '#007bff';
    ctx.fillRect(canvas.width - 45, 25, 8, 30);
    ctx.fillStyle = '#28a745';
    ctx.fillRect(canvas.width - 35, 25, 8, 30);
    
    // Professional attire - suit jacket
    ctx.fillStyle = '#1a1a2e';
    ctx.beginPath();
    ctx.moveTo(60, canvas.height);
    ctx.lineTo(40, 180);
    ctx.lineTo(120, 180);
    ctx.lineTo(100, canvas.height);
    ctx.fill();
    
    // Shirt
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(70, canvas.height);
    ctx.lineTo(65, 190);
    ctx.lineTo(95, 190);
    ctx.lineTo(90, canvas.height);
    ctx.fill();
    
    // Tie
    ctx.fillStyle = '#0066cc';
    ctx.beginPath();
    ctx.moveTo(80, 190);
    ctx.lineTo(75, 210);
    ctx.lineTo(85, 210);
    ctx.fill();
    
    // Head (realistic skin tone)
    ctx.fillStyle = '#FDBCB4';
    ctx.beginPath();
    ctx.ellipse(80, 120, 35, 40, 0, 0, 2 * Math.PI);
    ctx.fill();
    
    // Hair
    ctx.fillStyle = '#8B4513';
    ctx.beginPath();
    ctx.ellipse(80, 95, 38, 25, 0, 0, Math.PI);
    ctx.fill();
    
    // Eyes
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.ellipse(70, 110, 8, 6, 0, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(90, 110, 8, 6, 0, 0, 2 * Math.PI);
    ctx.fill();
    
    // Pupils
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(70, 110, 4, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(90, 110, 4, 0, 2 * Math.PI);
    ctx.fill();
    
    // Eyebrows
    ctx.strokeStyle = '#654321';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(62, 100);
    ctx.lineTo(78, 98);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(82, 98);
    ctx.lineTo(98, 100);
    ctx.stroke();
    
    // Nose
    ctx.fillStyle = '#F4A490';
    ctx.beginPath();
    ctx.ellipse(80, 120, 4, 8, 0, 0, 2 * Math.PI);
    ctx.fill();
    
    // Mouth with realistic lip sync
    ctx.fillStyle = '#8B4513';
    ctx.beginPath();
    const mouthY = 135;
    const mouthHeight = Math.max(1, mouthValue * 12);
    const mouthWidth = 18 - (mouthValue * 4); // Width decreases as mouth opens
    ctx.ellipse(80, mouthY, mouthWidth, mouthHeight, 0, 0, 2 * Math.PI);
    ctx.fill();
    
    // Subtle smile lines
    if (mouthValue < 0.3) {
      ctx.strokeStyle = '#D2B48C';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(80, 135, 20, 0.2, Math.PI - 0.2);
      ctx.stroke();
    }
  };

  const analyzeAudio = () => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);
    
    // Calculate average frequency for mouth movement
    const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
    const normalized = Math.min(average / 100, 1);
    
    setMouthOpenness(normalized);
    drawRealisticAvatar(normalized);
    
    if (isPlaying) {
      animationFrameRef.current = requestAnimationFrame(analyzeAudio);
    }
  };

  useEffect(() => {
    drawRealisticAvatar(mouthOpenness);
  }, [mouthOpenness]);

  useEffect(() => {
    if (isPlaying) {
      analyzeAudio();
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      setMouthOpenness(0);
      drawRealisticAvatar(0);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying]);

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
