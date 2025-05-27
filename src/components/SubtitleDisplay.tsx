
import React from 'react';
import { Card } from '@/components/ui/card';

interface SubtitleDisplayProps {
  text: string;
  isActive: boolean;
  title: string;
}

const SubtitleDisplay: React.FC<SubtitleDisplayProps> = ({ text, isActive, title }) => {
  return (
    <Card className="bg-black/80 border-gray-700 backdrop-blur-sm">
      <div className="p-3">
        <div className="flex items-center gap-2 mb-1">
          <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-red-500 animate-pulse' : 'bg-gray-500'}`} />
          <span className="text-xs text-gray-400 font-medium">{title}</span>
        </div>
        <p className="text-white text-sm min-h-[40px] leading-relaxed">
          {text || "..."}
        </p>
      </div>
    </Card>
  );
};

export default SubtitleDisplay;
