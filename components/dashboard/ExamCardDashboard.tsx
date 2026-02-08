'use client';

import { Train, Building2, Shield, Keyboard } from 'lucide-react';
import { ExamIconType } from '@/lib/mockData';
import { cn } from '@/lib/utils';

const iconConfig: Record<ExamIconType, { icon: any; bgColor: string; iconColor: string }> = {
  railways: {
    icon: Train,
    bgColor: 'bg-red-100',
    iconColor: 'text-red-600',
  },
  ssc: {
    icon: Building2,
    bgColor: 'bg-red-100',
    iconColor: 'text-red-600',
  },
  ib: {
    icon: Shield,
    bgColor: 'bg-gray-100',
    iconColor: 'text-gray-700',
  },
  typing: {
    icon: Keyboard,
    bgColor: 'bg-red-100',
    iconColor: 'text-red-600',
  },
};

interface ExamCardDashboardProps {
  name: string;
  iconType: ExamIconType;
  isActive: boolean;
  onClick?: () => void;
}

export default function ExamCardDashboard({
  name,
  iconType,
  isActive,
  onClick,
}: ExamCardDashboardProps) {
  const config = iconConfig[iconType];
  const Icon = config.icon;

  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col items-center justify-center p-6 rounded-2xl transition-all duration-300 group bg-white',
        isActive
          ? 'hover:shadow-lg hover:shadow-gray-200/60 hover:-translate-y-1 cursor-pointer'
          : 'opacity-50 cursor-not-allowed hover:shadow-none'
      )}
    >
      <div
        className={cn(
          'relative w-20 h-20 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300 shadow-md',
          config.bgColor,
          isActive
            ? 'group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-red-200/50'
            : ''
        )}
      >
        <Icon className={cn('w-9 h-9', config.iconColor)} />
        {!isActive && (
          <div className="absolute inset-0 bg-white/60 rounded-2xl backdrop-blur-sm" />
        )}
      </div>
      <p className="text-sm font-semibold text-gray-800 text-center leading-tight max-w-[140px]">
        {name}
      </p>
    </button>
  );
}
