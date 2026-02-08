'use client';

import { Users, FileText, Train, Building2, Shield, Keyboard } from 'lucide-react';
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

interface ExamIntroProps {
  name: string;
  iconType: ExamIconType;
  description: string;
  totalTests: number;
  totalStudents: number;
}

export default function ExamIntro({
  name,
  iconType,
  description,
  totalTests,
  totalStudents,
}: ExamIntroProps) {
  const config = iconConfig[iconType];
  const Icon = config.icon;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
      <div className="flex items-start gap-6">
        <div
          className={cn(
            'w-20 h-20 rounded-full flex items-center justify-center flex-shrink-0 border-4 border-red-500',
            config.bgColor
          )}
        >
          <Icon className={cn('w-10 h-10', config.iconColor)} />
        </div>

        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">{name}</h1>

          <div className="flex flex-wrap gap-4 mb-4">
            <div className="flex items-center gap-2 text-gray-600">
              <FileText className="w-5 h-5 text-teal-600" />
              <span className="text-sm font-medium">{totalTests} Tests Available</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Users className="w-5 h-5 text-teal-600" />
              <span className="text-sm font-medium">{totalStudents.toLocaleString()} Students Enrolled</span>
            </div>
          </div>

          <p className="text-gray-700 leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  );
}
