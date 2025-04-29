
import { useEffect, useState } from "react";
import { UserPlus, Search, MousePointer, ListChecks } from "lucide-react";
import ProcessStep from "./ProcessStep";

const ProcessSection = () => {
  const [visibleSteps, setVisibleSteps] = useState<number[]>([]);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const stepId = parseInt(entry.target.id.split('-')[1]);
            setVisibleSteps((prev) => [...prev, stepId]);
          }
        });
      },
      { threshold: 0.1 }
    );
    
    document.querySelectorAll(".process-step").forEach((el) => {
      observer.observe(el);
    });
    
    return () => observer.disconnect();
  }, []);
  
  const steps = [
    { number: 1, title: "Choose Your Role", description: "Select your target job role and industry for personalized questions", icon: <UserPlus />, delay: 0 },
    { number: 2, title: "Customize Focus Areas", description: "Pick skill areas or topics you want to practice", icon: <Search />, delay: 150 },
    { number: 3, title: "Practice With AI", description: "Complete realistic interview simulations with our AI interviewer", icon: <MousePointer />, delay: 300 },
    { number: 4, title: "Review & Improve", description: "Get detailed feedback and track your progress over time", icon: <ListChecks />, delay: 450 }
  ];

  return (
    <section className="py-20 relative overflow-hidden" id="how-it-works">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
            How It <span className="text-gradient">Works</span>
          </h2>
          <p className="text-xl text-gray-300">
            Our AI-powered interview simulator helps you prepare effectively in just four simple steps
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <ProcessStep
              key={index}
              delay={step.delay}
              number={step.number}
              title={step.title}
              description={step.description}
              icon={step.icon}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProcessSection;
