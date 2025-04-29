
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, Menu } from "lucide-react";
import DashboardSidebar from "./DashboardSidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const ComingSoonPlaceholder = () => {
  const navigate = useNavigate();
  const { section } = useParams();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const sectionName = section?.charAt(0).toUpperCase() + section?.slice(1).replace(/-/g, ' ');

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white relative">
      {!isMobile ? (
        <DashboardSidebar />
      ) : (
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="fixed top-4 left-4 z-20"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[240px] p-0 border-r border-white/10 bg-black/80">
            <DashboardSidebar />
          </SheetContent>
        </Sheet>
      )}
      
      <Button 
        variant="ghost" 
        size="icon" 
        className="absolute top-4 right-4 z-20"
        onClick={() => navigate('/')}
        title="Back to Home"
      >
        <Home className="h-6 w-6" />
      </Button>
      
      <main className={isMobile ? "pt-16" : "pl-64"}>
        <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-6">{sectionName}</h1>
          
          <div className="relative w-24 h-24 md:w-32 md:h-32 mb-6 md:mb-8">
            <div className="absolute inset-0 bg-purple-600 rounded-full opacity-20 animate-ping"></div>
            <div className="absolute inset-3 md:inset-4 bg-purple-500 rounded-full"></div>
          </div>
          
          <p className="text-xl md:text-2xl text-center mb-3 md:mb-4">Coming Soon</p>
          <p className="text-gray-400 text-center max-w-lg mb-6 md:mb-8 px-4">
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
