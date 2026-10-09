import apiClient from './client';
import { UserAttemptAction, MockTestsPagination, AccessMode, PaperAccess } from './exams';

export interface ApiSprintExam {
  id: string;
  name: string;
  description?: string;
}

export interface ApiSprintTest {
  id: string;
  title?: string | null;
  description?: string | null;
  totalQuestions: number;
  durationInMinutes: number;
  exam: ApiSprintExam | null;
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

export interface SprintTestsResponse {
  message: string;
  data: ApiSprintTest[];
  pagination: MockTestsPagination;
}

export async function getSprintTests(params: {
  examId: string;
  page?: number;
  limit?: number;
}): Promise<SprintTestsResponse> {
  const response = await apiClient.get<SprintTestsResponse>('/api/v1/sprint-tests', {
    params,
  });
  return response.data;
}
