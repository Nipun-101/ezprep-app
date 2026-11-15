import DashboardLayout from '@/components/dashboard/DashboardLayout';
import DashboardExamsContent from '@/components/dashboard/DashboardExamsContent';
import { loadCentralAndStateCategories } from '@/lib/dashboard-categories';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const { central, all } = await loadCentralAndStateCategories();

  return (
    <DashboardLayout>
      <DashboardExamsContent
        categories={central}
        targetLookupCategories={all}
      />
    </DashboardLayout>
  );
}
