
import React from 'react';
import { motion } from 'framer-motion';

interface CustomLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

const CustomLoader = ({ size = 'md', text = 'Loading...' }: CustomLoaderProps) => {
  const sizes = {
    sm: {
      outer: 'w-10 h-10',
      inner: 'w-6 h-6'
    },
    md: {
      outer: 'w-16 h-16',
      inner: 'w-10 h-10'
    },
    lg: {
      outer: 'w-24 h-24',
      inner: 'w-16 h-16'
    }
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative">
        {/* Outer ring */}
        <motion.div 
          className={`${sizes[size].outer} rounded-full border-4 border-neon-purple/30 flex items-center justify-center`}
          animate={{ 
            boxShadow: ['0 0 5px rgba(155,135,245,0.3)', '0 0 20px rgba(155,135,245,0.8)', '0 0 5px rgba(155,135,245,0.3)'] 
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity,
            ease: "easeInOut" 
          }}
        >
          {/* Inner circle */}
          <motion.div 
            className={`${sizes[size].inner} rounded-full bg-gradient-to-r from-neon-purple to-neon-blue`}
            animate={{ 
              scale: [0.8, 1.1, 0.8],
              opacity: [0.7, 1, 0.7]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              ease: "easeInOut" 
            }}
          />
        </motion.div>
        
        {/* Brand text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white font-bold text-xs">AI</span>
        </div>
      </div>
      
      {text && (
        <motion.p 
          className="mt-4 text-neon-purple font-medium"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {text}
        </motion.p>
      )}
    </div>
  );
};

export default CustomLoader;
