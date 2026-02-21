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
    sub: `Top ${Math.round((p.rank / p.totalStudents) * 100)}% of students`,
    icon: TrendingUp,
    gradient: 'from-teal-500 to-emerald-400',
    glow: 'shadow-teal-200',
    text: 'text-teal-600',
    ring: 'ring-teal-100',
  },
  {
    label: 'Study Streak',
    value: `${p.streakDays}`,
    unit: 'days',
    sub: 'Keep it going!',
    icon: Flame,
    gradient: 'from-orange-500 to-red-400',
    glow: 'shadow-orange-200',
    text: 'text-orange-500',
    ring: 'ring-orange-100',
  },
  {
    label: 'Tests Attempted',
    value: p.testsAttempted,
    sub: `${p.testsCompleted} completed`,
    icon: FileText,
    gradient: 'from-blue-500 to-cyan-400',
    glow: 'shadow-blue-200',
    text: 'text-blue-500',
    ring: 'ring-blue-100',
  },
  {
    label: 'Average Score',
    value: `${p.avgScore}%`,
    sub: `Best: ${p.topScore}%`,
    icon: Target,
    gradient: 'from-emerald-500 to-teal-400',
    glow: 'shadow-emerald-200',
    text: 'text-emerald-600',
    ring: 'ring-emerald-100',
  },
  {
    label: 'Accuracy',
    value: `${p.accuracy}%`,
    sub: 'Correct answers',
    icon: CheckCircle2,
    gradient: 'from-sky-500 to-blue-400',
    glow: 'shadow-sky-200',
    text: 'text-sky-500',
    ring: 'ring-sky-100',
  },
  {
    label: 'Study Hours',
    value: `${p.totalStudyHours}`,
    unit: 'hrs',
    sub: 'Total invested',
    icon: Zap,
    gradient: 'from-amber-500 to-orange-400',
    glow: 'shadow-amber-200',
    text: 'text-amber-500',
    ring: 'ring-amber-100',
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
            className={`bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 p-4 flex flex-col gap-3 ring-1 ${stat.ring} group`}
          >
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg ${stat.glow} group-hover:scale-110 transition-transform duration-200`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-baseline gap-0.5">
                <span className="text-2xl font-extrabold text-gray-900 leading-none">{stat.value}</span>
                {'unit' in stat && stat.unit && (
                  <span className={`text-xs font-bold ml-1 ${stat.text}`}>{stat.unit}</span>
                )}
              </div>
              <div className="text-xs font-semibold text-gray-500 mt-1">{stat.label}</div>
              <div className={`text-xs mt-0.5 font-medium ${stat.text}`}>{stat.sub}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
