'use client';

import { Clock, HelpCircle, BookMarked, Minus, Play, RotateCcw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { UserAttemptAction } from '@/lib/api/exams';
import { ApiSprintTest } from '@/lib/api/sprint-tests';
import LockedTestBadge from './access/LockedTestBadge';
import PaperCardAction from './access/PaperCardAction';
import { isStartBlocked } from './access/paper-access';

interface SprintTestCardProps {
  test: ApiSprintTest;
  onAction?: () => void;
  isActing?: boolean;
  disabled?: boolean;
}

const ACTION_CONFIG: Record<
  UserAttemptAction,
  { label: string; loadingLabel: string; className: string; Icon: React.ElementType }
> = {
  START: {
    label: 'Start Sprint',
    loadingLabel: 'Starting...',
    className: 'bg-teal-500 hover:bg-teal-600 text-white',
    Icon: Play,
  },
  RETAKE: {
    label: 'Retake',
    loadingLabel: 'Starting...',
    className: 'bg-amber-500 hover:bg-amber-600 text-white',
    Icon: RotateCcw,
  },
  RESUME: {
    label: 'Resume',
    loadingLabel: 'Resuming...',
    className: 'bg-blue-500 hover:bg-blue-600 text-white',
    Icon: Play,
  },
};

export default function SprintTestCard({
  test,
  onAction,
  isActing = false,
  disabled = false,
}: SprintTestCardProps) {
  const displayTitle = test.title?.trim() || test.exam?.name || 'Sprint Test';
  const negativeMarking = test.negativeMarking > 0;
  const action = test.userAttemptAction ?? 'START';
  const { label, loadingLabel, className, Icon } = ACTION_CONFIG[action];
  const blocked = isStartBlocked(test);

  return (
    <div
      className={`flex h-full flex-col bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-all ${
        disabled ? 'opacity-50 pointer-events-none' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2">
            <h3 className="min-h-[1.75rem] min-w-0 flex-1 font-semibold text-lg leading-snug text-gray-900 line-clamp-2">
              {displayTitle}
            </h3>
            {blocked ? <LockedTestBadge /> : null}
          </div>
          <p className="mt-1 text-sm leading-5 text-gray-500 line-clamp-2 min-h-5">
            {test.description?.trim() || 'One timer for the whole paper'}
          </p>
        </div>
        <Badge className="flex-shrink-0 bg-amber-100 text-amber-800 text-xs px-2 py-1">
          Sprint
        </Badge>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-600">
        <div className="flex items-center gap-1">
          <HelpCircle className="w-4 h-4 shrink-0" />
          <span>{test.totalQuestions} Questions</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4 shrink-0" />
          <span>{test.durationInMinutes} mins</span>
        </div>
        <div className="flex items-center gap-1">
          <BookMarked className="w-4 h-4 shrink-0" />
          <span>
            {test.marksPerQuestion} mark{test.marksPerQuestion !== 1 ? 's' : ''}/Q
          </span>
        </div>
      </div>

      <p
        className={`mt-3 mb-4 flex items-center gap-1 text-sm leading-5 min-h-5 ${
          negativeMarking ? 'text-orange-700' : 'text-green-600'
        }`}
      >
        {!negativeMarking && <Minus className="w-4 h-4 shrink-0" />}
        <span>
          {negativeMarking
            ? `-${test.negativeMarking} per wrong answer`
            : 'No negative marking'}
        </span>
      </p>

      <PaperCardAction
        testId={test.id}
        blocked={blocked}
        disabled={disabled}
        isActing={isActing}
        onAction={onAction}
        label={label}
        loadingLabel={loadingLabel}
        className={className}
        Icon={Icon}
        buttonClassName="mt-auto"
      />
    </div>
  );
}
