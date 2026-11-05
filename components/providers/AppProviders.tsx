'use client';

import { type ReactNode } from 'react';
import { AuthSessionProvider } from '@/components/providers/AuthSessionProvider';
import { TargetExamsProvider } from '@/components/providers/TargetExamsProvider';

export default function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AuthSessionProvider>
      <TargetExamsProvider>{children}</TargetExamsProvider>
    </AuthSessionProvider>
  );
}
