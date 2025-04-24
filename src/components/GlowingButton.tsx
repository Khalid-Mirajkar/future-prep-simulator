
import { ButtonHTMLAttributes, ReactNode } from 'react';

interface GlowingButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

const GlowingButton = ({ 
  children, 
  className = '', 
  variant = 'primary', 
  size = 'md',
  ...props 
}: GlowingButtonProps) => {
  
  const baseStyles = "relative font-medium rounded-md transition-all duration-300 focus:outline-none";
  
  const variants = {
    primary: "bg-gradient-to-r from-neon-purple to-neon-blue text-white hover:shadow-[0_0_20px_rgba(155,135,245,0.7)] animate-pulse-glow",
    secondary: "bg-dark-lighter text-white border border-neon-purple/30 hover:border-neon-purple/80 hover:shadow-[0_0_15px_rgba(155,135,245,0.5)]",
    outline: "bg-transparent text-white border border-neon-purple/50 hover:bg-neon-purple/10 hover:shadow-[0_0_10px_rgba(155,135,245,0.4)]"
  };
  
  const sizes = {
    sm: "text-sm px-4 py-2",
    md: "text-base px-6 py-3",
    lg: "text-lg px-8 py-4"
  };
  
  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
      {variant === 'primary' && (
        <span className="absolute inset-0 -z-10 bg-gradient-to-r from-neon-purple to-neon-blue rounded-md blur opacity-60"></span>
      )}
    </button>
  );
};

export default GlowingButton;
