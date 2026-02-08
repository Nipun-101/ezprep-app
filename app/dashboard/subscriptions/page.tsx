'use client';

import DashboardLayout from '@/components/dashboard/DashboardLayout';
import ComingSoon from '@/components/dashboard/ComingSoon';
import { CreditCard } from 'lucide-react';

export default function SubscriptionsPage() {
  return (
    <DashboardLayout>
      <ComingSoon
        icon={CreditCard}
        title="My Subscriptions"
        description="Manage your active subscriptions and billing"
      />
    </DashboardLayout>
  );
}
