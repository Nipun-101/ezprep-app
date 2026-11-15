import {
  getExamsByCategory,
  type ApiExamCategory,
} from '@/lib/api/exams';

/** Hardcoded default until a user-state resolver exists. */
export const DEFAULT_STATE_PSC_CODE = 'KL';

export async function loadCentralAndStateCategories(stateCode = DEFAULT_STATE_PSC_CODE): Promise<{
  central: ApiExamCategory[];
  state: ApiExamCategory[];
  all: ApiExamCategory[];
}> {
  const [central, state] = await Promise.all([
    getExamsByCategory().catch(() => [] as ApiExamCategory[]),
    getExamsByCategory({ scope: 'state', stateCode }).catch(
      () => [] as ApiExamCategory[]
    ),
  ]);

  return {
    central,
    state,
    all: [...central, ...state],
  };
}
