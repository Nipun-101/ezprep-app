import apiClient from './client';
import { UserAttemptAction, MockTestsPagination, AccessMode, PaperAccess } from './exams';

export interface ApiFullMockSubjectConfig {
  subject: string;
  name: string;
  numberOfQuestions: number;
  marksPerQuestion: number;
  hasNegativeMarking: boolean;
  negativeMarksPerQuestion: number;
  sessionTime?: number;
  questionStartIndex: number;
  questionEndIndex: number;
}

export interface ApiFullMockExam {
  id: string;
  name: string;
  description?: string;
}

export interface ApiFullMockTest {
  id: string;
  title?: string | null;
  description?: string | null;
  totalQuestions: number;
  durationInMinutes: number;
  totalMarks?: number;
  isSessionWise: boolean;
  exam: ApiFullMockExam | null;
  subjectConfig: ApiFullMockSubjectConfig[];
  marksPerQuestion: number;
  negativeMarking: number;
  passingScore?: number | null;
  allowRetake: boolean;
  shuffleOptions: boolean;
  showResultsImmediately: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  accessMode?: AccessMode;
  access?: PaperAccess;
  userAttemptAction: UserAttemptAction;
  resumeAttemptId?: string;
}

export interface FullMockTestsResponse {
  message: string;
  data: ApiFullMockTest[];
  pagination: MockTestsPagination;
}

export async function getFullMockTests(params: {
  examId?: string;
  page?: number;
  limit?: number;
}): Promise<FullMockTestsResponse> {
  const response = await apiClient.get<FullMockTestsResponse>('/api/v1/full-mock-tests', {
    params,
  });
  return response.data;
}
