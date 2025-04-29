
import React from 'react';
import CustomLoader from './CustomLoader';

const MCQTestLoading: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white py-20 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <CustomLoader size="lg" text="Generating questions..." />
      </div>
    </div>
  );
};

export default MCQTestLoading;
