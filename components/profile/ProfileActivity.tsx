'use client';

import { FileText, BookOpen, Clock, CheckCircle2, ArrowUpRight } from 'lucide-react';
import type { ActivityItem } from '@/lib/profileData';
import { cn } from '@/lib/utils';

interface Props {
  activities: ActivityItem[];
}

const scoreConfig = (pct: number) => {
  if (pct >= 80) return { color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', label: 'Excellent' };
  if (pct >= 60) return { color: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-100', label: 'Good' };
  if (pct >= 40) return { color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', label: 'Average' };
  return { color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-100', label: 'Low' };
};

export default function ProfileActivity({ activities }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-gray-900">Recent Activity</h2>
          <p className="text-xs text-gray-400 mt-0.5">Your latest tests and practice sessions</p>
        </div>
        <span className="text-xs font-semibold text-teal-600 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-100">
          {activities.length} sessions
        </span>
      </div>

      <div className="divide-y divide-gray-50">
        {activities.map((item, idx) => {
          const pct = item.score != null && item.totalMarks
            ? Math.round((item.score / item.totalMarks) * 100)
            : null;

          const config = pct != null ? scoreConfig(pct) : null;
          const isTest = item.type === 'test';
          const Icon = isTest ? FileText : BookOpen;
          const iconStyle = isTest
            ? 'bg-gradient-to-br from-blue-500 to-cyan-400 shadow-blue-200'
            : 'bg-gradient-to-br from-teal-500 to-emerald-400 shadow-teal-200';

          return (
            <div
              key={item.id}
              className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50/60 transition-colors group"
            >
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-md', iconStyle)}>
                <Icon className="w-4.5 h-4.5 text-white" size={18} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-gray-800 truncate group-hover:text-teal-700 transition-colors">
                  {item.title}
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {item.duration} min
                  </span>
                  <span className="text-xs text-gray-400">{item.date}</span>
                  <span className={cn(
                    'text-xs font-semibold flex items-center gap-0.5',
                    isTest ? 'text-blue-500' : 'text-teal-500'
                  )}>
                    {isTest ? 'Mock Test' : 'Practice'}
                  </span>
                </div>
              </div>

              <div className="shrink-0 flex flex-col items-end gap-1">
                {pct != null && config && (
                  <div className={cn('flex items-center gap-1 px-2.5 py-1 rounded-lg border', config.bg, config.border)}>
                    <span className={cn('text-sm font-extrabold', config.color)}>{pct}%</span>
                  </div>
                )}
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span className="capitalize">{item.status.replace('_', ' ')}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
