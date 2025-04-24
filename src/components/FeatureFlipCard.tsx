
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface FeatureFlipCardProps {
  problem: {
    icon: string;
    text: string;
  };
  solution: {
    icon: string;
    text: string;
  };
  delay?: number;
}

const FeatureFlipCard = ({ 
  problem, 
  solution,
  delay = 0 
}: FeatureFlipCardProps) => {
  const [showSolution, setShowSolution] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        setShowSolution(prev => !prev);
      }, 4000);
      
      return () => clearInterval(interval);
    }, delay);
    
    return () => clearTimeout(timer);
  }, [delay]);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            cardRef.current?.classList.add('animate-slide-up');
            cardRef.current?.classList.remove('opacity-0');
          }, delay);
        }
      },
      { threshold: 0.1 }
    );
    
    if (cardRef.current) {
      observer.observe(cardRef.current);
    }
    
    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, [delay]);
  
  return (
    <div 
      ref={cardRef}
      className="relative h-64 opacity-0 transform translate-y-10"
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="absolute inset-0 perspective-1000">
        <div
          className={cn(
            "relative w-full h-full transition-all duration-500 flip-card",
            showSolution ? "rotate-x-180" : ""
          )}
        >
          {/* Problem Card (Front) */}
          <div 
            className={cn(
              "absolute inset-0 backface-hidden glass-card rounded-xl p-6 flex flex-col items-center justify-center",
              showSolution ? "opacity-0" : "opacity-100"
            )}
          >
            <div className="text-3xl text-red-500 mb-3">{problem.icon}</div>
            <p className="text-lg text-center text-white">{problem.text}</p>
          </div>
          
          {/* Solution Card (Back) */}
          <div 
            className={cn(
              "absolute inset-0 backface-hidden glass-card rounded-xl p-6 flex flex-col items-center justify-center rotate-x-180 border-neon-purple/30 border",
              showSolution ? "opacity-100" : "opacity-0"
            )}
          >
            <div className="text-3xl text-green-500 mb-3">{solution.icon}</div>
            <p className="text-lg text-center text-white">{solution.text}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeatureFlipCard;
