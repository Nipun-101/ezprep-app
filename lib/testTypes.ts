export interface QuestionText {
  en: {
    text: string;
    image: string | null;
  };
  ml: {
    text: string;
    image: string | null;
  };
}

export interface QuestionOption {
  id: string;
  type: 'text' | 'image';
  en: string;
  ml: string;
  image?: string;
}

export interface Question {
  _id: string;
  questionText: QuestionText;
  optionType: 'text' | 'image';
  options: QuestionOption[];
  explanation: {
    en: string;
    ml: string;
    image: string | null;
  };
  correctAnswer: string;
  subject: string;
  difficultyLevel: 'easy' | 'medium' | 'hard';
}

export interface Test {
  _id: string;
  title: string;
  description: string;
  totalQuestions: number;
  durationInMinutes: number;
  marksPerQuestion: number;
  negativeMarking: number;
  passingScore: number;
  allowRetake: boolean;
  shuffleOptions: boolean;
  showResultsImmediately: boolean;
  questions: Question[];
}

export interface UserAnswer {
  questionId: string;
  selectedOptionId: string | null;
  isMarkedForReview: boolean;
  timeSpent: number;
}

export interface TestSubmission {
  testId: string;
  answers: UserAnswer[];
  totalTimeSpent: number;
  score: number;
  correctAnswers: number;
  wrongAnswers: number;
  unattempted: number;
}

export type QuestionStatus = 'not-visited' | 'answered' | 'not-answered' | 'marked' | 'marked-answered';
