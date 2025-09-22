import React, { useRef } from "react";
import { ArrowLeft, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import PageTransition from "@/components/PageTransition";

const LogoTesting = () => {
  const navigate = useNavigate();
  const logoRef = useRef<HTMLDivElement>(null);

  const downloadAsPNG = async () => {
    if (!logoRef.current) return;
    
    // Using html2canvas would require importing it, so for now we'll show a message
    toast.info("PNG download: Use browser's 'Save as Image' or screenshot functionality for now.");
  };

  const downloadAsSVG = () => {
    const svgContent = `
<svg width="400" height="120" viewBox="0 0 400 120" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="silverGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#E5E7EB"/>
      <stop offset="25%" stop-color="#F9FAFB"/>
      <stop offset="50%" stop-color="#D1D5DB"/>
      <stop offset="75%" stop-color="#F3F4F6"/>
      <stop offset="100%" stop-color="#9CA3AF"/>
    </linearGradient>
    <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1E40AF"/>
      <stop offset="50%" stop-color="#3B82F6"/>
      <stop offset="100%" stop-color="#60A5FA"/>
    </linearGradient>
  </defs>
  
  <text x="20" y="70" font-family="Arial, sans-serif" font-size="48" font-weight="400" letter-spacing="3px" fill="url(#silverGradient)">Sapp</text>
  <text x="140" y="70" font-family="Arial, sans-serif" font-size="48" font-weight="400" fill="url(#silverGradient)" transform="rotate(-10 165 70)">h</text>
  <text x="180" y="70" font-family="Arial, sans-serif" font-size="48" font-weight="700" letter-spacing="-1px" fill="url(#blueGradient)">HIRE</text>
</svg>`;

    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sapphhire-logo.svg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("SVG downloaded successfully!");
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
            <h1 className="text-3xl font-bold text-white">Logo Testing</h1>
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
              <CardTitle className="text-white">Sapphhire Wordmark Logo</CardTitle>
              <p className="text-gray-400 text-sm">
                Custom wordmark with metallic silver "Sapp" + arrow "h" + sapphire blue "HIRE"
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Logo Display */}
              <div className="bg-white border border-white/10 rounded-lg p-12 text-center">
                <div 
                  ref={logoRef}
                  className="inline-flex items-baseline font-sans select-none"
                  style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                >
                  {/* Sapp - Metallic Silver with cohesive spacing */}
                  <span 
                    className="text-6xl font-normal"
                    style={{
                      background: 'linear-gradient(135deg, #E5E7EB 0%, #F9FAFB 25%, #D1D5DB 50%, #F3F4F6 75%, #9CA3AF 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      letterSpacing: '-0.01em'
                    }}
                  >
                    Sapp
                  </span>
                  
                  {/* h - Metallic Silver, clean and simple */}
                  <span 
                    className="text-6xl font-normal"
                    style={{
                      background: 'linear-gradient(135deg, #E5E7EB 0%, #F9FAFB 25%, #D1D5DB 50%, #F3F4F6 75%, #9CA3AF 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    }}
                  >
                    h
                  </span>
                  
                  {/* HIRE - Sapphire Blue Gradient, clean typography */}
                  <span 
                    className="text-6xl font-bold"
                    style={{
                      background: 'linear-gradient(135deg, #1E40AF 0%, #3B82F6 50%, #60A5FA 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      letterSpacing: '-0.02em'
                    }}
                  >
                    HIRE
                  </span>
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
                <h3 className="text-white font-semibold mb-3">Design Specifications</h3>
                <ul className="text-gray-300 text-sm space-y-2">
                  <li>• <strong>"Sapp":</strong> Metallic silver gradient, cohesive tight kerning (-0.01em)</li>
                  <li>• <strong>"h":</strong> Clean typography, metallic silver gradient</li>
                  <li>• <strong>"HIRE":</strong> Bold weight, sapphire-to-electric-blue gradient, tight kerning (-0.02em)</li>
                  <li>• <strong>Style:</strong> Premium, minimal, luxury brand feel with clean typography</li>
                  <li>• <strong>Inspiration:</strong> Rolex/Dior elegance + modern tech vibe</li>
                  <li>• <strong>Note:</strong> Arrow elements can be added separately as icons if desired</li>
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