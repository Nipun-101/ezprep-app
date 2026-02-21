'use client';

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { SubjectPerf } from '@/lib/profileData';
import { cn } from '@/lib/utils';

interface Props {
  subjects: SubjectPerf[];
}

const subjectConfig = (pct: number) => {
  if (pct >= 80) return { bar: 'from-emerald-400 to-teal-400', label: 'text-emerald-600', badge: 'bg-emerald-50 text-emerald-700', badgeText: 'Strong' };
  if (pct >= 60) return { bar: 'from-teal-400 to-cyan-400', label: 'text-teal-600', badge: 'bg-teal-50 text-teal-700', badgeText: 'Good' };
  if (pct >= 40) return { bar: 'from-amber-400 to-yellow-400', label: 'text-amber-600', badge: 'bg-amber-50 text-amber-700', badgeText: 'Average' };
  return { bar: 'from-red-400 to-rose-400', label: 'text-red-500', badge: 'bg-red-50 text-red-600', badgeText: 'Needs Work' };
};

export default function ProfileSubjects({ subjects }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
        <h2 className="text-base font-bold text-gray-900">Subject Performance</h2>
        <p className="text-xs text-gray-400 mt-0.5">Based on your recent tests</p>
      </div>

      <div className="px-5 py-4 space-y-5">
        {subjects.map((sub) => {
          const pct = Math.round((sub.score / sub.total) * 100);
          const config = subjectConfig(pct);

          const TrendIcon =
            sub.trend === 'up' ? TrendingUp :
            sub.trend === 'down' ? TrendingDown : Minus;

          const trendColor =
            sub.trend === 'up' ? 'text-emerald-500 bg-emerald-50' :
            sub.trend === 'down' ? 'text-red-400 bg-red-50' : 'text-gray-400 bg-gray-50';

          return (
            <div key={sub.subject}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-800">{sub.subject}</span>
                  <span className={cn('text-xs font-semibold px-1.5 py-0.5 rounded-md', config.badge)}>
                    {config.badgeText}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className={cn('w-5 h-5 rounded-full flex items-center justify-center', trendColor)}>
                    <TrendIcon className="w-3 h-3" />
                  </div>
                  <span className={cn('text-sm font-extrabold', config.label)}>{pct}%</span>
                </div>
              </div>
              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={cn('h-full rounded-full bg-gradient-to-r transition-all duration-700', config.bar)}
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
