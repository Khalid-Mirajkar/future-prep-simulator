
import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
}

const FeatureCard = ({ title, description, icon: Icon }: FeatureCardProps) => {
  return (
    <motion.div 
      className="glass-card p-6 rounded-2xl transition-all duration-300"
      whileHover={{ 
        y: -5,
        boxShadow: "0 10px 25px rgba(155, 135, 245, 0.2)"
      }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
    >
      <motion.div 
        className="mb-4 text-deep-purple"
        initial={{ scale: 1 }}
        whileHover={{ 
          scale: 1.2,
          rotate: [0, -10, 10, -5, 0],
          transition: { duration: 0.5 }
        }}
      >
        <Icon className="w-8 h-8" />
      </motion.div>
      <h3 className="text-xl font-semibold mb-2 text-white">{title}</h3>
      <p className="text-gray-400 leading-relaxed">{description}</p>
    </motion.div>
  );
};

export default FeatureCard;
