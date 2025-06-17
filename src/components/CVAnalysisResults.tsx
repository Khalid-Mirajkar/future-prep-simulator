
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  FileText, 
  Download,
  Target,
  AlertCircle,
  Lightbulb,
  Copy,
  Brain,
  Wrench
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CVAnalysisResultsProps {
  analysis: {
    atsScore: number;
    relevanceScore: number;
    missingKeywords: string[];
    missingSkills?: string[];
    redFlags: string[];
    suggestions: string[];
    revisedSummary: string;
    overallFeedback: string;
    wordCount?: number;
    isShortCV?: boolean;
  };
  onStartNew: () => void;
}

const CVAnalysisResults: React.FC<CVAnalysisResultsProps> = ({ analysis, onStartNew }) => {
  const { toast } = useToast();
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreStatus = (score: number) => {
    if (score >= 80) return { icon: CheckCircle, text: 'Excellent', color: 'text-green-400' };
    if (score >= 60) return { icon: AlertTriangle, text: 'Good', color: 'text-yellow-400' };
    return { icon: XCircle, text: 'Needs Improvement', color: 'text-red-400' };
  };

  const atsStatus = getScoreStatus(analysis.atsScore);
  const relevanceStatus = getScoreStatus(analysis.relevanceScore);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  const generatePDFReport = () => {
    toast({
      title: "Coming Soon",
      description: "PDF download feature will be available in the next update",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header with Short CV Warning */}
      <Card className="bg-gradient-to-br from-gray-900 to-black border border-gray-700">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-white flex items-center">
            <FileText className="h-6 w-6 mr-2 text-purple-400" />
            CV Analysis Results
            {analysis.isShortCV && (
              <Badge variant="outline" className="ml-3 border-yellow-500/50 text-yellow-300 bg-yellow-500/10">
                Short CV Detected
              </Badge>
            )}
          </CardTitle>
          <CardDescription className="text-gray-400">
            {analysis.isShortCV 
              ? `Your CV contains ${analysis.wordCount} words. Consider adding more content for a comprehensive analysis.`
              : "Your CV has been processed securely and deleted from our servers"
            }
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Score Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-gray-900 to-black border border-gray-700">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg text-white flex items-center">
              <Target className="h-5 w-5 mr-2 text-purple-400" />
              ATS Compatibility Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className={`text-4xl font-bold ${getScoreColor(analysis.atsScore)}`}>
                {analysis.atsScore}/100
              </div>
              <div className={`flex items-center ${atsStatus.color}`}>
                <atsStatus.icon className="h-5 w-5 mr-1" />
                <span className="font-semibold">{atsStatus.text}</span>
              </div>
            </div>
            <Progress value={analysis.atsScore} className="h-3 bg-gray-700" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gray-900 to-black border border-gray-700">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg text-white flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-blue-400" />
              Job Relevance Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className={`text-4xl font-bold ${getScoreColor(analysis.relevanceScore)}`}>
                {analysis.relevanceScore}/100
              </div>
              <div className={`flex items-center ${relevanceStatus.color}`}>
                <relevanceStatus.icon className="h-5 w-5 mr-1" />
                <span className="font-semibold">{relevanceStatus.text}</span>
              </div>
            </div>
            <Progress value={analysis.relevanceScore} className="h-3 bg-gray-700" />
          </CardContent>
        </Card>
      </div>

      {/* Missing Keywords */}
      {analysis.missingKeywords && analysis.missingKeywords.length > 0 && (
        <Card className="bg-gradient-to-br from-gray-900 to-black border border-yellow-500/30">
          <CardHeader>
            <CardTitle className="text-lg text-white flex items-center">
              <Brain className="h-5 w-5 mr-2 text-yellow-400" />
              Recommended Keywords
            </CardTitle>
            <CardDescription className="text-gray-400">
              Add these industry-specific keywords to improve ATS compatibility
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {analysis.missingKeywords.map((keyword, index) => (
                <Badge key={index} variant="outline" className="border-yellow-500/50 text-yellow-300 bg-yellow-500/10">
                  {keyword}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Missing Skills */}
      {analysis.missingSkills && analysis.missingSkills.length > 0 && (
        <Card className="bg-gradient-to-br from-gray-900 to-black border border-blue-500/30">
          <CardHeader>
            <CardTitle className="text-lg text-white flex items-center">
              <Wrench className="h-5 w-5 mr-2 text-blue-400" />
              Recommended Skills
            </CardTitle>
            <CardDescription className="text-gray-400">
              Essential skills that would strengthen your profile for this role
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {analysis.missingSkills.map((skill, index) => (
                <Badge key={index} variant="outline" className="border-blue-500/50 text-blue-300 bg-blue-500/10">
                  {skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Red Flags */}
      {analysis.redFlags && analysis.redFlags.length > 0 && (
        <Card className="bg-gradient-to-br from-gray-900 to-black border border-red-500/30">
          <CardHeader>
            <CardTitle className="text-lg text-white flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 text-red-400" />
              Issues to Address
            </CardTitle>
            <CardDescription className="text-gray-400">
              Critical issues that may impact your CV's performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {analysis.redFlags.map((flag, index) => (
                <li key={index} className="flex items-start text-red-300">
                  <XCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                  {flag}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Improvement Suggestions */}
      {analysis.suggestions && analysis.suggestions.length > 0 && (
        <Card className="bg-gradient-to-br from-gray-900 to-black border border-green-500/30">
          <CardHeader>
            <CardTitle className="text-lg text-white flex items-center">
              <Lightbulb className="h-5 w-5 mr-2 text-green-400" />
              Actionable Improvements
            </CardTitle>
            <CardDescription className="text-gray-400">
              Follow these steps to move your scores closer to 90+/100
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {analysis.suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start text-green-300">
                  <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                  {suggestion}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* AI-Generated Summary */}
      {analysis.revisedSummary && (
        <Card className="bg-gradient-to-br from-gray-900 to-black border border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-lg text-white flex items-center justify-between">
              <div className="flex items-center">
                <FileText className="h-5 w-5 mr-2 text-purple-400" />
                AI-Generated Resume Summary
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(analysis.revisedSummary, "Resume summary")}
                className="text-purple-400 border-purple-500/50 hover:bg-purple-500/10"
              >
                <Copy className="h-4 w-4 mr-1" />
                Copy
              </Button>
            </CardTitle>
            <CardDescription className="text-gray-400">
              Professional summary tailored for your target role
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
              <p className="text-purple-100 leading-relaxed">
                {analysis.revisedSummary}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Overall Feedback */}
      {analysis.overallFeedback && (
        <Card className="bg-gradient-to-br from-gray-900 to-black border border-gray-600">
          <CardHeader>
            <CardTitle className="text-lg text-white">Overall Assessment</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300 leading-relaxed">{analysis.overallFeedback}</p>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          onClick={onStartNew}
          className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
        >
          Analyze Another CV
        </Button>
        <Button
          onClick={generatePDFReport}
          variant="outline"
          className="flex-1 border-gray-600 text-white hover:bg-gray-800"
        >
          <Download className="h-4 w-4 mr-2" />
          Download Report (Coming Soon)
        </Button>
      </div>
    </div>
  );
};

export default CVAnalysisResults;
