export type PaperType = 'TOPIC_WISE' | 'FULL_EXAM' | 'SPRINT';

/** Where a finished or paused attempt should return inside an exam. */
export function examTestListPath(
  examId: string,
  paperType?: PaperType | string | null,
  options?: { treatMissingAsFullMock?: boolean }
): string {
  if (paperType === 'SPRINT') {
    return `/dashboard/exam/${examId}/sprint-tests`;
  }
  if (paperType === 'FULL_EXAM' || (!paperType && options?.treatMissingAsFullMock)) {
    return `/dashboard/exam/${examId}/full-mocks`;
  }
  return `/dashboard/exam/${examId}/practice`;
}

export function examTestExitLabel(
  paperType?: PaperType | string | null,
  treatMissingAsFullMock = false
): string {
  if (paperType === 'SPRINT') return 'Exit to Sprint Tests';
  if (paperType === 'FULL_EXAM' || (!paperType && treatMissingAsFullMock)) {
    return 'Exit to Full Mocks';
  }
  return 'Exit to Practice';
}
