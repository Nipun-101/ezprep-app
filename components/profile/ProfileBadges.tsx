'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Star,
  Flame,
  Trophy,
  Zap,
  Timer,
  Award,
  Lock,
  Target,
  Brain,
  GraduationCap,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  getBadges,
  type BadgesSummary,
  type UserBadge,
} from '@/lib/api/analytics';

type IconComponent = typeof Star;

interface BadgeVisual {
  Icon: IconComponent;
  gradient: string;
  glow: string;
}

const ID_VISUALS: Record<string, BadgeVisual> = {
  'first-test': {
    Icon: Star,
    gradient: 'from-yellow-400 to-orange-400',
    glow: 'shadow-orange-200',
  },
  'streak-7': {
    Icon: Flame,
    gradient: 'from-orange-400 to-red-400',
    glow: 'shadow-orange-200',
  },
  'streak-30': {
    Icon: Zap,
    gradient: 'from-blue-400 to-cyan-400',
    glow: 'shadow-blue-200',
  },
  'tests-10': {
    Icon: Trophy,
    gradient: 'from-teal-400 to-emerald-500',
    glow: 'shadow-teal-200',
  },
  'tests-50': {
    Icon: Trophy,
    gradient: 'from-emerald-500 to-teal-600',
    glow: 'shadow-emerald-200',
  },
  'top-scorer': {
    Icon: Award,
    gradient: 'from-amber-400 to-yellow-300',
    glow: 'shadow-amber-200',
  },
  'perfect-score': {
    Icon: CheckCircle2,
    gradient: 'from-amber-500 to-yellow-400',
    glow: 'shadow-amber-200',
  },
  'speed-demon': {
    Icon: Timer,
    gradient: 'from-pink-400 to-rose-400',
    glow: 'shadow-pink-200',
  },
  'accuracy-master': {
    Icon: Target,
    gradient: 'from-sky-400 to-blue-400',
    glow: 'shadow-sky-200',
  },
  'subject-expert': {
    Icon: GraduationCap,
    gradient: 'from-violet-400 to-purple-400',
    glow: 'shadow-purple-200',
  },
};

const CATEGORY_VISUALS: Record<string, BadgeVisual> = {
  Milestone: {
    Icon: Trophy,
    gradient: 'from-yellow-400 to-orange-400',
    glow: 'shadow-orange-200',
  },
  Consistency: {
    Icon: Flame,
    gradient: 'from-orange-400 to-red-400',
    glow: 'shadow-orange-200',
  },
  Performance: {
    Icon: Award,
    gradient: 'from-teal-400 to-emerald-500',
    glow: 'shadow-teal-200',
  },
  Mastery: {
    Icon: Brain,
    gradient: 'from-violet-400 to-purple-400',
    glow: 'shadow-purple-200',
  },
};

const FALLBACK_VISUAL: BadgeVisual = {
  Icon: Star,
  gradient: 'from-gray-400 to-gray-500',
  glow: 'shadow-gray-200',
};

function visualFor(badge: UserBadge): BadgeVisual {
  return (
    ID_VISUALS[badge.id] ??
    CATEGORY_VISUALS[badge.category] ??
    FALLBACK_VISUAL
  );
}

export default function ProfileBadges() {
  const [data, setData] = useState<BadgesSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getBadges();
      setData(result);
    } catch (err) {
      console.error('Failed to load badges', err);
      setError('Could not load badges.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const earnedCount = data?.earnedCount ?? 0;
  const totalCount = data?.totalCount ?? data?.badges.length ?? 0;
  const progressPct =
    totalCount > 0 ? Math.round((earnedCount / totalCount) * 100) : 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-900">Badges</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {isLoading || error
                ? 'Track your achievements'
                : `${earnedCount} of ${totalCount} earned`}
            </p>
          </div>
          {!isLoading && !error && (
            <div className="flex items-center gap-1.5 bg-amber-50 text-amber-700 text-xs font-bold px-2.5 py-1 rounded-full border border-amber-100">
              <Trophy className="w-3 h-3" />
              {earnedCount} Earned
            </div>
          )}
        </div>

        <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-400 to-yellow-400 transition-all duration-700"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {isLoading && <BadgesSkeleton />}

      {!isLoading && error && (
        <div className="px-5 py-10 flex flex-col items-center justify-center text-center">
          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center mb-3">
            <AlertCircle className="w-5 h-5 text-red-500" />
          </div>
          <p className="text-sm text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => void load()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-xl text-sm font-medium transition-all active:scale-95 shadow-md shadow-teal-200"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry
          </button>
        </div>
      )}

      {!isLoading && !error && data && data.badges.length > 0 && (
        <div className="px-5 py-4 grid grid-cols-3 gap-3">
          {data.badges.map((badge) => {
            const { Icon, gradient, glow } = visualFor(badge);
            const tooltip = `${badge.description}\n\nHow to earn: ${badge.criteria}`;

            return (
              <div
                key={badge.id}
                title={tooltip}
                className={cn(
                  'flex flex-col items-center gap-2 p-2.5 rounded-xl transition-all cursor-default',
                  badge.isEarned ? 'hover:bg-gray-50' : 'opacity-50'
                )}
              >
                <div
                  className={cn(
                    'w-12 h-12 rounded-xl flex items-center justify-center transition-all',
                    badge.isEarned
                      ? `bg-gradient-to-br ${gradient} shadow-lg ${glow}`
                      : 'bg-gray-100'
                  )}
                >
                  {badge.isEarned ? (
                    <Icon className="w-5 h-5 text-white" />
                  ) : (
                    <Lock className="w-4 h-4 text-gray-400" />
                  )}
                </div>
                <span
                  className={cn(
                    'text-xs text-center font-semibold leading-tight',
                    badge.isEarned ? 'text-gray-700' : 'text-gray-400'
                  )}
                >
                  {badge.name}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {!isLoading && !error && data && data.badges.length === 0 && (
        <div className="px-5 py-12 flex flex-col items-center justify-center text-center">
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-3">
            <Trophy className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-sm font-medium text-gray-700">No badges yet</p>
          <p className="text-xs text-gray-400 mt-1">
            Start practicing to unlock achievements.
          </p>
        </div>
      )}
    </div>
  );
}

function BadgesSkeleton() {
  return (
    <div className="px-5 py-4 grid grid-cols-3 gap-3 animate-pulse">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex flex-col items-center gap-2 p-2.5">
          <div className="w-12 h-12 rounded-xl bg-gray-100" />
          <div className="h-3 bg-gray-100 rounded w-3/4" />
        </div>
      ))}
    </div>
  );
}
