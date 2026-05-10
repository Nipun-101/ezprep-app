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

export async function getMockTestsByExam(examId: string): Promise<MockTestsByExamResponse> {
  const response = await apiClient.get<MockTestsByExamResponse>(
    `/api/v1/mock-tests/exam/${examId}`
  );
  return response.data;
}
