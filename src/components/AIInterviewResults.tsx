
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { Clock, Star, TrendingUp, TrendingDown } from 'lucide-react';

interface InterviewResponse {
  questionId: number;
  question: string;
  answer: string;
  score: number;
  evaluation: string;
  timeSpent: number;
}

interface AIInterviewResultsProps {
  responses: InterviewResponse[];
  totalTime: number;
  companyName: string;
  jobTitle: string;
}

const AIInterviewResults: React.FC<AIInterviewResultsProps> = ({
  responses,
  totalTime,
  companyName,
  jobTitle
}) => {
  const navigate = useNavigate();
  
  const averageScore = responses.reduce((sum, response) => sum + response.score, 0) / responses.length;
  const totalTimeMinutes = Math.floor(totalTime / 60);
  const totalTimeSeconds = totalTime % 60;
  
  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-500';
    if (score >= 6) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getPerformanceLevel = (score: number) => {
    if (score >= 8) return { level: 'Excellent', color: 'bg-green-500' };
    if (score >= 6) return { level: 'Good', color: 'bg-yellow-500' };
    if (score >= 4) return { level: 'Fair', color: 'bg-orange-500' };
    return { level: 'Needs Improvement', color: 'bg-red-500' };
  };

  const performance = getPerformanceLevel(averageScore);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 text-transparent bg-clip-text">
          Interview Complete!
        </h1>
        <p className="text-gray-400">
          {jobTitle} at {companyName}
        </p>
      </div>

      {/* Overall Score Card */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Overall Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <span className="text-3xl font-bold">{averageScore.toFixed(1)}/10</span>
                <Badge className={performance.color}>
                  {performance.level}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {totalTimeMinutes}m {totalTimeSeconds}s
                </div>
                <span>•</span>
                <span>{responses.length} questions answered</span>
              </div>
            </div>
            <div className="text-right">
              <div className="w-20 h-20 rounded-full border-4 border-gray-700 relative">
                <div 
                  className={`absolute inset-0 rounded-full border-4 border-transparent ${performance.color} transition-all duration-1000`}
                  style={{
                    borderTopColor: performance.color.replace('bg-', ''),
                    transform: `rotate(${(averageScore / 10) * 360}deg)`
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold">{Math.round((averageScore / 10) * 100)}%</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Question Breakdown */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle>Question Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {responses.map((response, index) => (
            <div key={response.questionId} className="border border-gray-700 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-purple-400">
                      Question {index + 1}
                    </span>
                    <span className="text-xs text-gray-500">
                      {Math.floor(response.timeSpent / 60)}m {response.timeSpent % 60}s
                    </span>
                  </div>
                  <p className="text-sm text-gray-300 mb-2">{response.question}</p>
                </div>
                <div className="text-right">
                  <span className={`text-xl font-bold ${getScoreColor(response.score)}`}>
                    {response.score}/10
                  </span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Your Answer:</span>
                  <p className="text-sm text-gray-300 mt-1 bg-gray-800 p-3 rounded">
                    {response.answer}
                  </p>
                </div>
                
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Feedback:</span>
                  <p className="text-sm text-gray-300 mt-1">
                    {response.evaluation}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-green-400 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Strengths
              </h4>
              <ul className="text-sm text-gray-300 space-y-1">
                {averageScore >= 7 && <li>• Strong communication skills</li>}
                {responses.some(r => r.score >= 8) && <li>• Excellent responses to challenging questions</li>}
                <li>• Good engagement throughout the interview</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold text-orange-400 flex items-center gap-2">
                <TrendingDown className="h-4 w-4" />
                Areas for Improvement
              </h4>
              <ul className="text-sm text-gray-300 space-y-1">
                {averageScore < 6 && <li>• Provide more detailed examples</li>}
                {responses.some(r => r.timeSpent > 180) && <li>• Keep answers more concise</li>}
                <li>• Practice with more behavioral questions</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-center gap-4">
        <Button 
          variant="outline"
          onClick={() => navigate('/start-practice')}
          className="border-gray-600 hover:bg-gray-800"
        >
          Take Another Interview
        </Button>
        <Button 
          onClick={() => navigate('/dashboard')}
          className="bg-purple-600 hover:bg-purple-700"
        >
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
};

export default AIInterviewResults;
