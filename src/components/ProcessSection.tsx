
import { useEffect, useState, useRef } from "react";
import { UserPlus, Search, MousePointer, ListChecks } from "lucide-react";
import ProcessStep from "./ProcessStep";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";

const useParallax = (value: MotionValue<number>, distance: number) => {
  return useTransform(value, [0, 1], [-distance, distance]);
};

const ProcessSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });
  
  const steps = [
    { number: 1, title: "Choose Your Role", description: "Select your target job role and industry for personalized questions", icon: <UserPlus />, delay: 0 },
    { number: 2, title: "Customize Focus Areas", description: "Pick skill areas or topics you want to practice", icon: <Search />, delay: 150 },
    { number: 3, title: "Practice With AI", description: "Complete realistic interview simulations with our AI interviewer", icon: <MousePointer />, delay: 300 },
    { number: 4, title: "Review & Improve", description: "Get detailed feedback and track your progress over time", icon: <ListChecks />, delay: 450 }
  ];

  const sectionOpacity = useTransform(scrollYProgress, [0, 0.1, 0.9, 1], [0, 1, 1, 0]);
  const sectionY = useTransform(scrollYProgress, [0, 0.1, 0.9, 1], [100, 0, 0, -100]);
  const titleScale = useTransform(scrollYProgress, [0, 0.1, 0.25], [0.8, 1, 1.1]);

  return (
    <motion.section 
      ref={containerRef}
      className="py-24 lg:py-32 relative overflow-hidden min-h-[100vh] flex flex-col justify-center" 
      id="how-it-works"
      style={{
        opacity: sectionOpacity,
        y: sectionY
      }}
    >
      <div className="container mx-auto px-6 relative">
        <motion.div 
          className="text-center max-w-3xl mx-auto mb-16"
          style={{ scale: titleScale }}
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">
            How It <span className="text-gradient">Works</span>
          </h2>
          <p className="text-xl text-gray-300">
            Our AI-powered interview simulator helps you prepare effectively in just four simple steps
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-10">
          {steps.map((step, index) => (
            <ProcessStep
              key={index}
              delay={step.delay}
              number={step.number}
              title={step.title}
              description={step.description}
              icon={step.icon}
              progress={scrollYProgress}
              index={index}
            />
          ))}
        </div>
      </div>
    </motion.section>
  );
};

export default ProcessSection;
