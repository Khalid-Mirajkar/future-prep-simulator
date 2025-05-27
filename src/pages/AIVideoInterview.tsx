
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Video, Mic, MicOff, VideoOff, Phone, Settings } from 'lucide-react';

interface LocationState {
  companyName: string;
  jobTitle: string;
  companyLogo?: string;
}

const AIVideoInterview = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const locationState = location.state as LocationState | undefined;

  if (!locationState) {
    navigate('/start-practice');
    return null;
  }

  const handleStartInterview = () => {
    // For now, just show a transition effect
    console.log('Starting AI interview simulation...');
    // TODO: Implement actual interview flow
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white flex flex-col">
      {/* Header with meeting info */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <div className="flex items-center space-x-3">
          <h1 className="text-lg font-semibold">AI Interview Simulation</h1>
          <span className="text-sm text-gray-400">•</span>
          <span className="text-sm text-gray-400">{locationState.companyName} - {locationState.jobTitle}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Main video area */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-4xl w-full">
          {/* AI Recruiter Video Section */}
          <div className="relative mb-8">
            <div className="aspect-video bg-gray-900 rounded-lg border border-gray-700 flex items-center justify-center relative overflow-hidden">
              {/* AI Recruiter Avatar */}
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="w-32 h-32 border-4 border-purple-500/50">
                  <AvatarImage src="/placeholder.svg" alt="AI Recruiter" />
                  <AvatarFallback className="bg-gradient-to-br from-purple-600 to-pink-600 text-2xl font-bold">
                    AI
                  </AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <h2 className="text-2xl font-semibold mb-2">Meet Your AI Recruiter</h2>
                  <p className="text-gray-400">Ready to conduct your interview simulation</p>
                </div>
              </div>
              
              {/* Name overlay */}
              <div className="absolute bottom-4 left-4 bg-black/70 rounded-lg px-3 py-1">
                <span className="text-sm font-medium">AI Recruiter</span>
              </div>
            </div>
          </div>

          {/* Start Interview Section */}
          <div className="text-center space-y-6">
            <Button 
              onClick={handleStartInterview}
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-8 py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              Start Interview
            </Button>
            
            <p className="text-gray-400 text-sm max-w-md mx-auto">
              Click to begin your AI-powered video interview simulation.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom controls (Google Meet style) */}
      <div className="p-6 border-t border-gray-800">
        <div className="flex items-center justify-center space-x-4">
          <Button variant="ghost" size="icon" className="bg-gray-800 hover:bg-gray-700 rounded-full w-12 h-12">
            <Mic className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="bg-gray-800 hover:bg-gray-700 rounded-full w-12 h-12">
            <Video className="h-5 w-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="bg-red-600 hover:bg-red-700 rounded-full w-12 h-12"
            onClick={() => navigate('/start-practice')}
          >
            <Phone className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AIVideoInterview;
