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
  optionType?: 'text' | 'image';
  options: AttemptQuestionOption[];
  subject: string;
  topic?: string;
  difficultyLevel?: 'easy' | 'medium' | 'hard';
  sessionOrder?: number;
  selectedOption?: string | null;
}

export type AttemptSessionStatus =
  | 'LOCKED'
  | 'IN_PROGRESS'
  | 'PAUSED'
  | 'SUBMITTED'
  | 'EXPIRED';

export interface AttemptSession {
  subject: string;
  name?: string;
  order: number;
  durationInMinutes: number;
  startIndex: number;
  endIndex: number;
  questionIds?: string[];
  questionCount?: number;
  status: AttemptSessionStatus | string;
  startedAt?: string;
  submittedAt?: string;
  timeConsumed: number;
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
  subject?: AttemptSubjectRef;
  topic?: AttemptTopicRef;
  isSessionWise?: boolean;
  sessions?: AttemptSession[];
  currentSessionIndex?: number;
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
  sessions?: AttemptSession[];
  currentSessionIndex?: number;
}

export interface PauseAttemptData {
  attemptId: string;
  testTitle: string | null;
  status: 'PAUSED' | string;
  /** Running timer only — the current section on session-wise papers */
  timeConsumed: number;
  /** Whole paper, summed across sections on session-wise papers */
  totalTimeConsumed?: number;
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

export interface CompleteSessionResult {
  paperCompleted: boolean;
  sessions: AttemptSession[];
  currentSessionIndex: number;
  nextSession?: ResumeAttemptData;
  results?: SubmitAttemptResult;
}

export async function completeSession(attemptId: string): Promise<CompleteSessionResult> {
  const response = await apiClient.post<{ message: string; data: CompleteSessionResult }>(
    `/api/v1/mock-test-attempts/${attemptId}/sessions/complete`
  );
  return response.data.data;
}

export interface AttemptDetailsQuestion {
  _id: string;
  questionText: AttemptQuestionText;
  optionType?: 'text' | 'image';
  options: AttemptQuestionOption[];
  subject: string;
  topic?: string;
  sessionOrder?: number;
  selectedOption?: string | null;
  correctAnswer: string;
  isCorrect: boolean;
  marksAwarded: number;
  explanation?: {
    en: string | null;
    ml: string | null;
    imageUrl?: string | null;
  };
}

export interface AttemptDetailsTest extends AttemptMockTestData {
  showResultsImmediately?: boolean;
}

export interface AttemptDetails {
  attemptId: string;
  status: 'SUBMITTED' | 'EXPIRED' | 'PAUSED' | 'IN_PROGRESS' | string;
  test: AttemptDetailsTest;
  questions: AttemptDetailsQuestion[];
  score: number;
  submittedAt: string;
  correctAnswers: number;
  incorrectAnswers: number;
  unansweredQuestions: number;
  isPassed: boolean;
  /** Present while the attempt is in progress or paused */
  timeElapsed?: number;
  timeRemaining?: number;
  /** Present once the attempt is submitted or expired — whole paper, all sections */
  timeTaken?: number;
  isSessionWise?: boolean;
  sessions?: AttemptSession[];
  currentSessionIndex?: number;
}

export async function getMockTestAttempt(attemptId: string): Promise<AttemptDetails> {
  const response = await apiClient.get<{ message: string; data: AttemptDetails }>(
    `/api/v1/mock-test-attempts/${attemptId}`
  );
  return response.data.data;
}

/**
 * Shape the authoritative GET /:attemptId payload like a start/resume payload so
 * the runner can be driven by it. Unlike the resume endpoint this does not
 * unpause the attempt, so a reload keeps a paused test paused.
 */
export function attemptDetailsToRunnerData(details: AttemptDetails): StartAttemptData {
  return {
    attemptId: details.attemptId,
    mockTestData: {
      ...details.test,
      isSessionWise: details.isSessionWise ?? details.test.isSessionWise,
      sessions: details.sessions ?? details.test.sessions,
      currentSessionIndex:
        details.currentSessionIndex ?? details.test.currentSessionIndex,
    },
    questions: details.questions.map((q) => ({
      _id: q._id,
      questionText: q.questionText,
      optionType: q.optionType,
      options: q.options,
      subject: q.subject,
      topic: q.topic,
      sessionOrder: q.sessionOrder,
      selectedOption: q.selectedOption ?? null,
    })),
  };
}
