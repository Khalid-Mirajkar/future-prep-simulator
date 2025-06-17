
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { useCVAnalysis } from '@/hooks/useCVAnalysis';

interface CVAnalysisFormProps {
  onAnalysisComplete: (result: any) => void;
}

const CVAnalysisForm: React.FC<CVAnalysisFormProps> = ({ onAnalysisComplete }) => {
  const [formData, setFormData] = useState({
    industry: '',
    jobTitle: '',
    company: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  
  const { analyzeCV, isAnalyzing } = useCVAnalysis();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFileError(null);
    
    if (!file) {
      setSelectedFile(null);
      return;
    }

    // Validate file type
    if (file.type !== 'application/pdf') {
      setFileError('Please upload a PDF file only.');
      setSelectedFile(null);
      return;
    }

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      setFileError('File size must be less than 2MB.');
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      setFileError('Please select a PDF file to upload.');
      return;
    }

    if (!formData.industry || !formData.jobTitle || !formData.company) {
      return;
    }

    try {
      const result = await analyzeCV(
        selectedFile,
        formData.industry,
        formData.jobTitle,
        formData.company
      );
      onAnalysisComplete(result);
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="bg-gradient-to-br from-gray-900 to-black border border-gray-700">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-white flex items-center">
          <FileText className="h-6 w-6 mr-2 text-purple-400" />
          CV Analysis Details
        </CardTitle>
        <CardDescription className="text-gray-400">
          Upload your CV and provide job details for ATS compatibility analysis
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="industry" className="text-white">Field / Industry</Label>
              <Input
                id="industry"
                type="text"
                placeholder="e.g., Computer Science"
                value={formData.industry}
                onChange={(e) => handleInputChange('industry', e.target.value)}
                required
                className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="jobTitle" className="text-white">Job Title</Label>
              <Input
                id="jobTitle"
                type="text"
                placeholder="e.g., Software Engineer"
                value={formData.jobTitle}
                onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                required
                className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company" className="text-white">Desired Company</Label>
              <Input
                id="company"
                type="text"
                placeholder="e.g., Google"
                value={formData.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
                required
                className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cv-upload" className="text-white">Upload CV (PDF only, max 2MB)</Label>
            <div className="relative">
              <Input
                id="cv-upload"
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="bg-gray-800 border-gray-600 text-white file:bg-purple-600 file:text-white file:border-0 file:rounded-md file:px-4 file:py-2"
              />
              <Upload className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
            {selectedFile && (
              <p className="text-sm text-green-400">
                ✓ {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
              </p>
            )}
            {fileError && (
              <p className="text-sm text-red-400 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {fileError}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isAnalyzing || !selectedFile}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
          >
            {isAnalyzing ? (
              <>
                <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin mr-2" />
                Analyzing CV...
              </>
            ) : (
              'Analyze CV'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CVAnalysisForm;
