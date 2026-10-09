import apiClient from './client';

export interface ApiExam {
  id: string;
  title: string;
  fullName: string;
  duration: string;
  totalQuestions: number;
  totalMarks: number;
  testsCount: number;
  subjectsCount: number;
  /** Nearby exam or one with a high number of sign-ups. Absent values mean not trending. */
  trending?: boolean;
}

export interface ApiExamCategory {
  id: string;
  name: string;
  shortName: string;
  imageUrl: string;
  description: string;
  exams: ApiExam[];
}

export interface ExamsByCategoryResponse {
  message: string;
  data: ApiExamCategory[];
}

export interface ApiMockTestExam {
  id: string;
  name: string;
  description: string;
}

export interface ApiMockTestSubject {
  id: string;
  name: string;
}

export interface ApiMockTestTopic {
  id: string;
  name: string;
}

export type UserAttemptAction = 'START' | 'RETAKE' | 'RESUME';

export type AccessMode = 'FREE' | 'ENTITLED';

/** Backend-computed access. Missing means the client does not lock the paper. */
export interface PaperAccess {
  allowed: boolean;
  reason: string;
}

export interface ApiMockTest {
  id: string;
  title: string | null;
  description: string | null;
  totalQuestions: number;
  durationInMinutes: number;
  exam: ApiMockTestExam;
  subject: ApiMockTestSubject;
  topic: ApiMockTestTopic;
  generationMode: string;
  marksPerQuestion: number;
  negativeMarking: number;
  passingScore: number | null;
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

export interface MockTestsPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface MockTestsByExamResponse {
  message: string;
  data: ApiMockTest[];
  pagination: MockTestsPagination;
}

export async function getExamsByCategory(): Promise<ApiExamCategory[]> {
  const response = await apiClient.get<ExamsByCategoryResponse>('/api/v1/exams/by-category');
  return response.data.data;
}

export interface ApiExamGroup {
  id: string;
  name: string;
  shortName: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApiExamGroupCategory {
  id: string;
  name: string;
  shortName: string;
  imageUrl: string;
  description: string;
  examGroups: ApiExamGroup[];
}

export interface ExamGroupsByCategoryResponse {
  message: string;
  data: ApiExamGroupCategory[];
  count: number;
}

export async function getExamGroupsByCategory(): Promise<ApiExamGroupCategory[]> {
  const response = await apiClient.get<ExamGroupsByCategoryResponse>('/api/v1/exam-groups/by-category');
  return response.data.data;
}

export interface ApiExamSubject {
  subject: string;
  name?: string;
  numberOfQuestions: number;
  marksPerQuestion: number;
  hasNegativeMarking: boolean;
  negativeMarksPerQuestion: number;
  sessionTime?: number;
}

export interface ApiExamDetail {
  id: string;
  name: string;
  description?: string;
  duration?: number;
  totalQuestions?: number;
  totalMarks?: number;
  subjects?: ApiExamSubject[];
  isSessionWise: boolean;
  hasMultiLingualSupport: boolean;
  isActive: boolean;
}

export async function getExamById(examId: string): Promise<ApiExamDetail> {
  const response = await apiClient.get<{ message: string; data: ApiExamDetail }>(
    `/api/v1/exams/${examId}`
  );
  return response.data.data;
}

export interface GetMockTestsByExamParams {
  page?: number;
  limit?: number;
  search?: string;
  subjectId?: string;
}

export async function getMockTestsByExam(
  examId: string,
  params?: GetMockTestsByExamParams
): Promise<MockTestsByExamResponse> {
  const response = await apiClient.get<MockTestsByExamResponse>(
    `/api/v1/mock-tests/exam/${examId}`,
    { params }
  );
  return response.data;
}
