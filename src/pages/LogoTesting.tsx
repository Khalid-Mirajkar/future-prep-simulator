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
        
        // Draw circular sapphire base with gradient
        const centerX = 200;
        const centerY = 200;
        const radius = 180;
        
        // Create sapphire gradient
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
        gradient.addColorStop(0, '#4A90E2');
        gradient.addColorStop(0.3, '#1E40AF');
        gradient.addColorStop(0.6, '#1E3A8A');
        gradient.addColorStop(0.8, '#1E1B4B');
        gradient.addColorStop(1, '#0F0C29');
        
        // Draw main circle
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Add faceted effect with lighter highlights
        const highlightGradient = ctx.createRadialGradient(centerX - 50, centerY - 50, 0, centerX, centerY, radius);
        highlightGradient.addColorStop(0, 'rgba(135, 206, 250, 0.6)');
        highlightGradient.addColorStop(0.4, 'rgba(59, 130, 246, 0.3)');
        highlightGradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
        
        ctx.fillStyle = highlightGradient;
        ctx.fill();
        
        // Add semi-transparent overlay circle
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(30, 64, 175, 0.3)';
        ctx.fill();
        
        // Draw overlapping H letters
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 80px Inter, system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Add glow effect for H letters
        ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        
        // First H (slightly offset)
        ctx.save();
        ctx.translate(centerX - 25, centerY);
        ctx.rotate(-0.1);
        
        // Draw H structure manually for better control
        ctx.fillRect(-25, -40, 8, 80); // Left vertical
        ctx.fillRect(17, -40, 8, 80);  // Right vertical
        ctx.fillRect(-25, -4, 50, 8);  // Horizontal bar (tilted effect)
        
        // Add arrow elements
        ctx.beginPath();
        ctx.moveTo(-17, -50);
        ctx.lineTo(-17, -35);
        ctx.lineTo(-25, -42);
        ctx.moveTo(-17, -35);
        ctx.lineTo(-9, -42);
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        ctx.restore();
        
        // Second H (overlapping)
        ctx.save();
        ctx.translate(centerX + 25, centerY);
        ctx.rotate(0.1);
        
        // Draw H structure
        ctx.fillRect(-25, -40, 8, 80); // Left vertical
        ctx.fillRect(17, -40, 8, 80);  // Right vertical
        ctx.fillRect(-25, -4, 50, 8);  // Horizontal bar
        
        // Add arrow elements
        ctx.beginPath();
        ctx.moveTo(25, -50);
        ctx.lineTo(25, -35);
        ctx.lineTo(17, -42);
        ctx.moveTo(25, -35);
        ctx.lineTo(33, -42);
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 3;
        ctx.stroke();
        
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
      <stop offset="0%" stop-color="#4A90E2"/>
      <stop offset="30%" stop-color="#1E40AF"/>
      <stop offset="60%" stop-color="#1E3A8A"/>
      <stop offset="80%" stop-color="#1E1B4B"/>
      <stop offset="100%" stop-color="#0F0C29"/>
    </radialGradient>
    <radialGradient id="highlightGradient" cx="35%" cy="35%" r="50%">
      <stop offset="0%" stop-color="rgba(135, 206, 250, 0.6)"/>
      <stop offset="40%" stop-color="rgba(59, 130, 246, 0.3)"/>
      <stop offset="100%" stop-color="rgba(59, 130, 246, 0)"/>
    </radialGradient>
    <filter id="glowEffect">
      <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
      <feMerge> 
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  
  <!-- Main sapphire circle -->
  <circle cx="200" cy="200" r="180" fill="url(#sapphireGradient)"/>
  
  <!-- Highlight effect -->
  <circle cx="200" cy="200" r="180" fill="url(#highlightGradient)"/>
  
  <!-- Semi-transparent overlay -->
  <circle cx="200" cy="200" r="180" fill="rgba(30, 64, 175, 0.3)"/>
  
  <!-- First H (rotated and positioned) -->
  <g transform="translate(175, 200) rotate(-6)" filter="url(#glowEffect)">
    <rect x="-25" y="-40" width="8" height="80" fill="white"/>
    <rect x="17" y="-40" width="8" height="80" fill="white"/>
    <rect x="-25" y="-4" width="50" height="8" fill="white"/>
    <!-- Arrow elements -->
    <path d="M -17 -50 L -17 -35 L -25 -42 M -17 -35 L -9 -42" stroke="white" stroke-width="3" fill="none"/>
  </g>
  
  <!-- Second H (rotated and positioned) -->
  <g transform="translate(225, 200) rotate(6)" filter="url(#glowEffect)">
    <rect x="-25" y="-40" width="8" height="80" fill="white"/>
    <rect x="17" y="-40" width="8" height="80" fill="white"/>
    <rect x="-25" y="-4" width="50" height="8" fill="white"/>
    <!-- Arrow elements -->
    <path d="M 25 -50 L 25 -35 L 17 -42 M 25 -35 L 33 -42" stroke="white" stroke-width="3" fill="none"/>
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
                  className="inline-block relative"
                  style={{
                    width: '300px',
                    height: '300px',
                    borderRadius: '50%',
                    background: `
                      radial-gradient(circle at 50% 50%, 
                        #4A90E2 0%, 
                        #1E40AF 30%, 
                        #1E3A8A 60%, 
                        #1E1B4B 80%, 
                        #0F0C29 100%
                      ),
                      radial-gradient(circle at 35% 35%, 
                        rgba(135, 206, 250, 0.6) 0%, 
                        rgba(59, 130, 246, 0.3) 40%, 
                        rgba(59, 130, 246, 0) 100%
                      )
                    `,
                    backgroundBlendMode: 'overlay',
                    boxShadow: `
                      0 0 30px rgba(30, 64, 175, 0.4),
                      inset 0 0 100px rgba(135, 206, 250, 0.2),
                      0 10px 50px rgba(30, 64, 175, 0.3)
                    `,
                    animation: 'pulse 3s ease-in-out infinite alternate, shimmer 6s ease-in-out infinite'
                  }}
                >
                  {/* Semi-transparent overlay */}
                  <div 
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: 'rgba(30, 64, 175, 0.3)',
                      backdropFilter: 'blur(1px)'
                    }}
                  />
                  
                  {/* Overlapping H Letters */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    {/* First H */}
                    <div 
                      className="absolute text-white font-bold select-none"
                      style={{
                        fontSize: '80px',
                        fontFamily: 'Inter, system-ui, sans-serif',
                        transform: 'translateX(-20px) rotate(-6deg)',
                        textShadow: '0 0 20px rgba(255, 255, 255, 0.8), 0 0 40px rgba(255, 255, 255, 0.4)',
                        filter: 'drop-shadow(0 0 15px rgba(255, 255, 255, 0.6))'
                      }}
                    >
                      <div className="relative">
                        H
                        {/* Arrow elements for first H */}
                        <div 
                          className="absolute"
                          style={{
                            top: '-20px',
                            left: '8px',
                            width: '0',
                            height: '0',
                            borderLeft: '6px solid transparent',
                            borderRight: '6px solid transparent',
                            borderBottom: '12px solid white'
                          }}
                        />
                      </div>
                    </div>
                    
                    {/* Second H */}
                    <div 
                      className="absolute text-white font-bold select-none"
                      style={{
                        fontSize: '80px',
                        fontFamily: 'Inter, system-ui, sans-serif',
                        transform: 'translateX(20px) rotate(6deg)',
                        textShadow: '0 0 20px rgba(255, 255, 255, 0.8), 0 0 40px rgba(255, 255, 255, 0.4)',
                        filter: 'drop-shadow(0 0 15px rgba(255, 255, 255, 0.6))'
                      }}
                    >
                      <div className="relative">
                        H
                        {/* Arrow elements for second H */}
                        <div 
                          className="absolute"
                          style={{
                            top: '-20px',
                            right: '8px',
                            width: '0',
                            height: '0',
                            borderLeft: '6px solid transparent',
                            borderRight: '6px solid transparent',
                            borderBottom: '12px solid white'
                          }}
                        />
                      </div>
                    </div>
                  </div>
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
                  <li>• <strong>Base:</strong> Circular sapphire gemstone with radial gradient (300px diameter)</li>
                  <li>• <strong>Colors:</strong> Deep sapphire blues (#4A90E2 → #0F0C29) with metallic highlights</li>
                  <li>• <strong>Overlay:</strong> Semi-transparent blue layer (70% opacity) for depth</li>
                  <li>• <strong>Letters:</strong> Two overlapping white H letters with subtle rotation (±6°)</li>
                  <li>• <strong>Effects:</strong> White glow, drop shadows, premium metallic finish</li>
                  <li>• <strong>Animations:</strong> Subtle pulse and shimmer effects for luxury feel</li>
                  <li>• <strong>Arrows:</strong> Upward-pointing elements on each H for dynamic energy</li>
                  <li>• <strong>Style:</strong> Luxury gemstone aesthetic inspired by high-end jewelry brands</li>
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