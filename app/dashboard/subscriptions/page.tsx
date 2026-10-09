'use client';

import DashboardLayout from '@/components/dashboard/DashboardLayout';
import SubscriptionsClient from '@/components/subscriptions/SubscriptionsClient';

export default function SubscriptionsPage() {
  return (
    <DashboardLayout>
      <SubscriptionsClient />
    </DashboardLayout>
  );
}
