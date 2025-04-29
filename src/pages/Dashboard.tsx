
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import DashboardSidebar from "@/components/DashboardSidebar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Home, Menu } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ProtectedRoute>
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
          <div className="p-4 md:p-8">
            <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">Welcome to your Dashboard</h1>
            <p className="text-gray-400 mb-6 md:mb-8">
              Select an option from the {isMobile ? "menu" : "sidebar"} to get started.
            </p>
            
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 md:gap-6">
              <div className="p-4 md:p-6 rounded-lg bg-gradient-to-br from-purple-900/30 to-black/30 border border-purple-500/30">
                <h2 className="text-lg md:text-xl font-bold mb-2">Quick Stats</h2>
                <p className="text-gray-400 text-sm md:text-base">See your progress at a glance</p>
              </div>
              
              <div className="p-4 md:p-6 rounded-lg bg-gradient-to-br from-blue-900/30 to-black/30 border border-blue-500/30">
                <h2 className="text-lg md:text-xl font-bold mb-2">Recent Activity</h2>
                <p className="text-gray-400 text-sm md:text-base">Your latest interview practice sessions</p>
              </div>
              
              <div className="p-4 md:p-6 rounded-lg bg-gradient-to-br from-green-900/30 to-black/30 border border-green-500/30">
                <h2 className="text-lg md:text-xl font-bold mb-2">Improvement Areas</h2>
                <p className="text-gray-400 text-sm md:text-base">Focus on these topics to improve</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default Dashboard;
