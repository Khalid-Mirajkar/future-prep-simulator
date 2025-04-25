
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import DashboardSidebar from "./DashboardSidebar";

const ComingSoonPlaceholder = () => {
  const navigate = useNavigate();
  const { section } = useParams();
  
  const sectionName = section?.charAt(0).toUpperCase() + section?.slice(1).replace(/-/g, ' ');

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white relative">
      <DashboardSidebar />
      
      <Button 
        variant="ghost" 
        size="icon" 
        className="absolute top-4 right-4 z-20"
        onClick={() => navigate('/')}
        title="Back to Home"
      >
        <Home className="h-6 w-6" />
      </Button>
      
      <main className="pl-64">
        <div className="min-h-screen flex flex-col items-center justify-center p-8">
          <h1 className="text-4xl font-bold mb-6">{sectionName}</h1>
          
          <div className="relative w-32 h-32 mb-8">
            <div className="absolute inset-0 bg-purple-600 rounded-full opacity-20 animate-ping"></div>
            <div className="absolute inset-4 bg-purple-500 rounded-full"></div>
          </div>
          
          <p className="text-2xl text-center mb-4">Coming Soon</p>
          <p className="text-gray-400 text-center max-w-lg mb-8">
            This feature is currently under development. Check back later for updates!
          </p>
          
          <Button onClick={() => navigate('/dashboard')} variant="outline">
            Back to Dashboard
          </Button>
        </div>
      </main>
    </div>
  );
};

export default ComingSoonPlaceholder;
