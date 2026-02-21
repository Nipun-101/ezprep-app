'use client';

import { Star, Flame, Trophy, Zap, Timer, Award, Lock } from 'lucide-react';
import type { Badge } from '@/lib/profileData';
import { cn } from '@/lib/utils';

interface Props {
  badges: Badge[];
}

const iconMap: Record<string, any> = { Star, Flame, Trophy, Zap, Timer, Award };

export default function ProfileBadges({ badges }: Props) {
  const earned = badges.filter((b) => b.earned).length;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-900">Badges</h2>
            <p className="text-xs text-gray-400 mt-0.5">{earned} of {badges.length} earned</p>
          </div>
          <div className="flex items-center gap-1.5 bg-amber-50 text-amber-700 text-xs font-bold px-2.5 py-1 rounded-full border border-amber-100">
            <Trophy className="w-3 h-3" />
            {earned} Earned
          </div>
        </div>

        <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-400 to-yellow-400 transition-all duration-700"
            style={{ width: `${(earned / badges.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="px-5 py-4 grid grid-cols-3 gap-3">
        {badges.map((badge) => {
          const Icon = iconMap[badge.icon] ?? Star;
          return (
            <div
              key={badge.id}
              title={badge.description}
              className={cn(
                'flex flex-col items-center gap-2 p-2.5 rounded-xl transition-all cursor-default',
                badge.earned
                  ? 'hover:bg-gray-50'
                  : 'opacity-40'
              )}
            >
              <div className={cn(
                'w-12 h-12 rounded-xl flex items-center justify-center transition-all',
                badge.earned
                  ? `bg-gradient-to-br ${badge.color} shadow-lg`
                  : 'bg-gray-100'
              )}>
                {badge.earned
                  ? <Icon className="w-5 h-5 text-white" />
                  : <Lock className="w-4 h-4 text-gray-400" />
                }
              </div>
              <span className={cn(
                'text-xs text-center font-semibold leading-tight',
                badge.earned ? 'text-gray-700' : 'text-gray-400'
              )}>
                {badge.title}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
