import React, { useRef } from "react";
import { ArrowLeft, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import PageTransition from "@/components/PageTransition";
import sapphireBase from "@/assets/sapphire-base.jpeg";

const LogoTesting = () => {
  const navigate = useNavigate();
  const logoRef = useRef<HTMLDivElement>(null);

  // Add CSS animations for the logo
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes shimmer {
        0%, 100% { 
          filter: brightness(1) saturate(1);
        }
        50% { 
          filter: brightness(1.2) saturate(1.3);
        }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const downloadAsPNG = async () => {
    if (!logoRef.current) return;
    
    try {
      // Create a canvas element to render the logo
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const scale = 2; // High DPI scaling
      
      canvas.width = 400 * scale;
      canvas.height = 400 * scale;
      
      if (ctx) {
        ctx.scale(scale, scale);
        
        // Set transparent background
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw circular sapphire base
        const centerX = 200;
        const centerY = 200;
        const radius = 180;
        
        // Create clean sapphire gradient
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
        gradient.addColorStop(0, '#1e3a8a');
        gradient.addColorStop(0.5, '#1e40af');
        gradient.addColorStop(1, '#1e1b4b');
        
        // Draw main circle
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Add semi-transparent overlay
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(30, 58, 138, 0.7)';
        ctx.fill();
        
        // First H (behind) - geometric design
        ctx.save();
        ctx.translate(centerX - 12, centerY + 4);
        
        // Create gradient for first H
        const hGradient1 = ctx.createLinearGradient(0, 0, 50, 80);
        hGradient1.addColorStop(0, '#e0e7ff');
        hGradient1.addColorStop(0.5, '#ffffff');
        hGradient1.addColorStop(1, '#c7d2fe');
        
        ctx.fillStyle = hGradient1;
        
        // Left vertical bar
        ctx.fillRect(-20, -35, 8, 70);
        // Right vertical bar  
        ctx.fillRect(12, -35, 8, 70);
        // Horizontal bar (tilted)
        ctx.save();
        ctx.rotate(0.14); // 8 degrees
        ctx.fillRect(-20, -3, 24, 6);
        ctx.restore();
        
        ctx.restore();
        
        // Second H (front) - geometric design
        ctx.save();
        ctx.translate(centerX + 16, centerY - 8);
        
        // Create gradient for second H
        const hGradient2 = ctx.createLinearGradient(0, 0, 50, 80);
        hGradient2.addColorStop(0, '#f8fafc');
        hGradient2.addColorStop(0.5, '#ffffff');
        hGradient2.addColorStop(1, '#e2e8f0');
        
        ctx.fillStyle = hGradient2;
        ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
        ctx.shadowBlur = 8;
        
        // Left vertical bar
        ctx.fillRect(-20, -35, 8, 70);
        // Right vertical bar
        ctx.fillRect(12, -35, 8, 70);
        // Horizontal bar (tilted)
        ctx.save();
        ctx.rotate(0.14); // 8 degrees
        ctx.fillRect(-20, -3, 24, 6);
        ctx.restore();
        
        ctx.restore();
        
        // Reset shadow
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        
        // Download the canvas as PNG
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'sapphhire-premium-logo.png';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            toast.success("Premium Sapphhire logo PNG downloaded!");
          }
        }, 'image/png');
      }
    } catch (error) {
      toast.error("PNG download failed. Please use browser's 'Save as Image' option.");
    }
  };

  const downloadAsSVG = () => {
    const svgContent = `
<svg width="400" height="400" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="sapphireGradient" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#1e3a8a"/>
      <stop offset="50%" stop-color="#1e40af"/>
      <stop offset="100%" stop-color="#1e1b4b"/>
    </radialGradient>
    <linearGradient id="hGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#e0e7ff"/>
      <stop offset="50%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#c7d2fe"/>
    </linearGradient>
    <linearGradient id="hGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f8fafc"/>
      <stop offset="50%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#e2e8f0"/>
    </linearGradient>
  </defs>
  
  <!-- Main sapphire circle -->
  <circle cx="200" cy="200" r="180" fill="url(#sapphireGradient)"/>
  
  <!-- Semi-transparent overlay -->
  <circle cx="200" cy="200" r="180" fill="rgba(30, 58, 138, 0.7)"/>
  
  <!-- First H (behind) - Clean geometric design -->
  <g transform="translate(188, 204)">
    <rect x="-20" y="-35" width="8" height="70" rx="4" fill="url(#hGradient1)"/>
    <rect x="12" y="-35" width="8" height="70" rx="4" fill="url(#hGradient1)"/>
    <rect x="-20" y="-3" width="24" height="6" rx="3" fill="url(#hGradient1)" transform="rotate(8)"/>
  </g>
  
  <!-- Second H (front, overlapping) - Clean geometric design -->
  <g transform="translate(216, 192)" filter="drop-shadow(0 0 8px rgba(255,255,255,0.5))">
    <rect x="-20" y="-35" width="8" height="70" rx="4" fill="url(#hGradient2)"/>
    <rect x="12" y="-35" width="8" height="70" rx="4" fill="url(#hGradient2)"/>
    <rect x="-20" y="-3" width="24" height="6" rx="3" fill="url(#hGradient2)" transform="rotate(8)"/>
  </g>
</svg>`;

    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sapphhire-premium-logo.svg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Premium Sapphhire logo SVG downloaded!");
  };

  const downloadAsPDF = () => {
    toast.info("PDF download: Convert the SVG file to PDF using external tools like Inkscape or online converters.");
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#0D0D0D] py-8">
        <div className="container mx-auto px-6 max-w-4xl">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              onClick={() => navigate("/")}
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
            <h1 className="text-3xl font-bold text-white">Premium Sapphhire Logo</h1>
          </div>

          {/* Warning Notice */}
          <Card className="bg-amber-500/10 border-amber-500/20 mb-8">
            <CardContent className="p-4">
              <p className="text-amber-400 text-sm">
                <strong>⚠️ Temporary Testing Page:</strong> This page is for logo experimentation only. 
                It will be removed once the final logo is selected.
              </p>
            </CardContent>
          </Card>

          {/* Logo Display */}
          <Card className="glass-card border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Premium Sapphhire Circular Logo</CardTitle>
              <p className="text-gray-400 text-sm">
                Sapphire gemstone base with overlapping H letters and premium metallic highlights
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Logo Display */}
              <div className="bg-gradient-to-b from-gray-50 to-gray-100 border border-white/10 rounded-lg p-12 text-center">
                <div 
                  ref={logoRef}
                  className="relative w-80 h-80 mx-auto"
                >
                  {/* Sapphire Base */}
                  <div 
                    className="absolute inset-0 rounded-full bg-cover bg-center"
                    style={{ 
                      backgroundImage: `url(${sapphireBase})`,
                      filter: 'brightness(0.9) contrast(1.1) saturate(1.2)'
                    }}
                  />
                  
                  {/* Semi-transparent overlay - clean and simple */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-950/70 to-indigo-900/70" />
                  
                  {/* Overlapping H Letters Container */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    {/* First H (Behind) - Clean geometric design */}
                    <div className="absolute transform -translate-x-3 translate-y-1">
                      <svg width="60" height="80" viewBox="0 0 60 80" className="drop-shadow-lg">
                        {/* Left vertical bar */}
                        <rect x="5" y="5" width="8" height="70" rx="4" 
                              fill="url(#hGradient1)" />
                        {/* Right vertical bar */}
                        <rect x="37" y="5" width="8" height="70" rx="4" 
                              fill="url(#hGradient1)" />
                        {/* Horizontal crossbar - slightly tilted */}
                        <rect x="13" y="35" width="24" height="6" rx="3" 
                              fill="url(#hGradient1)" 
                              transform="rotate(8 25 38)" />
                        
                        <defs>
                          <linearGradient id="hGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#e0e7ff" />
                            <stop offset="50%" stopColor="#ffffff" />
                            <stop offset="100%" stopColor="#c7d2fe" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>
                    
                    {/* Second H (Front, overlapping) - Clean geometric design */}
                    <div className="absolute transform translate-x-4 -translate-y-2">
                      <svg width="60" height="80" viewBox="0 0 60 80" className="drop-shadow-2xl">
                        {/* Left vertical bar */}
                        <rect x="5" y="5" width="8" height="70" rx="4" 
                              fill="url(#hGradient2)" />
                        {/* Right vertical bar */}
                        <rect x="37" y="5" width="8" height="70" rx="4" 
                              fill="url(#hGradient2)" />
                        {/* Horizontal crossbar - slightly tilted */}
                        <rect x="13" y="35" width="24" height="6" rx="3" 
                              fill="url(#hGradient2)" 
                              transform="rotate(8 25 38)" />
                        
                        <defs>
                          <linearGradient id="hGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#f8fafc" />
                            <stop offset="50%" stopColor="#ffffff" />
                            <stop offset="100%" stopColor="#e2e8f0" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>
                  </div>
                  
                  {/* Subtle shimmer animation overlay */}
                  <div 
                    className="absolute inset-0 rounded-full opacity-20"
                    style={{
                      background: 'linear-gradient(45deg, transparent, rgba(255,255,255,0.3), transparent)',
                      animation: 'shimmer 6s ease-in-out infinite'
                    }}
                  />
                </div>
              </div>

              {/* Download Options */}
              <div className="flex flex-wrap gap-3 justify-center">
                <Button
                  onClick={downloadAsPNG}
                  variant="outline"
                  size="sm"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download PNG
                </Button>
                <Button
                  onClick={downloadAsSVG}
                  variant="outline"
                  size="sm"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download SVG
                </Button>
                <Button
                  onClick={downloadAsPDF}
                  variant="outline"
                  size="sm"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Convert to PDF
                </Button>
              </div>

              {/* Design Specifications */}
              <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <h3 className="text-white font-semibold mb-3">Premium Logo Design Specifications</h3>
                <ul className="text-gray-300 text-sm space-y-2">
                  <li>• <strong>Base:</strong> Circular sapphire gemstone background (320px diameter)</li>
                  <li>• <strong>Colors:</strong> Deep sapphire blues with clean gradients and metallic highlights</li>
                  <li>• <strong>Overlay:</strong> Semi-transparent blue layer (70% opacity) for premium depth</li>
                  <li>• <strong>Letters:</strong> Two clean, geometric H letters with precise overlapping</li>
                  <li>• <strong>Design:</strong> Professional geometric letterforms with tilted crossbars (+8°)</li>
                  <li>• <strong>Effects:</strong> Subtle drop shadows and refined gradients for premium feel</li>
                  <li>• <strong>Animations:</strong> Gentle shimmer effect for luxury aesthetic</li>
                  <li>• <strong>Style:</strong> Clean, geometric design inspired by premium jewelry branding</li>
                  <li>• <strong>Format:</strong> Available in PNG (transparent), SVG, and PDF conversion</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
};

export default LogoTesting;