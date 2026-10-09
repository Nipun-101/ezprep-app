import apiClient from './client';

async function readName(path: string, fallback: string): Promise<string> {
  try {
    const response = await apiClient.get<{ data?: { name?: string } }>(path);
    const name = response.data.data?.name?.trim();
    return name || fallback;
  } catch {
    return fallback;
  }
}

async function readTitle(path: string): Promise<string | null> {
  try {
    const response = await apiClient.get<{ data?: { title?: string | null } }>(path);
    const title = response.data.data?.title?.trim();
    return title || null;
  } catch {
    return null;
  }
}

export async function resolveScopeLabel(scopeType: string, scopeId: string): Promise<string> {
  if (scopeType === 'EXAM') {
    return readName(`/api/v1/exams/${scopeId}`, 'Exam');
  }
  if (scopeType === 'EXAM_GROUP') {
    return readName(`/api/v1/exam-groups/${scopeId}`, 'Exam group');
  }
  if (scopeType === 'MOCK_TEST') {
    const titles = await Promise.all([
      readTitle(`/api/v1/mock-tests/${scopeId}`),
      readTitle(`/api/v1/sprint-tests/${scopeId}`),
      readTitle(`/api/v1/full-mock-tests/${scopeId}`),
    ]);
    return titles.find((title): title is string => Boolean(title)) ?? 'Mock test';
  }
  return 'Access';
}
