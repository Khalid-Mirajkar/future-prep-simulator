
import React from 'react';
import { Button } from '@/components/ui/button';
import { Camera, CameraOff, Mic, MicOff, Phone, MoreHorizontal, Users, MessageSquare, Share } from 'lucide-react';

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
    <div className="absolute bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-sm border-t border-gray-700">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left side - Meeting info */}
        <div className="flex items-center space-x-4">
          <div className="text-white text-sm">
            <span className="text-gray-400">Interview Session</span>
          </div>
        </div>

        {/* Center - Main controls */}
        <div className="flex items-center space-x-6">
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

          {/* End Call */}
          <Button
            onClick={onEndCall}
            variant="ghost"
            size="icon"
            className="rounded-full w-12 h-12 bg-red-600 hover:bg-red-700 text-white"
          >
            <Phone className="h-5 w-5 rotate-135" />
          </Button>

          {/* Share Screen (disabled for now) */}
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full w-12 h-12 bg-gray-700 hover:bg-gray-600 text-white opacity-50 cursor-not-allowed"
            disabled
          >
            <Share className="h-5 w-5" />
          </Button>

          {/* More options */}
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full w-12 h-12 bg-gray-700 hover:bg-gray-600 text-white"
          >
            <MoreHorizontal className="h-5 w-5" />
          </Button>
        </div>

        {/* Right side - Additional controls */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full w-10 h-10 bg-gray-700 hover:bg-gray-600 text-white"
          >
            <Users className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full w-10 h-10 bg-gray-700 hover:bg-gray-600 text-white"
          >
            <MessageSquare className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InterviewControls;
