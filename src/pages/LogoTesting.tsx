import React, { useState } from "react";
import { ArrowLeft, Download, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import PageTransition from "@/components/PageTransition";

const LogoTesting = () => {
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  const generateLogo = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-logo', {
        body: { 
          prompt: `Create a premium wordmark logo for "Sapphhire":
          - "Sapp" in metallic silver gradient (brushed steel effect), wider letter spacing
          - The "h" should be subtly modified to include an upward arrow at 10° angle (growth/progress), similar subtlety to Amazon's smile
          - "HIRE" in bold weight with deep sapphire to electric blue gradient (top to bottom)
          - Premium, minimal, memorable design with luxury brand feel like Rolex/Dior but modern tech vibe
          - Clean white background, high contrast
          - Vector-style, crisp edges, professional typography
          - Ultra high resolution, suitable for branding use` 
        }
      });

      if (error) throw error;

      setLogoUrl(data.imageUrl);
      toast.success("Logo generated successfully!");
    } catch (error) {
      console.error("Error generating logo:", error);
      toast.error("Failed to generate logo. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadLogo = (format: string) => {
    if (!logoUrl) return;
    
    const link = document.createElement('a');
    link.href = logoUrl;
    link.download = `sapphhire-logo.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const convertToSVG = () => {
    toast.info("SVG conversion would require additional processing. PNG download available for now.");
    downloadLogo('png');
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

          {/* Logo Generation */}
          <Card className="glass-card border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Sapphhire Logo Generator</CardTitle>
              <p className="text-gray-400 text-sm">
                Generate the custom wordmark logo with metallic silver "Sapp" + arrow "h" + sapphire blue "HIRE"
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Generate Button */}
              <Button
                onClick={generateLogo}
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating Logo...
                  </>
                ) : (
                  "Generate Sapphhire Logo"
                )}
              </Button>

              {/* Logo Display */}
              {logoUrl && (
                <div className="space-y-4">
                  <div className="bg-white/5 border border-white/10 rounded-lg p-8 text-center">
                    <img
                      src={logoUrl}
                      alt="Generated Sapphhire Logo"
                      className="max-w-full max-h-64 mx-auto"
                    />
                  </div>

                  {/* Download Options */}
                  <div className="flex flex-wrap gap-3">
                    <Button
                      onClick={() => downloadLogo('png')}
                      variant="outline"
                      size="sm"
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download PNG
                    </Button>
                    <Button
                      onClick={convertToSVG}
                      variant="outline"
                      size="sm"
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download as SVG
                    </Button>
                    <Button
                      onClick={() => toast.info("PDF conversion requires SVG first. Use PNG for now.")}
                      variant="outline"
                      size="sm"
                      className="border-white/20 text-gray-400 cursor-not-allowed"
                      disabled
                    >
                      <Download className="w-4 h-4 mr-2" />
                      PDF (Coming Soon)
                    </Button>
                  </div>
                </div>
              )}

              {/* Design Specifications */}
              <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <h3 className="text-white font-semibold mb-3">Design Specifications</h3>
                <ul className="text-gray-300 text-sm space-y-2">
                  <li>• <strong>"Sapp":</strong> Metallic silver gradient, wider kerning</li>
                  <li>• <strong>"h":</strong> Subtle upward arrow at 10° (growth/progress)</li>
                  <li>• <strong>"HIRE":</strong> Bold weight, sapphire-to-electric-blue gradient</li>
                  <li>• <strong>Style:</strong> Premium, minimal, luxury brand feel</li>
                  <li>• <strong>Inspiration:</strong> Rolex/Dior elegance + modern tech vibe</li>
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