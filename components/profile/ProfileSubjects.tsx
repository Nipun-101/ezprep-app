'use client';

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { SubjectPerf } from '@/lib/profileData';
import { cn } from '@/lib/utils';

interface Props {
  subjects: SubjectPerf[];
}

export default function ProfileSubjects({ subjects }: Props) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
      <div className="px-5 py-4 border-b border-gray-50">
        <h2 className="text-base font-semibold text-gray-900">Subject Performance</h2>
        <p className="text-xs text-gray-400 mt-0.5">Based on your recent tests</p>
      </div>

      <div className="px-5 py-4 space-y-4">
        {subjects.map((sub) => {
          const pct = Math.round((sub.score / sub.total) * 100);
          const barColor =
            pct >= 80 ? 'bg-emerald-500' :
            pct >= 60 ? 'bg-teal-500' :
            pct >= 40 ? 'bg-amber-400' : 'bg-red-400';

          const TrendIcon =
            sub.trend === 'up' ? TrendingUp :
            sub.trend === 'down' ? TrendingDown : Minus;

          const trendColor =
            sub.trend === 'up' ? 'text-emerald-500' :
            sub.trend === 'down' ? 'text-red-400' : 'text-gray-400';

          return (
            <div key={sub.subject}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm text-gray-700 font-medium">{sub.subject}</span>
                <div className="flex items-center gap-1.5">
                  <TrendIcon className={cn('w-3.5 h-3.5', trendColor)} />
                  <span className={cn('text-sm font-bold', pct >= 60 ? 'text-gray-800' : 'text-red-500')}>{pct}%</span>
                </div>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={cn('h-full rounded-full transition-all duration-700', barColor)}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
