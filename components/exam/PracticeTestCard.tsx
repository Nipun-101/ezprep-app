'use client';

import { Clock, HelpCircle, BookMarked, Minus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ApiMockTest } from '@/lib/api/exams';

interface PracticeTestCardProps {
  test: ApiMockTest;
  onStart?: () => void;
  isStarting?: boolean;
  disabled?: boolean;
}

export default function PracticeTestCard({
  test,
  onStart,
  isStarting = false,
  disabled = false,
}: PracticeTestCardProps) {
  const displayTitle = test.title || test.topic.name;
  const negativeMarking = test.negativeMarking > 0;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-lg leading-snug mb-1 truncate">
            {displayTitle}
          </h3>
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

      <Button
        onClick={onStart}
        disabled={disabled || isStarting}
        className="w-full bg-teal-500 hover:bg-teal-600 text-white disabled:bg-gray-300 disabled:text-gray-500"
      >
        {isStarting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Starting...
          </>
        ) : (
          'Start Practice'
        )}
      </Button>
    </div>
  );
}
