import apiClient from './client';

export interface CurrentAffairItem {
  id: string;
  title: string;
  /** Bullet points about the event (API may omit when empty). */
  description?: string[];
  memoryTrick?: string;
  date: string;
  imageUrl?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Normalize description from API (string[] preferred; legacy string tolerated).
 */
export function coerceDescriptionPoints(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter(
      (item): item is string => typeof item === 'string' && item.trim().length > 0,
    );
  }
  if (typeof value === 'string' && value.trim()) {
    return [value.trim()];
  }
  return [];
}

export interface CurrentAffairsPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface ListResponse {
  message: string;
  data: CurrentAffairItem[];
  pagination: CurrentAffairsPagination;
}

export async function listCurrentAffairs(params: {
  date?: string;
  page?: number;
  limit?: number;
  search?: string;
  activeOnly?: boolean;
}): Promise<{ data: CurrentAffairItem[]; pagination: CurrentAffairsPagination }> {
  const response = await apiClient.get<ListResponse>('/api/v1/current-affairs', {
    params: {
      page: params.page ?? 1,
      limit: params.limit ?? 100,
      activeOnly: params.activeOnly ?? true,
      ...(params.date ? { date: params.date } : {}),
      ...(params.search ? { search: params.search } : {}),
    },
  });
  return {
    data: response.data.data ?? [],
    pagination: response.data.pagination,
  };
}
