import DashboardLayout from '@/components/dashboard/DashboardLayout';
import DashboardExamsContent from '@/components/dashboard/DashboardExamsContent';
import {
  DEFAULT_STATE_PSC_CODE,
  loadCentralAndStateCategories,
} from '@/lib/dashboard-categories';

export const dynamic = 'force-dynamic';

export default async function StatePscPage() {
  const { state, all } = await loadCentralAndStateCategories(
    DEFAULT_STATE_PSC_CODE
  );

  return (
    <DashboardLayout>
      <DashboardExamsContent
        categories={state}
        targetLookupCategories={all}
        examFrom="state-psc"
      />
    </DashboardLayout>
  );
}
