
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import DashboardSidebar from "@/components/DashboardSidebar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <ProtectedRoute>
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
          <div className="p-8">
            <h1 className="text-3xl font-bold mb-6">Welcome to your Dashboard</h1>
            <p className="text-gray-400 mb-8">
              Select an option from the sidebar to get started.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-6 rounded-lg bg-gradient-to-br from-purple-900/30 to-black/30 border border-purple-500/30">
                <h2 className="text-xl font-bold mb-2">Quick Stats</h2>
                <p className="text-gray-400">See your progress at a glance</p>
              </div>
              
              <div className="p-6 rounded-lg bg-gradient-to-br from-blue-900/30 to-black/30 border border-blue-500/30">
                <h2 className="text-xl font-bold mb-2">Recent Activity</h2>
                <p className="text-gray-400">Your latest interview practice sessions</p>
              </div>
              
              <div className="p-6 rounded-lg bg-gradient-to-br from-green-900/30 to-black/30 border border-green-500/30">
                <h2 className="text-xl font-bold mb-2">Improvement Areas</h2>
                <p className="text-gray-400">Focus on these topics to improve</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default Dashboard;
