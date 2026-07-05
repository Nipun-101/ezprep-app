import DashboardLayout from '@/components/dashboard/DashboardLayout';
import DashboardExamsContent from '@/components/dashboard/DashboardExamsContent';
import { getExamsByCategory } from '@/lib/api/exams';

export const revalidate = 86400;

export default async function DashboardPage() {
  const categories = await getExamsByCategory().catch(() => []);

  return (
    <DashboardLayout>
      <DashboardExamsContent categories={categories} />
    </DashboardLayout>
  );
}
