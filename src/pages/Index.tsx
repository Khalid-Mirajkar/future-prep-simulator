
import { useEffect, useState } from "react";
import { Target, Settings, TrendingUp, Briefcase } from "lucide-react";
import ParticlesBackground from "@/components/ParticlesBackground";
import FeatureCard from "@/components/FeatureCard";
import TestimonialCarousel from "@/components/TestimonialCarousel";
import ProcessSection from "@/components/ProcessSection";

const Index = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: Target,
      title: "Role-Specific Questions",
      description: "We scan live job listings and company insights to tailor every question."
    },
    {
      icon: Settings,
      title: "Smart Feedback",
      description: "Get instant scoring and improvement tips after each answer."
    },
    {
      icon: TrendingUp,
      title: "Progress Tracking",
      description: "See how you improve over time across roles and industries."
    },
    {
      icon: Briefcase,
      title: "Realistic Simulations",
      description: "Practice in real-world scenarios built for your dream job."
    }
  ];

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#0D0D0D]">
      <ParticlesBackground />
      
      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'backdrop-blur-md bg-black/70 shadow-md' : 'bg-transparent'
      }`}>
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="text-xl font-bold text-white">AI INTERVIEW</div>
            <nav>
              <ul className="flex space-x-6">
                {['About', 'Contact', 'Privacy', 'Terms'].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-gray-400 text-sm hover:text-white transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </header>
      
      {/* Hero Section */}
      <section className="min-h-screen pt-24 pb-12 flex flex-col justify-center relative">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-text-reveal text-gradient">
            AI INTERVIEW SIMULATOR
          </h1>
          <p className="text-xl md:text-2xl mb-4 text-gray-300 max-w-3xl mx-auto">
            The future of interview prep is here. Tailored. Realistic. Powerful.
          </p>
          <button className="bg-deep-purple hover:bg-deep-violet transition-colors duration-300 text-white font-medium px-8 py-3 rounded-full mb-4">
            Start Free Practice
          </button>
          <p className="text-gray-400 text-sm">Already helping 1,200+ students ace their dream interviews</p>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
              Advanced Interview Preparation
            </h2>
            <p className="text-xl text-gray-400">
              Practice with AI that understands your industry, role, and career goals
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </div>
        </div>
      </section>
      
      {/* Process Section */}
      <ProcessSection />
      
      {/* Testimonials */}
      <section id="testimonials" className="py-20 relative">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-4xl font-bold mb-6 text-white">
              What People Are <span className="text-gradient">Saying</span>
            </h2>
            <p className="text-xl text-gray-300">
              Don't just take our word for it. Here's what our users have achieved with the AI Interview Simulator.
            </p>
          </div>
          <TestimonialCarousel />
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 relative glass-card my-20 mx-6 rounded-2xl">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-8 text-white">
            Get Started Today
          </h2>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            Join thousands of successful candidates who improved their interview performance with AI.
          </p>
          <button className="bg-deep-purple hover:bg-deep-violet transition-colors duration-300 text-white font-medium px-8 py-3 rounded-full">
            Start Free Practice
          </button>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-12 relative border-t border-white/10">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <div className="text-xl font-bold text-white">AI INTERVIEW</div>
              <p className="text-gray-400 text-sm mt-2">Elevate your interview skills</p>
            </div>
            <div className="flex gap-8">
              <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">About</a>
              <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Contact</a>
              <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Privacy</a>
              <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
