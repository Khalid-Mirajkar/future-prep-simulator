
import { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
}

const FeatureCard = ({ title, description, icon: Icon }: FeatureCardProps) => {
  return (
    <div className="glass-card p-6 rounded-2xl transition-all duration-300 hover:shadow-lg hover:shadow-deep-purple/5">
      <div className="mb-4">
        <Icon className="w-8 h-8 text-deep-purple" />
      </div>
      <h3 className="text-xl font-semibold mb-2 text-white">{title}</h3>
      <p className="text-gray-400 leading-relaxed">{description}</p>
    </div>
  );
};

export default FeatureCard;
