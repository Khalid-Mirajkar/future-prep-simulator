
import React from 'react';

interface SubtitleDisplayProps {
  text: string;
  isActive: boolean;
  title: string;
  isOverlay?: boolean;
}

const SubtitleDisplay: React.FC<SubtitleDisplayProps> = ({ 
  text, 
  isActive, 
  title, 
  isOverlay = false 
}) => {
  if (isOverlay) {
    return (
      <div className="absolute bottom-4 left-4 right-4 z-10">
        {text && (
          <div className="bg-black/80 backdrop-blur-sm rounded-lg px-3 py-2 max-w-full">
            <p className="text-white text-sm leading-relaxed text-center">
              {text}
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-black/80 border-gray-700 backdrop-blur-sm rounded-lg">
      <div className="p-3">
        <div className="flex items-center gap-2 mb-1">
          <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-red-500 animate-pulse' : 'bg-gray-500'}`} />
          <span className="text-xs text-gray-400 font-medium">{title}</span>
        </div>
        <p className="text-white text-sm min-h-[40px] leading-relaxed">
          {text || "..."}
        </p>
      </div>
    </div>
  );
};

export default SubtitleDisplay;
