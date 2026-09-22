'use client';

import { Clock, HelpCircle, BookMarked, Layers, Loader2, Play, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserAttemptAction } from '@/lib/api/exams';
import { ApiFullMockTest } from '@/lib/api/full-mock-tests';

interface FullMockTestCardProps {
  test: ApiFullMockTest;
  onAction?: () => void;
  isActing?: boolean;
  disabled?: boolean;
}

const ACTION_CONFIG: Record<
  UserAttemptAction,
  { label: string; loadingLabel: string; className: string; Icon: React.ElementType }
> = {
  START: {
    label: 'Start Mock',
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

export default function FullMockTestCard({
  test,
  onAction,
  isActing = false,
  disabled = false,
}: FullMockTestCardProps) {
  const displayTitle = test.title || test.exam?.name || 'Full Mock Test';
  const action = test.userAttemptAction ?? 'START';
  const { label, loadingLabel, className, Icon } = ACTION_CONFIG[action];
  const subjectCount = test.subjectConfig?.length ?? 0;
  const negativeMarking = test.negativeMarking > 0;

  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-all ${
        disabled ? 'opacity-50 pointer-events-none' : ''
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-lg leading-snug mb-1 truncate">
            {displayTitle}
          </h3>
          <p className="text-sm text-gray-500">
            {test.isSessionWise ? 'Session-wise' : 'Mixed'} · {subjectCount} subject
            {subjectCount === 1 ? '' : 's'}
          </p>
        </div>
        <Badge className="ml-2 flex-shrink-0 bg-indigo-100 text-indigo-700 text-xs px-2 py-1">
          {test.isSessionWise ? 'Session-wise' : 'Mixed'}
        </Badge>
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
        {test.totalMarks != null && (
          <div className="flex items-center gap-1">
            <BookMarked className="w-4 h-4" />
            <span>{test.totalMarks} marks</span>
          </div>
        )}
        <div className="flex items-center gap-1">
          <Layers className="w-4 h-4" />
          <span>{subjectCount} sections</span>
        </div>
      </div>

      {negativeMarking && (
        <p className="text-xs text-orange-700 mb-3">Negative marking applies per subject</p>
      )}

      <Button
        onClick={onAction}
        disabled={disabled || isActing}
        className={`w-full disabled:opacity-100 ${className}`}
      >
        {isActing ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            {loadingLabel}
          </>
        ) : (
          <>
            <Icon className="w-4 h-4 mr-2" />
            {label}
          </>
        )}
      </Button>
    </div>
  );
}
