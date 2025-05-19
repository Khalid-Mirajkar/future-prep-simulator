
import React from 'react';
import { Progress } from "@/components/ui/progress";
import { Clock } from "lucide-react";

interface TimerProgressBarProps {
  initialSeconds: number;
  remainingSeconds: number;
}

const TimerProgressBar: React.FC<TimerProgressBarProps> = ({
  initialSeconds,
  remainingSeconds
}) => {
  // Calculate percentage of time remaining
  const percentage = Math.max(0, Math.min(100, (remainingSeconds / initialSeconds) * 100));
  
  // Determine color based on time remaining
  let progressColor = "bg-blue-500";
  let textColor = "text-blue-500";
  
  if (remainingSeconds <= 30) {
    progressColor = "bg-red-500";
    textColor = "text-red-500";
  } else if (remainingSeconds <= 120) {
    progressColor = "bg-orange-500";
    textColor = "text-orange-500";
  }
  
  // Format time as mm:ss
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <div className={`flex items-center ${textColor} font-medium`}>
          <Clock className="h-4 w-4 mr-1" />
          <span>{formattedTime}</span>
        </div>
        <div className={`text-sm ${remainingSeconds <= 120 ? "animate-pulse" : ""}`}>
          {remainingSeconds <= 30 ? (
            <span className="text-red-500 font-bold">Time almost up!</span>
          ) : remainingSeconds <= 120 ? (
            <span className="text-orange-500 font-bold">Less than 2 minutes left</span>
          ) : (
            <span className="text-gray-400">Time remaining</span>
          )}
        </div>
      </div>
      <Progress 
        value={percentage} 
        className={`h-2 ${remainingSeconds <= 30 ? "bg-gray-800" : "bg-gray-800"}`}
        indicatorClassName={progressColor}
      />
    </div>
  );
};

export default TimerProgressBar;
