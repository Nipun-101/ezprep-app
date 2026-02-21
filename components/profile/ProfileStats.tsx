'use client';

import { TrendingUp, Flame, FileText, Target, CheckCircle2, Zap } from 'lucide-react';
import type { UserProfile } from '@/lib/profileData';

interface Props {
  profile: UserProfile;
}

const stats = (p: UserProfile) => [
  {
    label: 'National Rank',
    value: `#${p.rank.toLocaleString()}`,
    sub: `of ${(p.totalStudents / 1000).toFixed(0)}k students`,
    icon: TrendingUp,
    gradient: 'from-teal-500 to-emerald-400',
    bg: 'bg-teal-50',
    iconColor: 'text-teal-600',
  },
  {
    label: 'Study Streak',
    value: `${p.streakDays} days`,
    sub: 'Keep it going!',
    icon: Flame,
    gradient: 'from-orange-400 to-red-400',
    bg: 'bg-orange-50',
    iconColor: 'text-orange-500',
  },
  {
    label: 'Tests Attempted',
    value: p.testsAttempted,
    sub: `${p.testsCompleted} completed`,
    icon: FileText,
    gradient: 'from-blue-400 to-cyan-400',
    bg: 'bg-blue-50',
    iconColor: 'text-blue-500',
  },
  {
    label: 'Average Score',
    value: `${p.avgScore}%`,
    sub: `Best: ${p.topScore}%`,
    icon: Target,
    gradient: 'from-emerald-400 to-teal-400',
    bg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
  },
  {
    label: 'Accuracy',
    value: `${p.accuracy}%`,
    sub: 'Correct answers',
    icon: CheckCircle2,
    gradient: 'from-violet-400 to-blue-400',
    bg: 'bg-violet-50',
    iconColor: 'text-violet-500',
  },
  {
    label: 'Study Hours',
    value: `${p.totalStudyHours}h`,
    sub: 'Total this month',
    icon: Zap,
    gradient: 'from-amber-400 to-orange-400',
    bg: 'bg-amber-50',
    iconColor: 'text-amber-500',
  },
];

export default function ProfileStats({ profile }: Props) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
      {stats(profile).map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-col gap-3"
          >
            <div className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center`}>
              <Icon className={`w-4.5 h-4.5 ${stat.iconColor}`} size={18} />
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-xs text-gray-500 mt-0.5 font-medium">{stat.label}</div>
              <div className="text-xs text-gray-400 mt-0.5">{stat.sub}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
