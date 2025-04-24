import { useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  color: string;
  type: 'star' | 'planet' | 'dust';
};

const ParticlesBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    let animationFrameId: number;
    let particles: Particle[] = [];
    
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };
    
    const initParticles = () => {
      particles = [];
      const particleCount = Math.min(Math.floor(window.innerWidth * 0.2), 300);
      const spaceColors = [
        '#9b87f5',
        '#6A0DAD',
        '#7B2CBF',
        '#E5DEFF',
        '#FFD700',
        '#B8B8FF',
        '#4A0E4E',
        '#8A4FFF',
        '#D6BCFA'
      ];
      
      for (let i = 0; i < particleCount; i++) {
        const type = Math.random() > 0.92 ? 'planet' : 
                     Math.random() > 0.6 ? 'star' : 'dust';
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: type === 'planet' ? Math.random() * 8 + 4 : 
                type === 'star' ? Math.random() * 3 + 1.5 :
                Math.random() * 1.5 + 0.5,
          speedX: (Math.random() - 0.5) * 0.3,
          speedY: (Math.random() - 0.5) * 0.3,
          opacity: type === 'planet' ? 0.9 : Math.random() * 0.8 + 0.4,
          color: spaceColors[Math.floor(Math.random() * spaceColors.length)],
          type,
        });
      }
    };
    
    const drawParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, '#0D0D0D');
      gradient.addColorStop(0.25, '#1a1025');
      gradient.addColorStop(0.5, '#2D1B41');
      gradient.addColorStop(0.75, '#3D2459');
      gradient.addColorStop(1, '#4A0E4E');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach((particle) => {
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        
        if (particle.x > canvas.width) particle.x = 0;
        else if (particle.x < 0) particle.x = canvas.width;
        if (particle.y > canvas.height) particle.y = 0;
        else if (particle.y < 0) particle.y = canvas.height;
        
        const particleGradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.size * 3
        );
        
        if (particle.type === 'star') {
          particle.opacity = 0.5 + Math.sin(Date.now() * 0.003 + particle.x) * 0.4;
          
          const color = hexToRgba(particle.color, particle.opacity);
          particleGradient.addColorStop(0, color);
          particleGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
          
          ctx.fillStyle = particleGradient;
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        } else if (particle.type === 'planet') {
          const color = hexToRgba(particle.color, particle.opacity);
          const midColor = hexToRgba(particle.color, 0.4);
          
          particleGradient.addColorStop(0, color);
          particleGradient.addColorStop(0.5, midColor);
          particleGradient.addColorStop(1, 'rgba(155, 135, 245, 0)');
          
          ctx.fillStyle = particleGradient;
          ctx.arc(particle.x, particle.y, particle.size * 2.5, 0, Math.PI * 2);
        } else {
          const color = hexToRgba(particle.color, particle.opacity);
          
          particleGradient.addColorStop(0, color);
          particleGradient.addColorStop(1, 'rgba(155, 135, 245, 0)');
          
          ctx.fillStyle = particleGradient;
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        }
        
        ctx.fill();
      });
      
      ctx.strokeStyle = 'rgba(155, 135, 245, 0.08)';
      ctx.lineWidth = 0.5;
      
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 100) {
            const opacity = (1 - distance / 100) * 0.2;
            ctx.strokeStyle = `rgba(155, 135, 245, ${opacity})`;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      
      animationFrameId = requestAnimationFrame(drawParticles);
    };
    
    const hexToRgba = (hex: string, opacity: number): string => {
      hex = hex.replace('#', '');
      
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    };
    
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    drawParticles();
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);
  
  return (
    <canvas 
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full z-[-1]"
      style={{ 
        position: 'absolute',
        pointerEvents: 'none'
      }}
    />
  );
};

export default ParticlesBackground;
