
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TestResult } from '@/types/mcq';
import { Clock, ArrowLeft, ThumbsUp, Clipboard, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";

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
  const scorePercentage = (testResult.score / testResult.totalQuestions) * 100;
  const passThreshold = 70;
  const hasPassed = scorePercentage >= passThreshold;
  
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <div className="container mx-auto px-4 max-w-3xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-black/30 border-white/10 mb-8">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl md:text-3xl">
              {hasPassed ? (
                <span className="text-green-500">Congratulations!</span>
              ) : (
                <span className="text-orange-500">Practice Makes Perfect</span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row justify-center items-center gap-6 py-4">
              <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 border border-purple-500/20 rounded-xl p-6 text-center w-full md:w-auto">
                <div className="text-4xl font-bold mb-2">
                  {scorePercentage.toFixed(1)}%
                </div>
                <div className="text-gray-400">
                  {testResult.score}/{testResult.totalQuestions} Correct
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-blue-900/30 to-black/30 border border-blue-500/20 rounded-xl p-6 text-center w-full md:w-auto">
                <div className="text-3xl font-bold mb-2 flex items-center justify-center">
                  <Clock className="h-5 w-5 mr-2 text-blue-400" />
                  {formatTime(testResult.timeInSeconds)}
                </div>
                <div className="text-gray-400">
                  Time Taken
                </div>
              </div>
            </div>

            <div className="mt-6 text-center">
              {hasPassed ? (
                <div className="flex items-center justify-center mb-6 text-green-500">
                  <ThumbsUp className="h-6 w-6 mr-2" />
                  <span className="text-lg">
                    Great job! You scored above the {passThreshold}% passing threshold.
                  </span>
                </div>
              ) : (
                <div className="flex items-center justify-center mb-6 text-orange-500">
                  <Clipboard className="h-6 w-6 mr-2" />
                  <span className="text-lg">
                    Keep practicing. {passThreshold}% is considered a passing score.
                  </span>
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-4">
                <Button onClick={handleRestartTest} variant="outline" className="gap-2">
                  <RotateCcw className="h-4 w-4" />
                  Try Again
                </Button>
                <Button onClick={handleTakeAnotherTest} className="gap-2">
                  <Clipboard className="h-4 w-4" />
                  New Practice Test
                </Button>
                <Button onClick={handleBackToHome} variant="secondary" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Home
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {testResult.incorrectAnswers.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl mb-4 font-semibold">Review Incorrect Answers:</h2>
            {testResult.incorrectAnswers.map((item, index) => (
              <Card key={item.questionId} className="mb-4 bg-black/30 border-white/10">
                <CardContent className="pt-4">
                  <p className="text-lg mb-3">{item.question}</p>
                  <div className="grid grid-cols-1 gap-2 mb-4">
                    <div className="flex flex-col">
                      <span className="text-gray-400 text-sm">Your answer:</span>
                      <span className="text-red-500">{item.userAnswer}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-400 text-sm">Correct answer:</span>
                      <span className="text-green-500">{item.correctAnswer}</span>
                    </div>
                  </div>
                  {item.explanation && (
                    <div className="mt-2 p-3 bg-gray-800/50 rounded-md">
                      <span className="text-gray-400 text-sm">Explanation:</span>
                      <p>{item.explanation}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default MCQTestResults;
