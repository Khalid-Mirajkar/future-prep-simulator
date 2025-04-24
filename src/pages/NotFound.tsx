
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import GlowingButton from "@/components/GlowingButton";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-dark p-6 relative">
      {/* Background gradient */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-neon-purple/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-neon-blue/10 rounded-full blur-3xl"></div>
      </div>

      <div className="text-center max-w-md">
        <div className="mb-8">
          <h1 className="text-9xl font-orbitron font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-purple to-neon-blue">404</h1>
        </div>
        <div className="glass-card p-8 rounded-xl mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Page Not Found</h2>
          <p className="text-gray-300 mb-6">
            The page you're looking for doesn't exist or has been moved to another location.
          </p>
          <GlowingButton>
            <Home className="mr-2 h-4 w-4" /> Return to Home
          </GlowingButton>
        </div>
      </div>

      {/* Decorative circuit lines */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <svg width="100%" height="100%" className="absolute inset-0">
          <defs>
            <pattern id="circuit-pattern" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
              <path d="M0 40 L40 40 L40 0" fill="none" stroke="rgba(155, 135, 245, 0.3)" strokeWidth="1"></path>
              <path d="M80 40 L40 40 L40 80" fill="none" stroke="rgba(155, 135, 245, 0.3)" strokeWidth="1"></path>
              <circle cx="40" cy="40" r="3" fill="rgba(155, 135, 245, 0.5)"></circle>
            </pattern>
          </defs>
          <rect x="0" y="0" width="100%" height="100%" fill="url(#circuit-pattern)"></rect>
        </svg>
      </div>
    </div>
  );
};

export default NotFound;
