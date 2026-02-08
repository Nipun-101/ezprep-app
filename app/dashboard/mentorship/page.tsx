'use client';

import DashboardLayout from '@/components/dashboard/DashboardLayout';
import ComingSoon from '@/components/dashboard/ComingSoon';
import { Users } from 'lucide-react';

export default function MentorshipPage() {
  return (
    <DashboardLayout>
      <ComingSoon
        icon={Users}
        title="Personalised Mentorship"
        description="One-on-one guidance from expert mentors"
      />
    </DashboardLayout>
  );
}
