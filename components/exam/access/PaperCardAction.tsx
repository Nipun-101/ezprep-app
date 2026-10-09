'use client';

import { useState } from 'react';
import { Lock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ViewPlansDialog from './ViewPlansDialog';

interface PaperCardActionProps {
  testId: string;
  blocked: boolean;
  disabled?: boolean;
  isActing?: boolean;
  onAction?: () => void;
  label: string;
  loadingLabel: string;
  className: string;
  Icon: React.ElementType;
  buttonClassName?: string;
}

export default function PaperCardAction({
  testId,
  blocked,
  disabled = false,
  isActing = false,
  onAction,
  label,
  loadingLabel,
  className,
  Icon,
  buttonClassName = '',
}: PaperCardActionProps) {
  const [open, setOpen] = useState(false);

  if (blocked) {
    return (
      <div className={`w-full ${buttonClassName}`}>
        <Button
          type="button"
          disabled={disabled}
          onClick={() => setOpen(true)}
          className="w-full border border-gray-200 bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-800 disabled:opacity-100"
        >
          <Lock className="mr-2 h-4 w-4" />
          View plans
        </Button>
        <ViewPlansDialog
          open={open}
          onOpenChange={setOpen}
          target={{ kind: 'mockTest', mockTestId: testId }}
        />
      </div>
    );
  }

  return (
    <Button
      type="button"
      onClick={onAction}
      disabled={disabled || isActing}
      className={`w-full disabled:opacity-100 ${buttonClassName} ${className}`}
    >
      {isActing ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {loadingLabel}
        </>
      ) : (
        <>
          <Icon className="mr-2 h-4 w-4" />
          {label}
        </>
      )}
    </Button>
  );
}
