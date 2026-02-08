'use client';

import DashboardLayout from '@/components/dashboard/DashboardLayout';
import ComingSoon from '@/components/dashboard/ComingSoon';
import { BookOpen } from 'lucide-react';

export default function CoursesPage() {
  return (
    <DashboardLayout>
      <ComingSoon
        icon={BookOpen}
        title="Courses"
        description="Comprehensive course content and video lectures will be available soon"
      />
    </DashboardLayout>
  );
}
