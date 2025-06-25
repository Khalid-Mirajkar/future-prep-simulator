
import { useState, useRef, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface UseUserCameraReturn {
  videoRef: React.RefObject<HTMLVideoElement>;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  toggleVideo: () => void;
  toggleAudio: () => void;
  initializeCamera: () => Promise<void>;
  stopCamera: () => void;
  hasPermissionError: boolean;
}

export const useUserCamera = (): UseUserCameraReturn => {
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [hasPermissionError, setHasPermissionError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();

  const initializeCamera = useCallback(async () => {
    try {
      setHasPermissionError(false);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      // Update states based on stream tracks
      const videoTracks = stream.getVideoTracks();
      const audioTracks = stream.getAudioTracks();
      
      setIsVideoEnabled(videoTracks.length > 0 && videoTracks[0].enabled);
      setIsAudioEnabled(audioTracks.length > 0 && audioTracks[0].enabled);
      
      console.log('Camera initialized successfully');
    } catch (error) {
      console.error('Error accessing camera:', error);
      setHasPermissionError(true);
      toast({
        variant: "destructive",
        title: "Camera Error",
        description: "Failed to access camera. Please check your permissions and try again.",
      });
    }
  }, [toast]);

  const toggleVideo = useCallback(async () => {
    if (streamRef.current) {
      const videoTracks = streamRef.current.getVideoTracks();
      
      if (videoTracks.length > 0) {
        const newEnabled = !videoTracks[0].enabled;
        videoTracks.forEach(track => {
          track.enabled = newEnabled;
        });
        setIsVideoEnabled(newEnabled);
        
        // If enabling video but track is ended, reinitialize camera
        if (newEnabled && videoTracks[0].readyState === 'ended') {
          await initializeCamera();
        }
      } else if (!isVideoEnabled) {
        // No video tracks but trying to enable - reinitialize
        await initializeCamera();
      }
    } else if (!isVideoEnabled) {
      // No stream but trying to enable video - initialize camera
      await initializeCamera();
    }
  }, [isVideoEnabled, initializeCamera]);

  const toggleAudio = useCallback(() => {
    if (streamRef.current) {
      const audioTracks = streamRef.current.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsAudioEnabled(prev => !prev);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return {
    videoRef,
    isVideoEnabled,
    isAudioEnabled,
    toggleVideo,
    toggleAudio,
    initializeCamera,
    stopCamera,
    hasPermissionError
  };
};
