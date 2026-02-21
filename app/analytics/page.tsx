'use client';

import DashboardLayout from '@/components/dashboard/DashboardLayout';
import AIAnalyticsDashboard from '@/components/analytics/AIAnalyticsDashboard';

export default function AnalyticsPage() {
  return (
    <DashboardLayout>
      <AIAnalyticsDashboard />
    </DashboardLayout>
  );
}
