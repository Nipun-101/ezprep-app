'use client';

import { Clock, HelpCircle, BookMarked, Minus, Play, RotateCcw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ApiMockTest, UserAttemptAction } from '@/lib/api/exams';
import LockedTestBadge from './access/LockedTestBadge';
import PaperCardAction from './access/PaperCardAction';
import { isStartBlocked } from './access/paper-access';

interface PracticeTestCardProps {
  test: ApiMockTest;
  onAction?: () => void;
  isActing?: boolean;
  disabled?: boolean;
}

const ACTION_CONFIG: Record<
  UserAttemptAction,
  { label: string; loadingLabel: string; className: string; Icon: React.ElementType }
> = {
  START: {
    label: 'Start Practice',
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

export default function PracticeTestCard({
  test,
  onAction,
  isActing = false,
  disabled = false,
}: PracticeTestCardProps) {
  const displayTitle = test.title || test.topic.name;
  const negativeMarking = test.negativeMarking > 0;
  const action = test.userAttemptAction ?? 'START';
  const { label, loadingLabel, className, Icon } = ACTION_CONFIG[action];
  const blocked = isStartBlocked(test);

  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-all ${
        disabled ? 'opacity-50 pointer-events-none' : ''
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="mb-1 flex items-center gap-2">
            <h3 className="min-w-0 flex-1 truncate font-semibold text-lg leading-snug text-gray-900">
              {displayTitle}
            </h3>
            {blocked ? <LockedTestBadge /> : null}
          </div>
          <p className="text-sm text-gray-500">{test.subject.name}</p>
        </div>
        {negativeMarking && (
          <Badge className="ml-2 flex-shrink-0 bg-orange-100 text-orange-700 text-xs px-2 py-1">
            -{test.negativeMarking} marking
          </Badge>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-gray-600">
        <div className="flex items-center gap-1">
          <HelpCircle className="w-4 h-4" />
          <span>{test.totalQuestions} Questions</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          <span>{test.durationInMinutes} mins</span>
        </div>
        <div className="flex items-center gap-1">
          <BookMarked className="w-4 h-4" />
          <span>{test.marksPerQuestion} mark{test.marksPerQuestion !== 1 ? 's' : ''}/Q</span>
        </div>
        {!negativeMarking && (
          <div className="flex items-center gap-1 text-green-600">
            <Minus className="w-4 h-4" />
            <span>No negative marking</span>
          </div>
        )}
      </div>

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
      />
    </div>
  );
}
