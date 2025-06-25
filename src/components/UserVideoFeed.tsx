
import React, { useEffect } from 'react';
import { Camera, CameraOff, AlertCircle } from 'lucide-react';

interface UserVideoFeedProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  isVideoEnabled: boolean;
  onInitialize: () => Promise<void>;
  subtitle?: string;
  isListening?: boolean;
  hasPermissionError?: boolean;
  showPreviewLabel?: boolean;
}

const UserVideoFeed: React.FC<UserVideoFeedProps> = ({ 
  videoRef, 
  isVideoEnabled, 
  onInitialize,
  subtitle,
  isListening,
  hasPermissionError = false,
  showPreviewLabel = false
}) => {
  useEffect(() => {
    onInitialize();
  }, [onInitialize]);

  return (
    <div className="relative w-full h-full bg-gray-900 rounded-lg overflow-hidden">
      {/* Preview Label */}
      {showPreviewLabel && (
        <div className="absolute top-3 left-3 z-10">
          <div className="bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-white text-xs font-medium flex items-center gap-1">
            👁️ Preview
          </div>
        </div>
      )}
      
      {isVideoEnabled && !hasPermissionError ? (
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
            {hasPermissionError ? (
              <>
                <div className="w-20 h-20 bg-red-900/50 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <AlertCircle className="h-10 w-10 text-red-400" />
                </div>
                <p className="text-red-400 text-sm mb-2">Unable to detect camera</p>
                <p className="text-gray-400 text-xs">Please check permissions</p>
              </>
            ) : (
              <>
                <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <CameraOff className="h-10 w-10 text-gray-400" />
                </div>
                <p className="text-gray-400 text-sm">Camera Off</p>
              </>
            )}
          </div>
        </div>
      )}
      
      {/* User label */}
      <div className="absolute bottom-3 left-3">
        <div className="bg-black/60 px-2 py-1 rounded text-white text-xs font-medium">
          You
        </div>
      </div>

      {/* Listening indicator */}
      {isListening && (
        <div className="absolute top-3 right-3">
          <div className="bg-red-500 rounded-full p-2 animate-pulse">
            <div className="w-3 h-3 bg-white rounded-full"></div>
          </div>
        </div>
      )}

      {/* Live transcript overlay */}
      {subtitle && (
        <div className="absolute bottom-12 left-3 right-3">
          <div className="bg-black/80 backdrop-blur-sm rounded-lg px-3 py-2">
            <p className="text-white text-sm text-center leading-relaxed">
              {subtitle}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserVideoFeed;
