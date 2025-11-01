import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const ComingSoon = () => {
  const [notifyMe, setNotifyMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleNotifyMe = async () => {
    if (!notifyMe || !user) return;
    
    setLoading(true);
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      await supabase.from('newsletter_subscribers').insert({
        email: authUser?.email || '',
        user_id: authUser?.id,
        source: 'coming_soon'
      });
      
      toast({
        title: "Success!",
        description: "You'll be notified when this feature launches.",
      });
      setNotifyMe(false);
    } catch (error: any) {
      // Ignore duplicate errors
      if (!error.message?.includes('duplicate')) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to subscribe. Please try again.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white py-20">
      <div className="container mx-auto px-6">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-8 text-gray-400 hover:text-white"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
        
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-8">Coming Soon</h1>
          <div className="max-w-2xl mx-auto glass-card p-8 rounded-xl">
            <p className="text-xl text-gray-300 mb-6">
              This feature is currently under development. Check back later for updates!
            </p>
            
            {user && (
              <div className="mt-6 p-6 border border-purple-500/30 rounded-lg bg-purple-900/10">
                <div className="flex items-start space-x-3 mb-4">
                  <Checkbox
                    id="notify"
                    checked={notifyMe}
                    onCheckedChange={(checked) => setNotifyMe(checked as boolean)}
                    className="mt-1"
                  />
                  <label
                    htmlFor="notify"
                    className="text-sm text-gray-300 leading-tight cursor-pointer"
                  >
                    Be the first to try this feature and get interview-ready before everyone else.
                  </label>
                </div>
                
                {notifyMe && (
                  <Button
                    onClick={handleNotifyMe}
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? "Subscribing..." : "Notify Me"}
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComingSoon;