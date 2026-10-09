'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { CreditCard } from 'lucide-react';

function CheckoutShell() {
  const params = useSearchParams();
  const offerId = params.get('offerId')?.trim() || '';

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-lg rounded-xl border border-gray-200 bg-white p-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-teal-50 text-teal-600">
          <CreditCard className="h-7 w-7" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Checkout enabling soon</h1>
        <p className="mt-2 text-sm text-gray-600">
          Payment is not available yet. Free tests still start from the exam tabs.
        </p>
        {offerId ? (
          <p className="mt-4 break-all text-sm text-gray-500">Selected offer: {offerId}</p>
        ) : (
          <p className="mt-4 text-sm text-gray-500">
            Choose a plan from View plans to continue.
          </p>
        )}
      </div>
    </DashboardLayout>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-600 border-t-transparent" />
        </div>
      }
    >
      <CheckoutShell />
    </Suspense>
  );
}
