'use client';

import { Star, Flame, Trophy, Zap, Timer, Award, Lock } from 'lucide-react';
import type { Badge } from '@/lib/profileData';
import { cn } from '@/lib/utils';

interface Props {
  badges: Badge[];
}

const iconMap: Record<string, any> = { Star, Flame, Trophy, Zap, Timer, Award };

export default function ProfileBadges({ badges }: Props) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
      <div className="px-5 py-4 border-b border-gray-50">
        <h2 className="text-base font-semibold text-gray-900">Badges</h2>
        <p className="text-xs text-gray-400 mt-0.5">
          {badges.filter((b) => b.earned).length} of {badges.length} earned
        </p>
      </div>

      <div className="px-5 py-4 grid grid-cols-3 gap-3">
        {badges.map((badge) => {
          const Icon = iconMap[badge.icon] ?? Star;
          return (
            <div
              key={badge.id}
              title={badge.description}
              className={cn(
                'flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all',
                badge.earned ? 'opacity-100' : 'opacity-40 grayscale'
              )}
            >
              <div className={cn(
                'w-11 h-11 rounded-xl flex items-center justify-center',
                badge.earned
                  ? `bg-gradient-to-br ${badge.color} shadow-md`
                  : 'bg-gray-100'
              )}>
                {badge.earned
                  ? <Icon className="w-5 h-5 text-white" />
                  : <Lock className="w-4 h-4 text-gray-400" />
                }
              </div>
              <span className="text-xs text-center text-gray-600 font-medium leading-tight">{badge.title}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
