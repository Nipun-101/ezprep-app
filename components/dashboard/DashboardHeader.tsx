'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Menu, Gift } from 'lucide-react';
import { usePathname } from 'next/navigation';
import SearchBox from './SearchBox';
import { cn } from '@/lib/utils';

interface DashboardHeaderProps {
  onMenuClick: () => void;
}

export default function DashboardHeader({ onMenuClick }: DashboardHeaderProps) {
  const pathname = usePathname();
  // Pages that already have a contextual search field — hide the global one on mobile
  // to avoid showing two search boxes stacked together.
  const hideGlobalSearchOnMobile = /^\/dashboard\/exam\//.test(pathname || '');

  const headerRef = useRef<HTMLElement>(null);
  const lastScrollY = useRef(0);
  const prevHiddenRef = useRef<boolean | null>(null);
  const ignoreScrollUntilRef = useRef(0);
  /** Sum of consecutive scroll-down deltas (mobile sends small steps per event). */
  const accDownRef = useRef(0);
  /** Sum of consecutive scroll-up deltas — lower threshold = chrome returns faster. */
  const accUpRef = useRef(0);
  const [headerHeight, setHeaderHeight] = useState(64);
  const [headerHidden, setHeaderHidden] = useState(false);

  useLayoutEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const update = () => setHeaderHeight(el.getBoundingClientRect().height);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [pathname, hideGlobalSearchOnMobile]);

  // When the spacer collapses/expands, the document length changes. If we do not adjust
  // scrollTop, the browser keeps the same scrollY and the scroll handler sees a bogus
  // direction change — causing rapid hide/show (jerking). Compensate and briefly ignore
  // scroll events from that programmatic move.
  useLayoutEffect(() => {
    const prev = prevHiddenRef.current;
    prevHiddenRef.current = headerHidden;
    if (prev === null || prev === headerHidden) return;

    const h = headerRef.current?.getBoundingClientRect().height ?? headerHeight;
    const y = window.scrollY;
    ignoreScrollUntilRef.current = performance.now() + 100;

    accDownRef.current = 0;
    accUpRef.current = 0;

    if (headerHidden) {
      window.scrollTo({ top: Math.max(0, y - h), behavior: 'auto' });
    } else {
      window.scrollTo({ top: y + h, behavior: 'auto' });
    }
    lastScrollY.current = window.scrollY;
  }, [headerHidden]);

  useEffect(() => {
    lastScrollY.current = window.scrollY;
    accDownRef.current = 0;
    accUpRef.current = 0;
    if (window.scrollY < 24) setHeaderHidden(false);
  }, [pathname]);

  useEffect(() => {
    const isMobileViewport = () =>
      typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches;

    const onScroll = () => {
      const y = window.scrollY;
      if (performance.now() < ignoreScrollUntilRef.current) {
        lastScrollY.current = y;
        return;
      }

      const delta = y - lastScrollY.current;
      lastScrollY.current = y;

      const nearTop = 36;
      if (y < nearTop) {
        accDownRef.current = 0;
        accUpRef.current = 0;
        setHeaderHidden(false);
        return;
      }

      const mobile = isMobileViewport();
      // Mobile: small per-event deltas — accumulate for snappy hide; easier show on scroll-up.
      const hideAfter = mobile ? 14 : 26;
      const showAfter = mobile ? 8 : 16;

      if (delta > 0) {
        accDownRef.current += delta;
        accUpRef.current = 0;
        if (accDownRef.current >= hideAfter) {
          setHeaderHidden(true);
          accDownRef.current = 0;
        }
      } else if (delta < 0) {
        accUpRef.current += -delta;
        accDownRef.current = 0;
        if (accUpRef.current >= showAfter) {
          setHeaderHidden(false);
          accUpRef.current = 0;
        }
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <header
        ref={headerRef}
        className={cn(
          'bg-white/80 backdrop-blur-md shadow-sm fixed top-0 z-40 left-0 right-0 lg:left-72',
          'motion-safe:transition-transform motion-safe:duration-200 motion-safe:ease-out',
          headerHidden ? '-translate-y-full' : 'translate-y-0'
        )}
      >
        <div className="flex items-center gap-3 px-4 lg:px-10 py-4">
          <button
            type="button"
            onClick={onMenuClick}
            className="lg:hidden p-2.5 hover:bg-gray-100 rounded-xl transition-all active:scale-95 shrink-0"
          >
            <Menu className="w-6 h-6 text-gray-700" />
          </button>

          <div className={`flex-1 min-w-0 ${hideGlobalSearchOnMobile ? 'hidden lg:block' : ''}`}>
            <SearchBox />
          </div>

          <div className="hidden sm:flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-3 bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl px-4 py-2.5 shadow-sm">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-md shrink-0">
                <Gift className="w-4 h-4 text-white" aria-hidden />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-gray-800">Free Early Access</span>
              </div>
            </div>

            {/* <button
            onClick={() => router.push('/dashboard/profile')}
            className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center text-white text-sm font-bold shadow-md shadow-teal-200 hover:shadow-lg hover:scale-105 transition-all active:scale-95"
            title="My Profile"
          >
            {dummyProfile.avatar}
          </button> */}
          </div>
        </div>
      </header>
      {/* Height must change instantly (no transition) so scroll compensation stays in sync */}
      <div
        aria-hidden
        className="shrink-0 w-full overflow-hidden"
        style={{ height: headerHidden ? 0 : headerHeight }}
      />
    </>
  );
}
