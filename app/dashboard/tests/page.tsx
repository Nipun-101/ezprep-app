'use client';

import DashboardLayout from '@/components/dashboard/DashboardLayout';
import ComingSoon from '@/components/dashboard/ComingSoon';
import { FileText } from 'lucide-react';

export default function TestsPage() {
  return (
    <DashboardLayout>
      <ComingSoon
        icon={FileText}
        title="Tests"
        description="Practice tests and mock exams to boost your preparation"
      />
    </DashboardLayout>
  );
}
