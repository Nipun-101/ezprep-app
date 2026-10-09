'use client';

import { Suspense } from 'react';
import CheckoutClient from '@/components/checkout/CheckoutClient';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

export default function CheckoutPage() {
  return (
    <DashboardLayout>
      <Suspense
        fallback={
          <div className="flex min-h-[40vh] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-600 border-t-transparent" />
          </div>
        }
      >
        <CheckoutClient />
      </Suspense>
    </DashboardLayout>
  );
}
