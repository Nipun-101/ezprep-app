'use client';

import DashboardLayout from '@/components/dashboard/DashboardLayout';
import ComingSoon from '@/components/dashboard/ComingSoon';
import { Zap } from 'lucide-react';

export default function CurrentAffairsPage() {
  return (
    <DashboardLayout>
      <ComingSoon
        icon={Zap}
        title="Current Affairs"
        description="Stay updated with the latest news and current affairs"
      />
    </DashboardLayout>
  );
}
