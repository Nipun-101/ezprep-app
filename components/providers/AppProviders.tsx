'use client';

import { type ReactNode } from 'react';
import { TargetExamsProvider } from '@/components/providers/TargetExamsProvider';

export default function AppProviders({ children }: { children: ReactNode }) {
  return <TargetExamsProvider>{children}</TargetExamsProvider>;
}
