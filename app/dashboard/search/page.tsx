'use client';

import DashboardLayout from '@/components/dashboard/DashboardLayout';
import ComingSoon from '@/components/dashboard/ComingSoon';
import { Search } from 'lucide-react';

export default function SearchPage() {
  return (
    <DashboardLayout>
      <ComingSoon
        icon={Search}
        title="Search"
        description="Powerful search across courses, videos, and questions"
      />
    </DashboardLayout>
  );
}
