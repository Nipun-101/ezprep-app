'use client';

import { useState } from 'react';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LaunchError } from '@/components/exam/useLaunchAttempt';
import ViewPlansDialog from './ViewPlansDialog';

interface AccessErrorBannerProps {
  error: LaunchError | null;
}

export default function AccessErrorBanner({ error }: AccessErrorBannerProps) {
  const [open, setOpen] = useState(false);
  if (!error) return null;

  const showPlans = error.code === 'ENTITLEMENT_REQUIRED' && Boolean(error.testId);

  return (
    <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
      <p>{error.message}</p>
      {showPlans && error.testId ? (
        <div className="mt-3">
          <Button
            type="button"
            className="bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-800 border border-gray-200"
            onClick={() => setOpen(true)}
          >
            <Lock className="mr-2 h-4 w-4" />
            View plans
          </Button>
          <ViewPlansDialog
            open={open}
            onOpenChange={setOpen}
            target={{ kind: 'mockTest', mockTestId: error.testId }}
          />
        </div>
      ) : null}
    </div>
  );
}
