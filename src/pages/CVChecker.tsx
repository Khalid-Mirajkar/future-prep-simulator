
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, Menu } from 'lucide-react';
import DashboardSidebar from '@/components/DashboardSidebar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import PageHeader from '@/components/PageHeader';
import CVAnalysisForm from '@/components/CVAnalysisForm';
import CVAnalysisResults from '@/components/CVAnalysisResults';

const CVChecker = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  const handleAnalysisComplete = (result: any) => {
    setAnalysisResult(result);
  };

  const handleStartNew = () => {
    setAnalysisResult(null);
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
              title="ATS-Friendly CV Checker"
              highlightedWord="CV Checker"
              description="Upload your CV and get detailed analysis for ATS compatibility and job relevance."
            />
            
            <div className="max-w-6xl mx-auto">
              {!analysisResult ? (
                <CVAnalysisForm onAnalysisComplete={handleAnalysisComplete} />
              ) : (
                <CVAnalysisResults 
                  analysis={analysisResult} 
                  onStartNew={handleStartNew}
                />
              )}
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default CVChecker;
