'use client';

import DashboardLayout from '@/components/dashboard/DashboardLayout';
import ComingSoon from '@/components/dashboard/ComingSoon';
import { Award } from 'lucide-react';

export default function SuccessStoriesPage() {
  return (
    <DashboardLayout>
      <ComingSoon
        icon={Award}
        title="Success Stories"
        description="Get inspired by success stories of our students"
      />
    </DashboardLayout>
  );
}
