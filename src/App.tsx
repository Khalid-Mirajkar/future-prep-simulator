import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import StartPractice from "./pages/StartPractice";
import MCQTest from "./pages/MCQTest";
import Results from "./pages/Results";
import ComingSoon from "./pages/ComingSoon";
import Dashboard from "./pages/Dashboard";
import ComingSoonPlaceholder from "./components/ComingSoonPlaceholder";
import ParticlesBackground from "./components/ParticlesBackground";
import ProfilePage from "./pages/ProfilePage";
import Analytics from "./pages/Analytics";
import History from "./pages/History";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <ParticlesBackground />
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/start-practice" element={<StartPractice />} />
            <Route path="/mcq-test" element={<MCQTest />} />
            <Route path="/results" element={<Results />} />
            <Route path="/results/:id" element={<Results />} />
            <Route path="/coming-soon" element={<ComingSoon />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/profile" element={<ProfilePage />} />
            <Route path="/dashboard/analytics" element={<Analytics />} />
            <Route path="/dashboard/history" element={<History />} />
            <Route path="/dashboard/:section" element={<ComingSoonPlaceholder />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
