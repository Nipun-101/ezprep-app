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
        'flex flex-col items-center justify-center p-4 rounded-xl transition-all group',
        isActive
          ? 'hover:bg-gray-50 cursor-pointer'
          : 'opacity-60 cursor-not-allowed'
      )}
    >
      <div
        className={cn(
          'relative w-16 h-16 rounded-full flex items-center justify-center mb-3 border-4 transition-transform group-hover:scale-110',
          config.bgColor,
          isActive ? 'border-red-500' : 'border-gray-300'
        )}
      >
        <Icon className={cn('w-7 h-7', config.iconColor)} />
        {!isActive && (
          <div className="absolute inset-0 bg-white/50 rounded-full" />
        )}
      </div>
      <p className="text-sm font-medium text-gray-900 text-center leading-tight max-w-[140px]">
        {name}
      </p>
    </button>
  );
}
