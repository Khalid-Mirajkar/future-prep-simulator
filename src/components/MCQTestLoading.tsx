
import React from 'react';
import { Loader2 } from "lucide-react";

const MCQTestLoading: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white py-20 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-purple-500" />
        <div className="text-center">
          <p className="text-xl font-medium">Generating questions...</p>
          <p className="text-sm text-gray-400 mt-2">This may take a few moments</p>
        </div>
      </div>
    </div>
  );
};

export default MCQTestLoading;
