'use client';

import Image from 'next/image';
import { Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExamCardDashboardProps {
  name: string;
  imageUrl?: string;
  isActive?: boolean;
  trending?: boolean;
  onClick?: () => void;
}

export default function ExamCardDashboard({
  name,
  imageUrl,
  isActive = true,
  trending = false,
  onClick,
}: ExamCardDashboardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'relative flex h-full w-full flex-col items-center justify-start p-6 rounded-2xl transition-all duration-300 group bg-white',
        trending &&
          'shadow-[0_2px_6px_-1px_rgba(15,23,42,0.08),0_8px_18px_-6px_rgba(139,92,246,0.35)]',
        isActive
          ? trending
            ? 'hover:shadow-[0_3px_8px_-1px_rgba(15,23,42,0.08),0_12px_22px_-6px_rgba(139,92,246,0.45)] hover:-translate-y-1 cursor-pointer'
            : 'hover:shadow-lg hover:shadow-gray-200/60 hover:-translate-y-1 cursor-pointer'
          : 'opacity-50 cursor-not-allowed hover:shadow-none'
      )}
    >
      {trending ? (
        <span className="pointer-events-none absolute top-2 left-1/2 z-10 -translate-x-1/2">
          <span className="trending-badge relative inline-flex items-center gap-0.5 overflow-hidden rounded-full bg-gradient-to-r from-violet-600 via-fuchsia-500 to-purple-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
            <span
              className="trending-badge-shimmer pointer-events-none absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-white/70 to-transparent"
              aria-hidden
            />
            <Flame className="trending-badge-flame relative h-3 w-3 fill-current" aria-hidden />
            <span className="relative">Trending</span>
          </span>
        </span>
      ) : null}
      <div
        className={cn(
          'relative w-20 h-20 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300 shadow-md overflow-hidden bg-gray-100',
          trending && 'mt-3',
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
