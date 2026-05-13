import apiClient from '@/lib/api/client';

export interface SearchCategoryDTO {
  id: string;
  name: string;
  shortName?: string;
  imageUrl?: string;
  description?: string;
}

export interface SearchExamDTO {
  id: string;
  name: string;
  description?: string;
  category?: {
    id?: string;
    name?: string;
    shortName?: string;
  };
  examGroup?: { id?: string };
  duration?: number;
  totalQuestions?: number;
  totalMarks?: number;
}

export interface GlobalSearchData {
  categories: SearchCategoryDTO[];
  exams: SearchExamDTO[];
}

export interface GlobalSearchResponse {
  message?: string;
  data: GlobalSearchData;
  meta?: {
    query: string;
    categoriesCount: number;
    examsCount: number;
  };
}

function isValidEntityId(id: string | undefined): id is string {
  return Boolean(id && id !== 'undefined');
}

export async function searchGlobal(trimmedQuery: string): Promise<GlobalSearchData> {
  const q = trimmedQuery.trim();
  if (!q) {
    return { categories: [], exams: [] };
  }
  const response = await apiClient.get<GlobalSearchResponse>('/api/v1/search', {
    params: { q },
  });
  const data = response.data?.data;
  if (!data) {
    return { categories: [], exams: [] };
  }
  return {
    categories: (data.categories ?? []).filter((c) => isValidEntityId(c.id)),
    exams: (data.exams ?? []).filter((e) => isValidEntityId(e.id)),
  };
}
