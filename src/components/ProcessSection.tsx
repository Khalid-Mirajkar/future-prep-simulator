
import { Target, Settings, TrendingUp } from "lucide-react";
import ProcessStep from "./ProcessStep";

const ProcessSection = () => {
  const steps = [
    {
      number: 1,
      title: "Enter your role & company",
      description: "We fetch live job data and create real questions.",
      icon: <Target className="w-6 h-6" />,
    },
    {
      number: 2,
      title: "Answer & learn",
      description: "Practice with smart feedback and tailored tips.",
      icon: <Settings className="w-6 h-6" />,
    },
    {
      number: 3,
      title: "Track progress & grow",
      description: "Level up your performance and land the offer.",
      icon: <TrendingUp className="w-6 h-6" />,
    },
  ];

  return (
    <section className="py-20 relative">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl font-bold mb-12 text-center text-white">
          How It <span className="text-gradient">Works</span>
        </h2>
        <div className="max-w-4xl mx-auto space-y-8">
          {steps.map((step, index) => (
            <ProcessStep
              key={step.number}
              {...step}
              delay={index * 200}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProcessSection;
