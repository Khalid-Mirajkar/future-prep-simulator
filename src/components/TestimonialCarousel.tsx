import { useState, useEffect } from "react";
import TestimonialCard from "./TestimonialCard";

interface Testimonial {
  id: number;
  quote: string;
  author: string;
  role: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    quote: "I cracked my Microsoft internship after using this for just 3 days. The AI pinpointed exactly what I needed to focus on.",
    author: "Alex Chen",
    role: "Software Engineer Intern, Microsoft"
  },
  {
    id: 2,
    quote: "The detailed feedback on my interview responses helped me identify areas I needed to improve. Got into Google after 2 weeks of practice!",
    author: "Sarah Johnson",
    role: "Product Manager, Google"
  },
  {
    id: 3,
    quote: "This platform transformed my interview preparation. The AI's ability to simulate different interview styles is incredible.",
    author: "Marcus Rodriguez",
    role: "Senior Developer, Amazon"
  },
  {
    id: 4,
    quote: "Finally found a tool that actually helps improve interview skills instead of just testing knowledge. Worth every minute!",
    author: "Emma Thompson",
    role: "Frontend Engineer, Spotify"
  },
  {
    id: 5,
    quote: "The personalized feedback on my communication style was eye-opening. Helped me land my dream job at Apple!",
    author: "David Kim",
    role: "iOS Developer, Apple"
  },
  {
    id: 6,
    quote: "As someone switching careers to tech, this platform was invaluable. It helped me understand what companies look for.",
    author: "Lisa Chen",
    role: "Software Engineer, Netflix"
  },
  {
    id: 7,
    quote: "The AI interviewer adapted to my skill level and gradually increased difficulty. Perfect practice environment!",
    author: "James Wilson",
    role: "Full Stack Developer, Meta"
  },
  {
    id: 8,
    quote: "Used this to prepare for my senior role interviews. The technical feedback was spot-on!",
    author: "Priya Sharma",
    role: "Engineering Manager, LinkedIn"
  },
  {
    id: 9,
    quote: "Great tool for continuous improvement. I use it regularly to stay sharp with my interview skills.",
    author: "Michael Brown",
    role: "Backend Engineer, Stripe"
  },
  {
    id: 10,
    quote: "The variety of questions and scenarios helped me feel prepared for anything in my interviews.",
    author: "Sophie Anderson",
    role: "Data Scientist, Tesla"
  },
  {
    id: 11,
    quote: "Fantastic for practicing system design interviews. The AI's suggestions really improved my approach.",
    author: "Raj Patel",
    role: "Systems Architect, Oracle"
  },
  {
    id: 12,
    quote: "As a bootcamp graduate, this tool bridged the gap between my learning and interview readiness.",
    author: "Hannah Mitchell",
    role: "Junior Developer, Shopify"
  },
  {
    id: 13,
    quote: "The instant feedback helped me correct my interview mistakes in real-time. Game changer!",
    author: "Tom Garcia",
    role: "Cloud Engineer, Microsoft"
  },
  {
    id: 14,
    quote: "Prepared me for both technical and behavioral questions. Now working at my dream company!",
    author: "Nina Patel",
    role: "Product Engineer, Airbnb"
  },
  {
    id: 15,
    quote: "The mock interviews felt so real, I was actually prepared when the real interviews came.",
    author: "Chris Morgan",
    role: "Security Engineer, Cloudflare"
  },
  {
    id: 16,
    quote: "Amazing tool for remote interview preparation. Helped me ace my virtual interviews!",
    author: "Lucy Zhang",
    role: "Frontend Developer, GitLab"
  },
  {
    id: 17,
    quote: "The platform's feedback helped me articulate my experiences much better in interviews.",
    author: "Daniel Lee",
    role: "DevOps Engineer, Docker"
  },
  {
    id: 18,
    quote: "Perfect for practicing different types of technical interviews. Now at Twitter!",
    author: "Rachel Cohen",
    role: "Software Engineer, Twitter"
  },
  {
    id: 19,
    quote: "The AI interviewer's questions were surprisingly similar to my actual interviews.",
    author: "Kevin O'Brien",
    role: "Backend Developer, Twitch"
  },
  {
    id: 20,
    quote: "Great for building confidence before big interviews. The progress tracking is motivating!",
    author: "Maya Gupta",
    role: "ML Engineer, OpenAI"
  },
  {
    id: 21,
    quote: "Helped me transition from a junior to senior role. The advanced questions were challenging!",
    author: "Jack Williams",
    role: "Senior Engineer, Square"
  },
  {
    id: 22,
    quote: "The behavioral interview practice was excellent. Really improved my storytelling.",
    author: "Sophia Lee",
    role: "Project Manager, Adobe"
  },
  {
    id: 23,
    quote: "Used this to prepare for FAANG interviews. Now working at my dream company!",
    author: "Ahmed Hassan",
    role: "Software Engineer, Meta"
  },
  {
    id: 24,
    quote: "The system design interview practice was particularly helpful for senior roles.",
    author: "Victoria Chen",
    role: "Principal Engineer, Salesforce"
  },
  {
    id: 25,
    quote: "This platform helped me understand where I was going wrong in previous interviews.",
    author: "Ryan Cooper",
    role: "Full Stack Developer, Dropbox"
  }
];

const TestimonialCarousel = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % testimonials.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="w-full max-w-6xl mx-auto px-4">
      <div className="relative overflow-hidden">
        <div 
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="min-w-full p-4">
              <TestimonialCard
                quote={testimonial.quote}
                author={testimonial.author}
                role={testimonial.role}
              />
            </div>
          ))}
        </div>
        
        {/* Indicators */}
        <div className="flex justify-center mt-8 space-x-2">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === activeIndex 
                  ? "bg-neon-purple shadow-[0_0_5px_rgba(155,135,245,0.8)]"
                  : "bg-gray-600"
              }`}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TestimonialCarousel;
