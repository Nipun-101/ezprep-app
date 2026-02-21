'use client';

import { FileText, BookOpen, Clock, CheckCircle2 } from 'lucide-react';
import type { ActivityItem } from '@/lib/profileData';
import { cn } from '@/lib/utils';

interface Props {
  activities: ActivityItem[];
}

export default function ProfileActivity({ activities }: Props) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
      <div className="px-6 py-4 border-b border-gray-50">
        <h2 className="text-base font-semibold text-gray-900">Recent Activity</h2>
        <p className="text-xs text-gray-400 mt-0.5">Your latest tests and practice sessions</p>
      </div>

      <div className="divide-y divide-gray-50">
        {activities.map((item) => {
          const pct = item.score != null && item.totalMarks
            ? Math.round((item.score / item.totalMarks) * 100)
            : null;

          const scoreColor =
            pct == null ? '' :
            pct >= 80 ? 'text-emerald-600' :
            pct >= 60 ? 'text-amber-600' : 'text-red-500';

          const Icon = item.type === 'test' ? FileText : BookOpen;
          const iconBg = item.type === 'test' ? 'bg-blue-50 text-blue-500' : 'bg-teal-50 text-teal-500';

          return (
            <div key={item.id} className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50/50 transition-colors">
              <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center shrink-0', iconBg)}>
                <Icon className="w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-800 truncate">{item.title}</div>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {item.duration} min
                  </span>
                  <span className="text-xs text-gray-400">{item.date}</span>
                </div>
              </div>

              <div className="text-right shrink-0">
                {pct != null && (
                  <>
                    <div className={cn('text-sm font-bold', scoreColor)}>{pct}%</div>
                    <div className="text-xs text-gray-400">{item.score}/{item.totalMarks}</div>
                  </>
                )}
                <div className="flex items-center gap-1 justify-end mt-0.5">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span className="text-xs text-gray-400 capitalize">{item.status.replace('_', ' ')}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
