import { Tag } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function OfferCallout({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-2xl bg-gradient-to-r from-red-50 to-orange-50 px-4 py-2.5 shadow-sm',
        className
      )}
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-orange-500 shadow-md">
        <Tag className="h-4 w-4 text-white" aria-hidden />
      </div>
      <div className="flex min-w-0 flex-col">
        <span className="text-xs font-semibold text-gray-800">Tests from ₹1</span>
        <span className="text-[11px] leading-tight text-gray-500">Limited-period offer</span>
      </div>
    </div>
  );
}
