
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

const phrases = [
  { text: "Fail Less.", color: "text-white" },
  { text: "Impress More.", color: "text-white" },
  { text: "Get Hired.", color: "text-gradient" }
];

const AnimatedHeadingSequence = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const isMobile = useIsMobile();
  
  useEffect(() => {
    // Control the animation sequence
    const sequenceTimer = setInterval(() => {
      if (currentIndex < phrases.length - 1) {
        setIsVisible(false);
        
        // Wait for exit animation to complete
        setTimeout(() => {
          setCurrentIndex(prevIndex => prevIndex + 1);
          setIsVisible(true);
        }, 500); // Half of the transition duration
      } else {
        // Stop the animation when we reach the last phrase
        clearInterval(sequenceTimer);
      }
    }, 2000); // Display each phrase for 2 seconds
    
    return () => clearInterval(sequenceTimer);
  }, [currentIndex]);
  
  // Variants for the animation
  const variants = {
    enter: { 
      y: 20, 
      opacity: 0 
    },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { 
        duration: 0.5,
        ease: "easeOut" 
      }
    },
    exit: { 
      y: -20, 
      opacity: 0,
      transition: { 
        duration: 0.5,
        ease: "easeIn" 
      }
    }
  };

  // Special variants for the final "Get Hired" phrase
  const finalPhraseVariants = {
    ...variants,
    visible: {
      ...variants.visible,
      scale: currentIndex === 2 ? [1, 1.05, 1] : 1,
      transition: {
        duration: 0.8,
        ease: "easeOut",
        scale: {
          duration: 0.8,
          repeat: 0,
          repeatType: "mirror" as const,
          ease: "easeInOut"
        }
      }
    }
  };
  
  return (
    <div className="relative h-16 md:h-20 flex items-center justify-center">
      <AnimatePresence mode="wait">
        {isVisible && (
          <motion.p
            key={currentIndex}
            className={`font-bold text-2xl md:text-3xl lg:text-4xl absolute ${phrases[currentIndex].color} 
                       ${currentIndex === 2 ? "shadow-glow" : ""}`}
            initial="enter"
            animate="visible"
            exit="exit"
            variants={currentIndex === 2 ? finalPhraseVariants : variants}
          >
            {phrases[currentIndex].text}
            
            {/* Add a special effect for the "Get Hired" phrase */}
            {currentIndex === 2 && (
              <motion.span
                className="absolute inset-0 bg-gradient-to-r from-neon-purple via-neon-pink to-neon-blue opacity-10 rounded-lg blur-sm -z-10"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ 
                  opacity: [0.1, 0.3, 0.1], 
                  scale: [0.9, 1.1, 0.9],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "mirror"
                }}
              />
            )}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AnimatedHeadingSequence;
