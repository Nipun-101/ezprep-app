'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';

interface ExamCardDashboardProps {
  name: string;
  imageUrl?: string;
  isActive?: boolean;
  onClick?: () => void;
}

export default function ExamCardDashboard({
  name,
  imageUrl,
  isActive = true,
  onClick,
}: ExamCardDashboardProps) {
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
          'relative w-20 h-20 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300 shadow-md overflow-hidden bg-gray-100',
          isActive ? 'group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-red-200/50' : ''
        )}
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-cover"
            sizes="80px"
          />
        ) : (
          <span className="text-2xl font-bold text-gray-400">
            {name.charAt(0)}
          </span>
        )}
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
