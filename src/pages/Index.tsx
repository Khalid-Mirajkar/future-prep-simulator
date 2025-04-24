
import { useEffect, useRef, useState } from "react";
import { ChevronRight, Target, BrainCircuit, BarChart3, Sparkles } from "lucide-react";
import ParticlesBackground from "@/components/ParticlesBackground";
import GlowingButton from "@/components/GlowingButton";
import AnimatedBrain from "@/components/AnimatedBrain";
import FeatureFlipCard from "@/components/FeatureFlipCard";
import TestimonialCarousel from "@/components/TestimonialCarousel";
import ProcessStep from "@/components/ProcessStep";

const Index = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <ParticlesBackground />
      
      {/* Fixed header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'backdrop-blur-md bg-dark-deeper/70 shadow-md' : 'bg-transparent'
      }`}>
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-xl font-orbitron font-bold text-gradient">AI INTERVIEW</div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-gray-300 hover:text-white transition-colors">Features</a>
            <a href="#process" className="text-sm text-gray-300 hover:text-white transition-colors">How It Works</a>
            <a href="#testimonials" className="text-sm text-gray-300 hover:text-white transition-colors">Testimonials</a>
          </nav>
          <GlowingButton size="sm" variant="outline">Get Started</GlowingButton>
        </div>
      </header>
      
      {/* Hero Section */}
      <section className="min-h-screen pt-24 pb-12 flex flex-col justify-center relative overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-5xl md:text-7xl font-orbitron font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-neon-purple to-neon-blue text-shadow-glow animate-text-reveal">
                AI INTERVIEW SIMULATOR
              </h1>
              <p className="text-xl md:text-2xl mb-6 text-gray-300 animate-text-reveal" style={{ animationDelay: '0.3s' }}>
                Step Into the Future of Interview Prep.<br />
                <span className="text-gradient font-semibold">Personalized. Realistic. Unstoppable.</span>
              </p>
              <p className="text-base md:text-lg mb-8 text-gray-400 max-w-2xl mx-auto lg:mx-0 animate-text-reveal" style={{ animationDelay: '0.5s' }}>
                You're not just practicing. You're training with AI that knows your next job better than you do.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-text-reveal" style={{ animationDelay: '0.7s' }}>
                <GlowingButton size="lg">
                  Try The Simulator Now <ChevronRight className="w-5 h-5" />
                </GlowingButton>
                <GlowingButton variant="secondary" size="lg">
                  See it in action
                </GlowingButton>
              </div>
            </div>
            <div className="hidden lg:block">
              <AnimatedBrain />
            </div>
          </div>
        </div>
        
        {/* Floating elements decoration */}
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-neon-purple/10 rounded-full blur-3xl"></div>
        <div className="absolute top-20 -right-20 w-72 h-72 bg-neon-blue/10 rounded-full blur-3xl"></div>
      </section>
      
      {/* Problem/Impact Section */}
      <section id="features" className="py-20 relative">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-neon-purple to-neon-blue">
              Generic Prep Is Dead
            </h2>
            <p className="text-xl text-gray-300">
              Your dream job deserves more than Googled questions
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureFlipCard
              problem={{ 
                icon: "❌", 
                text: "Outdated questions that don't reflect real interviews" 
              }}
              solution={{ 
                icon: "✅", 
                text: "AI-curated questions for your target role & company" 
              }}
              delay={0}
            />
            <FeatureFlipCard
              problem={{ 
                icon: "❌", 
                text: "Zero personalization to your experience level" 
              }}
              solution={{ 
                icon: "✅", 
                text: "Real-time scoring and strategy feedback" 
              }}
              delay={200}
            />
            <FeatureFlipCard
              problem={{ 
                icon: "❌", 
                text: "No real feedback on your responses" 
              }}
              solution={{ 
                icon: "✅", 
                text: "Backed by real job data — not guesswork" 
              }}
              delay={400}
            />
          </div>
        </div>
        
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-b from-dark-deeper to-dark opacity-60 -z-10"></div>
      </section>
      
      {/* How It Works Section */}
      <section id="process" className="py-20 relative">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              How It <span className="text-gradient">Works</span>
            </h2>
            <p className="text-xl text-gray-300">
              Our interview simulator is designed to be intuitive, effective, and tailored to your needs
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto flex flex-col gap-10">
            <ProcessStep
              number={1}
              title="Input your dream job and target company"
              description="Tell us exactly what role you're aiming for and where. Our AI will tailor everything to these specifics."
              icon={<Target className="w-6 h-6" />}
              delay={0}
            />
            <ProcessStep
              number={2}
              title="Answer AI-generated, company-specific MCQs"
              description="Face questions that are pulled from real interview data and customized for your target position."
              icon={<BrainCircuit className="w-6 h-6" />}
              delay={300}
            />
            <ProcessStep
              number={3}
              title="Get scored, see feedback, and retry with improvements"
              description="Receive detailed performance analytics and actionable advice to improve with each practice session."
              icon={<BarChart3 className="w-6 h-6" />}
              delay={600}
            />
          </div>
        </div>
      </section>
      
      {/* Why Use This Section */}
      <section className="py-20 relative bg-dark-lighter">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-4xl mx-auto">
            <h3 className="text-2xl font-medium mb-8 text-gray-300">
              <span className="text-gradient">Why Use This?</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              <div className="glass-card p-8 rounded-xl hover:shadow-[0_0_15px_rgba(155,135,245,0.3)] transition-all">
                <h4 className="text-xl font-bold mb-4 text-white">Built for the ambitious</h4>
                <p className="text-gray-300">Designed for those who won't settle for anything but the best opportunities.</p>
              </div>
              <div className="glass-card p-8 rounded-xl hover:shadow-[0_0_15px_rgba(155,135,245,0.3)] transition-all">
                <h4 className="text-xl font-bold mb-4 text-white">Trained on real-world data</h4>
                <p className="text-gray-300">Using actual interview questions and feedback from successful candidates.</p>
              </div>
              <div className="glass-card p-8 rounded-xl hover:shadow-[0_0_15px_rgba(155,135,245,0.3)] transition-all">
                <h4 className="text-xl font-bold mb-4 text-white">Fine-tuned to impress recruiters</h4>
                <p className="text-gray-300">Learn what hiring managers are actually looking for in top candidates.</p>
              </div>
            </div>
            
            <blockquote className="text-2xl md:text-3xl font-medium italic text-center mb-8 text-white">
              "This is the tool I wish I had when I was starting out."
              <footer className="text-lg mt-4 text-gray-400">— Every successful founder ever</footer>
            </blockquote>
          </div>
        </div>
        
        {/* Background decoration */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
          <div className="absolute -top-10 -right-10 w-64 h-64 bg-neon-purple/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-neon-blue/10 rounded-full blur-3xl"></div>
        </div>
      </section>
      
      {/* Testimonials Section */}
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
      <section className="py-20 relative">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-8 text-white flex flex-col items-center justify-center">
            <Sparkles className="w-10 h-10 mb-4 text-neon-purple" />
            Get One Step Closer to Your Dream Offer
          </h2>
          
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            Don't leave your career success to chance. Start practicing with our AI Interview Simulator today and dramatically increase your chances of landing that perfect job.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <GlowingButton size="lg">
              Start Free Interview Practice <ChevronRight className="w-5 h-5" />
            </GlowingButton>
            <GlowingButton variant="outline" size="lg">
              See how it works
            </GlowingButton>
          </div>
        </div>
        
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-t from-dark-deeper to-dark opacity-60 -z-10"></div>
      </section>
      
      {/* Footer */}
      <footer className="py-12 relative">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <div className="text-xl font-orbitron font-bold text-gradient">AI INTERVIEW</div>
              <p className="text-gray-400 text-sm mt-2">Elevate your interview preparation to the next level</p>
            </div>
            
            <div className="flex gap-8">
              <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">About</a>
              <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Contact</a>
              <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Privacy</a>
              <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Terms</a>
            </div>
          </div>
          
          <div className="border-t border-white/10 mt-8 pt-8 text-center">
            <p className="text-gray-500 text-sm">© 2025 AI Interview Simulator. All rights reserved.</p>
          </div>
        </div>
        
        {/* Circuit background decoration */}
        <div className="absolute inset-0 pointer-events-none -z-10 opacity-20">
          <svg width="100%" height="100%" className="absolute inset-0">
            <defs>
              <pattern id="circuit-pattern" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
                <path d="M0 40 L40 40 L40 0" fill="none" stroke="rgba(155, 135, 245, 0.3)" strokeWidth="1"></path>
                <path d="M80 40 L40 40 L40 80" fill="none" stroke="rgba(155, 135, 245, 0.3)" strokeWidth="1"></path>
                <circle cx="40" cy="40" r="3" fill="rgba(155, 135, 245, 0.5)"></circle>
              </pattern>
            </defs>
            <rect x="0" y="0" width="100%" height="100%" fill="url(#circuit-pattern)"></rect>
          </svg>
        </div>
      </footer>
    </div>
  );
};

export default Index;
