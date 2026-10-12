import { Lock } from 'lucide-react';

export default function LockedTestBadge() {
  return (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-md border border-gray-200 bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-600">
      <Lock className="h-3 w-3" />
      Locked
    </span>
  );
}
