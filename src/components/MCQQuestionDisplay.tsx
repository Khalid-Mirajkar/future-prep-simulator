
import React from 'react';
import { Button } from "@/components/ui/button";
import { MCQQuestion } from '@/types/mcq';
import TimerProgressBar from '@/components/TimerProgressBar';

interface MCQQuestionDisplayProps {
  questions: MCQQuestion[];
  currentQuestion: number;
  selectedAnswers: Record<number, number>;
  handleOptionSelect: (questionId: number, optionIndex: number) => void;
  setCurrentQuestion: React.Dispatch<React.SetStateAction<number>>;
  evaluateTest: () => void;
  initialSeconds: number;
  remainingSeconds: number;
}

const MCQQuestionDisplay: React.FC<MCQQuestionDisplayProps> = ({
  questions,
  currentQuestion,
  selectedAnswers,
  handleOptionSelect,
  setCurrentQuestion,
  evaluateTest,
  initialSeconds,
  remainingSeconds
}) => {
  return (
    <div className="max-w-2xl mx-auto glass-card p-8 rounded-xl">
      <TimerProgressBar 
        initialSeconds={initialSeconds} 
        remainingSeconds={remainingSeconds} 
      />

      <div className="mb-6">
        <p className="text-lg font-medium mb-4">
          Question {currentQuestion + 1} of {questions.length}
        </p>
        <p className="text-xl mb-6">{questions[currentQuestion]?.question}</p>

        <div className="space-y-4">
          {questions[currentQuestion]?.options.map((option, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg cursor-pointer transition-all ${
                selectedAnswers[questions[currentQuestion].id] === index
                  ? "bg-deep-purple text-white"
                  : "bg-gray-800 hover:bg-gray-700"
              }`}
              onClick={() => handleOptionSelect(questions[currentQuestion].id, index)}
            >
              {option}
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between gap-4">
        <Button
          onClick={() => setCurrentQuestion(prev => prev - 1)}
          disabled={currentQuestion === 0}
          variant="outline"
          className="w-1/2"
        >
          Previous
        </Button>
        
        {currentQuestion < questions.length - 1 ? (
          <Button
            onClick={() => setCurrentQuestion(prev => prev + 1)}
            disabled={selectedAnswers[questions[currentQuestion]?.id] === undefined}
            className="w-1/2"
          >
            Next Question
          </Button>
        ) : (
          <Button
            onClick={evaluateTest}
            disabled={Object.keys(selectedAnswers).length !== questions.length}
            className="w-1/2"
          >
            Submit Test
          </Button>
        )}
      </div>
    </div>
  );
};

export default MCQQuestionDisplay;
