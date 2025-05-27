
import React from 'react';
import { Button } from '@/components/ui/button';
import { Camera, CameraOff, Mic, MicOff, Phone } from 'lucide-react';

interface InterviewControlsProps {
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  onToggleVideo: () => void;
  onToggleAudio: () => void;
  onEndCall: () => void;
}

const InterviewControls: React.FC<InterviewControlsProps> = ({
  isVideoEnabled,
  isAudioEnabled,
  onToggleVideo,
  onToggleAudio,
  onEndCall
}) => {
  return (
    <div className="flex items-center justify-center gap-4 p-6 bg-gray-900/50 backdrop-blur-sm border-t border-gray-800">
      {/* Video Toggle */}
      <Button
        onClick={onToggleVideo}
        variant="ghost"
        size="icon"
        className={`rounded-full w-12 h-12 ${
          isVideoEnabled 
            ? 'bg-gray-700 hover:bg-gray-600 text-white' 
            : 'bg-red-600 hover:bg-red-700 text-white'
        }`}
      >
        {isVideoEnabled ? <Camera className="h-5 w-5" /> : <CameraOff className="h-5 w-5" />}
      </Button>

      {/* Audio Toggle */}
      <Button
        onClick={onToggleAudio}
        variant="ghost"
        size="icon"
        className={`rounded-full w-12 h-12 ${
          isAudioEnabled 
            ? 'bg-gray-700 hover:bg-gray-600 text-white' 
            : 'bg-red-600 hover:bg-red-700 text-white'
        }`}
      >
        {isAudioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
      </Button>

      {/* End Call */}
      <Button
        onClick={onEndCall}
        variant="ghost"
        size="icon"
        className="rounded-full w-12 h-12 bg-red-600 hover:bg-red-700 text-white"
      >
        <Phone className="h-5 w-5" />
      </Button>
    </div>
  );
};

export default InterviewControls;
