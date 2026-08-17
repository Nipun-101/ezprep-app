'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import {
  hasUnseenCurrentAffairsToday,
  markCurrentAffairsSeen,
  toDateKey,
} from '@/lib/current-affairs-seen';

const CURRENT_AFFAIRS_PATH = '/dashboard/current-affairs';

export function useCurrentAffairsNotification() {
  const pathname = usePathname();
  const [showBadge, setShowBadge] = useState(false);

  const refresh = useCallback(() => {
    setShowBadge(hasUnseenCurrentAffairsToday());
  }, []);

  useEffect(() => {
    if (pathname === CURRENT_AFFAIRS_PATH) {
      markCurrentAffairsSeen(toDateKey());
      setShowBadge(false);
      return;
    }
    refresh();
  }, [pathname, refresh]);

  useEffect(() => {
    refresh();
    const onSeen = () => refresh();
    window.addEventListener('current-affairs-seen', onSeen);
    window.addEventListener('storage', onSeen);
    return () => {
      window.removeEventListener('current-affairs-seen', onSeen);
      window.removeEventListener('storage', onSeen);
    };
  }, [refresh]);

  return showBadge;
}
