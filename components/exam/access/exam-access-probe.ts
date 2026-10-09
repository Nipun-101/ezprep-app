import { getMockTestsByExam } from '@/lib/api/exams';
import { getFullMockTests } from '@/lib/api/full-mock-tests';
import { getSprintTests } from '@/lib/api/sprint-tests';
import { isAccessDenied } from './paper-access';

const PAGE_LIMIT = 50;

interface AccessPage {
  data: Array<{ access?: { allowed: boolean } }>;
  pagination?: { totalPages?: number };
}

async function laterPageHasDenial(
  totalPages: number,
  fetchPage: (page: number) => Promise<AccessPage>
): Promise<boolean> {
  for (let page = 2; page <= totalPages; page += 1) {
    const res = await fetchPage(page);
    if ((res.data ?? []).some((paper) => isAccessDenied(paper))) return true;
  }
  return false;
}

/** True when any published paper on the exam is denied for this user. */
export async function examHasDeniedPaper(examId: string): Promise<boolean> {
  const sources: Array<(page: number) => Promise<AccessPage>> = [
    (page) => getMockTestsByExam(examId, { page, limit: PAGE_LIMIT }),
    (page) => getFullMockTests({ examId, page, limit: PAGE_LIMIT }),
    (page) => getSprintTests({ examId, page, limit: PAGE_LIMIT }),
  ];

  const firstPages = await Promise.all(sources.map((fetchPage) => fetchPage(1)));
  if (firstPages.some((page) => (page.data ?? []).some((paper) => isAccessDenied(paper)))) {
    return true;
  }

  for (let i = 0; i < sources.length; i += 1) {
    const totalPages = firstPages[i].pagination?.totalPages ?? 1;
    if (await laterPageHasDenial(totalPages, sources[i])) return true;
  }
  return false;
}
