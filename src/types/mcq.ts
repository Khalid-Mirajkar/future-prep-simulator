
export interface MCQQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

export interface TestResult {
  score: number;
  totalQuestions: number;
  incorrectAnswers: {
    questionId: number;
    question: string;
    userAnswer: string;
    correctAnswer: string;
    explanation: string;
  }[];
}
