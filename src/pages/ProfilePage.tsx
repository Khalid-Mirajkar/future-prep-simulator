import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useProfile } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import DashboardSidebar from "@/components/DashboardSidebar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Home, Menu, LogOut } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

const ProfilePage = () => {
  const { profile, loading, updateProfile, fetchProfile } = useProfile();
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    linkedinUrl: "",
  });

  // Update form data when profile data is loaded or changed
  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.first_name || "",
        lastName: profile.last_name || "",
        phone: profile.phone || "",
        linkedinUrl: profile.linkedin_url || "",
      });
    }
  }, [profile]);

  // Refetch profile data when page is focused
  useEffect(() => {
    const handleFocus = () => {
      fetchProfile();
    };

    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchProfile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const success = await updateProfile({
      first_name: formData.firstName,
      last_name: formData.lastName,
      phone: formData.phone,
      linkedin_url: formData.linkedinUrl,
    });

    if (success) {
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
      
      // Refetch profile data to ensure we have the latest data
      fetchProfile();
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
      
      navigate("/");
    } catch (error) {
      console.error("Error logging out:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to log out. Please try again.",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

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
            <motion.div 
              className="text-center max-w-3xl mx-auto mb-6 md:mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-3xl md:text-5xl font-bold mb-4 text-white">
                My <span className="text-gradient">Profile</span>
              </h1>
              <p className="text-xl text-gray-300">
                Update your personal information and contact details
              </p>
            </motion.div>
            
            <Card className="bg-black/30 border-white/10 p-4 md:p-6">
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input 
                      id="firstName" 
                      name="firstName" 
                      value={formData.firstName} 
                      onChange={handleChange}
                      className="bg-black/50 border-white/10"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input 
                      id="lastName" 
                      name="lastName" 
                      value={formData.lastName} 
                      onChange={handleChange}
                      className="bg-black/50 border-white/10"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input 
                      id="phone" 
                      name="phone" 
                      value={formData.phone} 
                      onChange={handleChange}
                      className="bg-black/50 border-white/10"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
                    <Input 
                      id="linkedinUrl" 
                      name="linkedinUrl" 
                      value={formData.linkedinUrl} 
                      onChange={handleChange}
                      className="bg-black/50 border-white/10"
                    />
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
                    Save Changes
                  </Button>
                  
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleLogout}
                    className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Log Out
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default ProfilePage;
