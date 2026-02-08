'use client';

import { Clock, HelpCircle, Award, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MockTest } from '@/lib/mockData';

interface MockTestCardProps {
  test: MockTest;
  onStart?: () => void;
}

export default function MockTestCard({ test, onStart }: MockTestCardProps) {
  return (
    <div className="bg-white rounded-lg border-2 border-teal-200 p-6 hover:shadow-lg transition-all hover:border-teal-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-bold text-gray-900 text-xl mb-2">{test.title}</h3>
          {test.isFree && (
            <Badge className="bg-green-500 text-white text-xs px-2 py-1">
              Free Test
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <HelpCircle className="w-4 h-4 text-teal-600" />
          <span>{test.questionsCount} Questions</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock className="w-4 h-4 text-teal-600" />
          <span>{test.duration} mins</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Award className="w-4 h-4 text-teal-600" />
          <span>{test.marksTotal} Marks</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Users className="w-4 h-4 text-teal-600" />
          <span>{test.attempts.toLocaleString()} Attempts</span>
        </div>
      </div>

      <Button
        onClick={onStart}
        className="w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold h-11"
      >
        Start Mock Test
      </Button>
    </div>
  );
}
