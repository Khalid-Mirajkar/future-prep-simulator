
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
    quote: "Felt like I was talking to a real recruiter. Unreal how accurately it mimicked my target company's interview style.",
    author: "Priya Sharma",
    role: "Product Manager, Google"
  },
  {
    id: 3,
    quote: "10/10. This changed how I prep completely. Got offers from 3 companies after struggling for months.",
    author: "James Wilson",
    role: "Data Scientist, Meta"
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
