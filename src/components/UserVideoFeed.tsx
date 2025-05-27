
import React, { useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Camera, CameraOff } from 'lucide-react';

interface UserVideoFeedProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  isVideoEnabled: boolean;
  onInitialize: () => Promise<void>;
}

const UserVideoFeed: React.FC<UserVideoFeedProps> = ({ 
  videoRef, 
  isVideoEnabled, 
  onInitialize 
}) => {
  useEffect(() => {
    onInitialize();
  }, [onInitialize]);

  return (
    <Card className="relative overflow-hidden bg-gray-900 border-gray-700 h-full">
      {isVideoEnabled ? (
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-800">
          <div className="text-center">
            <CameraOff className="h-12 w-12 text-gray-500 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">Camera Off</p>
          </div>
        </div>
      )}
      
      {/* Video status indicator */}
      <div className="absolute top-3 left-3">
        <div className={`flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium ${
          isVideoEnabled 
            ? 'bg-green-600/80 text-white' 
            : 'bg-red-600/80 text-white'
        }`}>
          {isVideoEnabled ? <Camera className="h-3 w-3" /> : <CameraOff className="h-3 w-3" />}
          {isVideoEnabled ? 'Live' : 'Off'}
        </div>
      </div>
      
      {/* User label */}
      <div className="absolute bottom-3 left-3">
        <div className="bg-black/60 px-2 py-1 rounded text-white text-xs font-medium">
          You
        </div>
      </div>
    </Card>
  );
};

export default UserVideoFeed;
