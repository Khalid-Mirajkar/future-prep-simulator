
import React from 'react';
import { Button } from "@/components/ui/button";
import { RotateCcw, ArrowLeft, Home } from "lucide-react";
import { TestResult } from '@/types/mcq';

interface MCQTestResultsProps {
  testResult: TestResult;
  handleRestartTest: () => void;
  handleTakeAnotherTest: () => void;
  handleBackToHome: () => void;
}

const MCQTestResults: React.FC<MCQTestResultsProps> = ({
  testResult,
  handleRestartTest,
  handleTakeAnotherTest,
  handleBackToHome
}) => {
  return (
    <div className="container mx-auto px-6">
      <h1 className="text-4xl font-bold mb-8 text-center">Test Results</h1>
      
      <div className="max-w-2xl mx-auto glass-card p-8 rounded-xl">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">
            Score: {testResult.score}/{testResult.totalQuestions}
          </h2>
          <div className="h-2 bg-gray-700 rounded-full mb-4">
            <div 
              className="h-full bg-green-500 rounded-full transition-all duration-500"
              style={{ width: `${(testResult.score / testResult.totalQuestions) * 100}%` }}
            />
          </div>
        </div>

        {testResult.incorrectAnswers.length > 0 ? (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold mb-4">Areas for Improvement</h3>
            {testResult.incorrectAnswers.map((answer, index) => (
              <div key={index} className="p-4 bg-gray-800/50 rounded-lg">
                <p className="font-medium mb-2">{answer.question}</p>
                <p className="text-red-400 mb-1">Your answer: {answer.userAnswer}</p>
                <p className="text-green-400 mb-2">Correct answer: {answer.correctAnswer}</p>
                <p className="text-gray-400 text-sm">{answer.explanation}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-green-400">
            Perfect score! You answered all questions correctly.
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <Button 
            onClick={handleRestartTest} 
            className="flex-1"
            variant="default"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Restart Test
          </Button>
          <Button 
            onClick={handleTakeAnotherTest} 
            className="flex-1"
            variant="outline"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Take Another Test
          </Button>
          <Button 
            onClick={handleBackToHome} 
            className="flex-1"
            variant="secondary"
          >
            <Home className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MCQTestResults;
