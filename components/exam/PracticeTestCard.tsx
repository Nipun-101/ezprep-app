'use client';

import { Clock, HelpCircle, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PracticeTest } from '@/lib/mockData';
import { cn } from '@/lib/utils';

interface PracticeTestCardProps {
  test: PracticeTest;
  onStart?: () => void;
}

const difficultyConfig = {
  easy: { color: 'bg-green-100 text-green-700', label: 'Easy' },
  medium: { color: 'bg-yellow-100 text-yellow-700', label: 'Medium' },
  hard: { color: 'bg-red-100 text-red-700', label: 'Hard' },
};

export default function PracticeTestCard({ test, onStart }: PracticeTestCardProps) {
  const difficulty = difficultyConfig[test.difficulty];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900 text-lg">{test.title}</h3>
            {test.isNew && (
              <Badge className="bg-teal-500 text-white text-xs px-2 py-0.5">New</Badge>
            )}
          </div>
          <p className="text-sm text-gray-600">{test.topic}</p>
        </div>
        <Badge className={cn('text-xs px-2 py-1', difficulty.color)}>
          {difficulty.label}
        </Badge>
      </div>

      <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
        <div className="flex items-center gap-1">
          <HelpCircle className="w-4 h-4" />
          <span>{test.questionsCount} Questions</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          <span>{test.duration} mins</span>
        </div>
      </div>

      <Button
        onClick={onStart}
        className="w-full bg-teal-500 hover:bg-teal-600 text-white"
      >
        Start Practice
      </Button>
    </div>
  );
}
