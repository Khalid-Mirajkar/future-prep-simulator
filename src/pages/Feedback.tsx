import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, Menu, MessageSquare } from "lucide-react";
import DashboardSidebar from "@/components/DashboardSidebar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import PageHeader from "@/components/PageHeader";

const Feedback = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const { toast } = useToast();

  const handleSubmitFeedback = async () => {
    if (!feedback.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter your feedback"
      });
      return;
    }

    setSubmittingFeedback(true);
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (!authUser) throw new Error("Not authenticated");

      await supabase.from('user_feedback').insert({
        user_id: authUser.id,
        email: authUser.email || '',
        feedback_text: feedback
      });

      toast({
        title: "Success!",
        description: "Thanks for your feedback!"
      });
      
      setFeedback("");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to submit feedback. Please try again."
      });
    } finally {
      setSubmittingFeedback(false);
    }
  };

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
            <PageHeader
              title="Share Your Feedback"
              highlightedWord="Feedback"
              description="Help us improve by sharing your thoughts about SapphHIRE"
            />
            
            <div className="max-w-2xl mx-auto mt-8">
              <Card className="bg-gradient-to-br from-orange-900/30 to-black/30 border border-orange-500/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg md:text-xl font-bold flex items-center">
                    <MessageSquare className="h-5 w-5 mr-2 text-orange-400" />
                    Your Feedback
                  </CardTitle>
                  <CardDescription className="text-gray-400 text-sm">
                    We value your input and use it to make SapphHIRE better
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Textarea
                      placeholder="Tell us what you think about SapphHIRE..."
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      className="bg-black/50 border-white/20 min-h-[150px]"
                    />
                    <Button
                      onClick={handleSubmitFeedback}
                      disabled={submittingFeedback || !feedback.trim()}
                      className="w-full"
                    >
                      {submittingFeedback ? "Submitting..." : "Submit Feedback"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default Feedback;
