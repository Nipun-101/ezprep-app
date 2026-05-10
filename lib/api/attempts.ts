import apiClient from './client';

export interface AttemptQuestionTextEntry {
  text: string;
  imageUrl: string | null;
}

export interface AttemptQuestionText {
  en: AttemptQuestionTextEntry;
  ml: AttemptQuestionTextEntry;
}

export interface AttemptQuestionOption {
  id: string;
  type: 'text' | 'image';
  en: string;
  ml: string;
  imageUrl: string | null;
}

export interface AttemptQuestion {
  _id: string;
  questionText: AttemptQuestionText;
  optionType: 'text' | 'image';
  options: AttemptQuestionOption[];
  subject: string;
  topic: string;
  difficultyLevel: 'easy' | 'medium' | 'hard';
}

export interface AttemptExamRef {
  id: string;
  name: string;
  description: string;
}

export interface AttemptSubjectRef {
  id: string;
  name: string;
}

export interface AttemptTopicRef {
  id: string;
  name: string;
}

export interface AttemptMockTestData {
  title: string | null;
  durationInMinutes: number;
  totalQuestions: number;
  startedAt: string;
  marksPerQuestion: number;
  negativeMarking: number;
  passingScore: number | null;
  exam: AttemptExamRef;
  subject: AttemptSubjectRef;
  topic: AttemptTopicRef;
}

export interface StartAttemptData {
  attemptId: string;
  mockTestData: AttemptMockTestData;
  questions: AttemptQuestion[];
}

export interface ResumeAttemptData extends StartAttemptData {
  timeElapsed: number;
  timeRemaining: number;
  pauseCount: number;
  timeConsumed: number;
}

export interface PauseAttemptData {
  attemptId: string;
  testTitle: string | null;
  status: 'PAUSED' | string;
  timeConsumed: number;
  timeRemaining: number;
  pausedAt: string;
  pauseCount: number;
}

export interface AttemptAnswerInput {
  questionId: string;
  selectedOptionId: string;
}

export interface SubmittedQuestionResult {
  questionId: string;
  selectedOption: string | null;
  correctAnswer: string;
  isCorrect: boolean;
  marksAwarded: number;
  explanation?: {
    en: string | null;
    ml: string | null;
    imageUrl: string | null;
  };
}

export interface SubmitAttemptResult {
  attemptId: string;
  score: number;
  totalScore: number;
  passingScore: number | null;
  passed: boolean;
  correctAnswers: number;
  incorrectAnswers: number;
  unansweredQuestions: number;
  submittedAt: string;
  timeTaken: number;
  questionResults: SubmittedQuestionResult[];
}

export async function startMockTestAttempt(mockTestId: string): Promise<StartAttemptData> {
  const response = await apiClient.post<{ message: string; data: StartAttemptData }>(
    '/api/v1/mock-test-attempts/start',
    { mockTestId }
  );
  return response.data.data;
}

export async function patchAttemptAnswer(
  attemptId: string,
  questionId: string,
  selectedOptionId: string
): Promise<void> {
  await apiClient.patch(`/api/v1/mock-test-attempts/${attemptId}/answer`, {
    questionId,
    selectedOptionId,
  });
}

export async function pauseAttempt(attemptId: string): Promise<PauseAttemptData> {
  const response = await apiClient.post<{ message: string; data: PauseAttemptData }>(
    `/api/v1/mock-test-attempts/${attemptId}/pause`
  );
  return response.data.data;
}

export async function resumeAttempt(attemptId: string): Promise<ResumeAttemptData> {
  const response = await apiClient.get<{ message: string; data: ResumeAttemptData }>(
    `/api/v1/mock-test-attempts/${attemptId}/resume`
  );
  return response.data.data;
}

export async function submitAttempt(
  attemptId: string,
  answers: AttemptAnswerInput[]
): Promise<SubmitAttemptResult> {
  const response = await apiClient.post<SubmitAttemptResult | { message: string; data: SubmitAttemptResult }>(
    `/api/v1/mock-test-attempts/${attemptId}/submit`,
    { answers }
  );
  // Handle both wrapped and unwrapped responses
  const body = response.data as any;
  return body?.data ?? body;
}
