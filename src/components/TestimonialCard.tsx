
import { ReactNode } from "react";

interface TestimonialCardProps {
  quote: string;
  author: string;
  role?: string;
  avatar?: string;
}

const TestimonialCard = ({ 
  quote, 
  author, 
  role, 
  avatar 
}: TestimonialCardProps) => {
  return (
    <div className="glass-card rounded-xl p-6 md:p-8 w-full max-w-md mx-auto h-full">
      <div className="flex flex-col h-full">
        <div className="mb-4">
          <svg 
            className="w-8 h-8 text-neon-purple opacity-70" 
            fill="currentColor" 
            viewBox="0 0 24 24"
          >
            <path d="M14.017 21v-7.391h-3.391V7h8.375v6.609H15.25L14.017 21zm-9.642 0v-7.391H1V7h8.375v6.609H5.608L4.375 21z"></path>
          </svg>
        </div>
        <p className="flex-grow text-base md:text-lg leading-relaxed mb-6 italic text-gray-300">
          "{quote}"
        </p>
        <div className="flex items-center">
          {avatar ? (
            <div className="w-10 h-10 rounded-full overflow-hidden mr-4 border border-neon-purple/30">
              <img src={avatar} alt={author} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-purple to-neon-blue mr-4 flex items-center justify-center">
              <span className="text-white font-medium">
                {author.charAt(0)}
              </span>
            </div>
          )}
          <div>
            <h4 className="font-medium text-white">{author}</h4>
            {role && <p className="text-sm text-gray-400">{role}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestimonialCard;
