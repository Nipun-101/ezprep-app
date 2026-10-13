import DashboardLayout from '@/components/dashboard/DashboardLayout';
import DashboardExamsContent from '@/components/dashboard/DashboardExamsContent';
import { getExamsByCategory } from '@/lib/api/exams';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const categories = await getExamsByCategory().catch(() => []);

  return (
    <DashboardLayout>
      <DashboardExamsContent categories={categories} />
    </DashboardLayout>
  );
}
