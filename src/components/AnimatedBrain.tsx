
import { useEffect, useState } from 'react';

const AnimatedBrain = () => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`relative w-full max-w-md mx-auto transition-all duration-1000 ease-out transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-neon-purple to-neon-blue rounded-full blur-xl opacity-20 animate-pulse"></div>
        <svg
          className="w-full h-auto animate-float"
          viewBox="0 0 512 512"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M208 352L256 256L304 352"
            stroke="#9b87f5"
            strokeWidth="10"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="animate-pulse"
          />
          <circle
            cx="256"
            cy="256"
            r="160"
            stroke="url(#brain-gradient)"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray="30 30"
            className="animate-spin-slow"
            style={{ animationDuration: '30s' }}
          />
          <path
            d="M256 96C256 96 304 144 304 256C304 368 256 416 256 416"
            stroke="#9b87f5"
            strokeWidth="10"
            strokeLinecap="round"
            className="animate-pulse"
            style={{ animationDelay: '0.5s' }}
          />
          <path
            d="M256 96C256 96 208 144 208 256C208 368 256 416 256 416"
            stroke="#9b87f5"
            strokeWidth="10"
            strokeLinecap="round"
            className="animate-pulse"
            style={{ animationDelay: '0.7s' }}
          />
          <path
            d="M256 176V144"
            stroke="#D946EF"
            strokeWidth="10"
            strokeLinecap="round"
            className="animate-pulse"
            style={{ animationDelay: '1s' }}
          />
          <path
            d="M256 368V336"
            stroke="#D946EF"
            strokeWidth="10"
            strokeLinecap="round"
            className="animate-pulse"
            style={{ animationDelay: '1.2s' }}
          />
          <circle
            cx="256"
            cy="192"
            r="16"
            fill="#D946EF"
            className="animate-pulse"
            style={{ animationDelay: '1.5s' }}
          />
          <circle
            cx="256"
            cy="320"
            r="16"
            fill="#D946EF"
            className="animate-pulse"
            style={{ animationDelay: '1.7s' }}
          />
          <defs>
            <linearGradient id="brain-gradient" x1="96" y1="96" x2="416" y2="416" gradientUnits="userSpaceOnUse">
              <stop stopColor="#9b87f5" />
              <stop offset="1" stopColor="#1EAEDB" />
            </linearGradient>
          </defs>
        </svg>
        
        {/* Neural connections */}
        <div className="absolute inset-0 flex items-center justify-center">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-neon-purple animate-pulse"
              style={{
                top: `${20 + Math.random() * 60}%`,
                left: `${20 + Math.random() * 60}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 3}s`,
                opacity: 0.7,
                boxShadow: '0 0 8px 2px rgba(155, 135, 245, 0.6)'
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnimatedBrain;
