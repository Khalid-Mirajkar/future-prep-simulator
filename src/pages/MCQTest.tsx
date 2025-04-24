
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface MCQQuestion {
  id: number;
  question: string;
  options: string[];
}

const dummyQuestions: MCQQuestion[] = [
  {
    id: 1,
    question: "What is the primary responsibility of a software engineer?",
    options: [
      "Writing clean, efficient code",
      "Managing team meetings",
      "Creating marketing materials",
      "Customer support",
    ],
  },
  {
    id: 2,
    question: "Which version control system is most commonly used in modern software development?",
    options: [
      "Git",
      "SVN",
      "Mercurial",
      "CVS",
    ],
  },
];

const MCQTest = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { companyName, jobTitle } = location.state || {};
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});

  const handleOptionSelect = (questionId: number, optionIndex: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const handleNext = () => {
    if (currentQuestion < dummyQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      navigate("/results");
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white py-20">
      <div className="container mx-auto px-6">
        <h1 className="text-4xl font-bold mb-8 text-center">MCQ Interview Practice</h1>
        
        <div className="max-w-2xl mx-auto glass-card p-8 rounded-xl">
          <div className="mb-6">
            <p className="text-gray-400">Company: {companyName}</p>
            <p className="text-gray-400">Position: {jobTitle}</p>
          </div>

          <div className="mb-6">
            <p className="text-lg font-medium mb-4">
              Question {currentQuestion + 1} of {dummyQuestions.length}
            </p>
            <p className="text-xl mb-6">{dummyQuestions[currentQuestion].question}</p>

            <div className="space-y-4">
              {dummyQuestions[currentQuestion].options.map((option, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg cursor-pointer transition-all ${
                    selectedAnswers[dummyQuestions[currentQuestion].id] === index
                      ? "bg-deep-purple text-white"
                      : "bg-gray-800 hover:bg-gray-700"
                  }`}
                  onClick={() => handleOptionSelect(dummyQuestions[currentQuestion].id, index)}
                >
                  {option}
                </div>
              ))}
            </div>
          </div>

          <Button
            onClick={handleNext}
            className="w-full"
            disabled={selectedAnswers[dummyQuestions[currentQuestion].id] === undefined}
          >
            {currentQuestion < dummyQuestions.length - 1 ? "Next Question" : "Finish Test"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MCQTest;
