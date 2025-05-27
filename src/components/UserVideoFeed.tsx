
import React, { useEffect } from 'react';
import { Camera, CameraOff } from 'lucide-react';

interface UserVideoFeedProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  isVideoEnabled: boolean;
  onInitialize: () => Promise<void>;
  subtitle?: string;
  isListening?: boolean;
}

const UserVideoFeed: React.FC<UserVideoFeedProps> = ({ 
  videoRef, 
  isVideoEnabled, 
  onInitialize,
  subtitle,
  isListening 
}) => {
  useEffect(() => {
    onInitialize();
  }, [onInitialize]);

  return (
    <div className="relative w-full h-full bg-gray-900 rounded-lg overflow-hidden">
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

      {/* Subtitle overlay */}
      {subtitle && (
        <div className="absolute bottom-10 left-3 right-3 z-10">
          <div className="bg-black/80 backdrop-blur-sm rounded-lg px-3 py-2">
            <p className="text-white text-sm leading-relaxed text-center">
              {subtitle}
            </p>
          </div>
        </div>
      )}

      {/* Listening indicator */}
      {isListening && (
        <div className="absolute top-3 right-3">
          <div className="bg-red-500/80 rounded-full p-2 animate-pulse">
            <div className="w-3 h-3 bg-white rounded-full"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserVideoFeed;
