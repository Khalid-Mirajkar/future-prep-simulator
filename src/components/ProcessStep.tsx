
import { useEffect, useRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ProcessStepProps {
  number: number;
  title: string;
  description: string;
  icon: ReactNode;
  delay?: number;
}

const ProcessStep = ({ 
  number, 
  title, 
  description, 
  icon,
  delay = 0 
}: ProcessStepProps) => {
  const stepRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            stepRef.current?.classList.add('animate-slide-up');
            stepRef.current?.classList.remove('opacity-0');
          }, delay);
        }
      },
      { threshold: 0.3 }
    );
    
    if (stepRef.current) {
      observer.observe(stepRef.current);
    }
    
    return () => {
      if (stepRef.current) {
        observer.unobserve(stepRef.current);
      }
    };
  }, [delay]);
  
  return (
    <div 
      ref={stepRef}
      className="flex items-start gap-6 opacity-0 transform translate-y-10"
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="flex-shrink-0 relative">
        <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br from-neon-purple to-neon-blue text-white font-bold text-xl">
          {number}
          <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-neon-purple to-neon-blue opacity-30 blur-sm -z-10"></div>
        </div>
        {number < 3 && (
          <div className="w-0.5 h-16 bg-gradient-to-b from-neon-purple to-transparent mx-auto my-1"></div>
        )}
      </div>
      
      <div className={cn(
        "glass-card rounded-xl p-6 flex-1 transform transition-all duration-500",
        "hover:shadow-[0_0_15px_rgba(155,135,245,0.3)]"
      )}>
        <div className="flex items-center mb-4">
          <div className="mr-4 text-neon-purple">
            {icon}
          </div>
          <h3 className="text-xl font-bold text-white">{title}</h3>
        </div>
        <p className="text-gray-300">{description}</p>
      </div>
    </div>
  );
};

export default ProcessStep;
