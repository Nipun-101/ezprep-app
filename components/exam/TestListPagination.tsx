'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MockTestsPagination } from '@/lib/api/exams';

interface TestListPaginationProps {
  page: number;
  pagination: MockTestsPagination;
  onPageChange: (page: number) => void;
}

export default function TestListPagination({
  page,
  pagination,
  onPageChange,
}: TestListPaginationProps) {
  if (pagination.totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-1 mt-8">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={!pagination.hasPrevPage}
        className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => {
        const isNearCurrent = Math.abs(p - page) <= 1 || p === 1 || p === pagination.totalPages;
        const showEllipsisBefore = p === page - 2 && page - 2 > 1;
        const showEllipsisAfter = p === page + 2 && page + 2 < pagination.totalPages;

        if (!isNearCurrent && !showEllipsisBefore && !showEllipsisAfter) return null;
        if (showEllipsisBefore || showEllipsisAfter) {
          return (
            <span key={`ellipsis-${p}`} className="px-1 text-gray-400 text-sm select-none">
              …
            </span>
          );
        }
        return (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`min-w-[36px] h-9 px-3 rounded-lg text-sm font-medium border transition ${
              p === page
                ? 'bg-gray-700 text-white border-gray-700'
                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {p}
          </button>
        );
      })}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={!pagination.hasNextPage}
        className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
