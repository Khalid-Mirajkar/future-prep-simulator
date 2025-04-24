
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
      const particleCount = Math.min(Math.floor(window.innerWidth * 0.15), 250);
      const spaceColors = [
        '#9b87f5', // bright purple
        '#6A0DAD', // deep purple
        '#7B2CBF', // royal purple
        '#E5DEFF', // light purple
        '#FFD700', // gold (for stars)
        '#B8B8FF', // periwinkle
        '#4A0E4E',  // dark purple
        '#8A4FFF'   // vibrant purple
      ];
      
      for (let i = 0; i < particleCount; i++) {
        const type = Math.random() > 0.95 ? 'planet' : 
                     Math.random() > 0.7 ? 'star' : 'dust';
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: type === 'planet' ? Math.random() * 6 + 3 : 
                type === 'star' ? Math.random() * 3 + 1 :
                Math.random() * 1.5 + 0.5,
          speedX: (Math.random() - 0.5) * 0.3,
          speedY: (Math.random() - 0.5) * 0.3,
          opacity: type === 'planet' ? 0.9 : Math.random() * 0.7 + 0.3,
          color: spaceColors[Math.floor(Math.random() * spaceColors.length)],
          type,
        });
      }
    };
    
    const drawParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Enhanced cosmic gradient background
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, '#0D0D0D');
      gradient.addColorStop(0.3, '#1a1025');
      gradient.addColorStop(0.6, '#2D1B41');
      gradient.addColorStop(1, '#3D2459');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach((particle) => {
        // Update position with wrapping
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        
        if (particle.x > canvas.width) particle.x = 0;
        else if (particle.x < 0) particle.x = canvas.width;
        if (particle.y > canvas.height) particle.y = 0;
        else if (particle.y < 0) particle.y = canvas.height;
        
        // Draw particle based on type
        ctx.beginPath();
        const particleGradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.size * 3
        );
        
        const alpha = Math.floor(particle.opacity * 255).toString(16).padStart(2, '0');
        
        if (particle.type === 'star') {
          // Enhanced twinkling effect for stars
          particle.opacity = 0.4 + Math.sin(Date.now() * 0.005) * 0.3;
          particleGradient.addColorStop(0, `${particle.color}${alpha}`);
          particleGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
          
          ctx.fillStyle = particleGradient;
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        } else if (particle.type === 'planet') {
          // More distinct planet-like appearance
          particleGradient.addColorStop(0, `${particle.color}${alpha}`);
          particleGradient.addColorStop(0.5, `${particle.color}66`);
          particleGradient.addColorStop(1, 'rgba(155, 135, 245, 0)');
          
          ctx.fillStyle = particleGradient;
          ctx.arc(particle.x, particle.y, particle.size * 2.5, 0, Math.PI * 2);
        } else {
          // Cosmic dust with slight variation
          particleGradient.addColorStop(0, `${particle.color}${alpha}`);
          particleGradient.addColorStop(1, 'rgba(155, 135, 245, 0)');
          
          ctx.fillStyle = particleGradient;
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        }
        
        ctx.fill();
      });
      
      // Enhanced particle connections
      ctx.strokeStyle = 'rgba(155, 135, 245, 0.1)';
      ctx.lineWidth = 0.7;
      
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      
      animationFrameId = requestAnimationFrame(drawParticles);
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
      className="fixed top-0 left-0 w-full h-full -z-10"
    />
  );
};

export default ParticlesBackground;
