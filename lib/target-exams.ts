import { type ApiExamCategory } from '@/lib/api/exams';

/** Stable category sort: categories that contain earlier targets rise first. */
export function orderCategoriesByTargets(
  categories: ApiExamCategory[],
  targetIds: string[]
): ApiExamCategory[] {
  if (targetIds.length === 0) return categories;
  const rank = new Map(targetIds.map((id, index) => [id, index]));
  return categories
    .map((category, index) => {
      let best = Number.POSITIVE_INFINITY;
      for (const exam of category.exams) {
        const position = rank.get(exam.id);
        if (position !== undefined && position < best) best = position;
      }
      return { category, index, best };
    })
    .sort((left, right) => {
      if (left.best !== right.best) return left.best - right.best;
      return left.index - right.index;
    })
    .map((entry) => entry.category);
}

export function findExamInCategories(categories: ApiExamCategory[], examId: string) {
  for (const category of categories) {
    const exam = category.exams.find((item) => item.id === examId);
    if (exam) return { exam, category };
  }
  return null;
}
