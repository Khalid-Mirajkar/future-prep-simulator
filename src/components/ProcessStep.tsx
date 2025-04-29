
import { useEffect, useRef, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { motion, useTransform, MotionValue } from "framer-motion";

interface ProcessStepProps {
  number: number;
  title: string;
  description: string;
  icon: ReactNode;
  delay?: number;
  progress: MotionValue<number>;
  index: number;
}

const ProcessStep = ({ 
  number, 
  title, 
  description, 
  icon,
  delay = 0,
  progress,
  index
}: ProcessStepProps) => {
  const stepRef = useRef<HTMLDivElement>(null);
  
  // Create a staggered animation effect based on the index
  const entryPoint = 0.1 + (index * 0.1);
  const opacity = useTransform(
    progress, 
    [entryPoint - 0.1, entryPoint, entryPoint + 0.1], 
    [0, 1, 1]
  );
  
  const y = useTransform(
    progress, 
    [entryPoint - 0.1, entryPoint, entryPoint + 0.3], 
    [100, 0, 0]
  );
  
  const scale = useTransform(
    progress, 
    [entryPoint, entryPoint + 0.1, entryPoint + 0.3], 
    [0.8, 1, 1]
  );
  
  const rotation = useTransform(
    progress,
    [entryPoint - 0.1, entryPoint],
    [10, 0]
  );
  
  return (
    <motion.div 
      ref={stepRef}
      style={{
        opacity,
        y,
        scale,
        rotateZ: rotation
      }}
      className="flex items-start gap-4"
    >
      <div className="flex-shrink-0 relative">
        <motion.div 
          className="w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br from-neon-purple to-neon-blue text-white font-bold text-xl"
          whileHover={{ scale: 1.1 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          {number}
          <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-neon-purple to-neon-blue opacity-30 blur-sm -z-10"></div>
        </motion.div>
        {number < 4 && (
          <motion.div 
            className="w-0.5 h-16 bg-gradient-to-b from-neon-purple to-transparent mx-auto my-1"
            style={{
              scaleY: useTransform(
                progress,
                [entryPoint + 0.1, entryPoint + 0.2],
                [0, 1]
              ),
              transformOrigin: "top"
            }}
          />
        )}
      </div>
      
      <motion.div 
        className={cn(
          "glass-card rounded-xl p-6 w-full",
          "hover:shadow-[0_0_10px_rgba(155,135,245,0.3)]"
        )}
        whileHover={{ 
          scale: 1.03,
          boxShadow: "0 0 12px rgba(155,135,245,0.4)"
        }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        <div className="flex items-center mb-4">
          <motion.div 
            className="mr-4 text-neon-purple"
            whileHover={{ 
              rotate: [0, -10, 10, -5, 5, 0],
              transition: { duration: 0.5 }
            }}
          >
            {icon}
          </motion.div>
          <h3 className="text-xl font-bold text-white">{title}</h3>
        </div>
        <p className="text-gray-300">{description}</p>
      </motion.div>
    </motion.div>
  );
};

export default ProcessStep;
