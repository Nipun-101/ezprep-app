'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Download, Lightbulb } from 'lucide-react';
import type { CurrentAffairItem } from '@/lib/api/current-affairs';
import { cn } from '@/lib/utils';

const SWIPE_THRESHOLD = 96;
const MAX_VISIBLE = 3;

interface CurrentAffairsSwipeStackProps {
  items: CurrentAffairItem[];
  onComplete?: () => void;
}

type DragState = {
  x: number;
  y: number;
  active: boolean;
};

function stackStyle(index: number, isTop: boolean, drag: DragState) {
  if (isTop) {
    const rotate = drag.x * 0.04;
    return {
      transform: `translate(${drag.x}px, ${drag.y}px) rotate(${rotate}deg)`,
      zIndex: MAX_VISIBLE + 1,
    };
  }
  const depth = index + 1;
  const scale = 1 - depth * 0.04;
  const translateY = depth * 10;
  return {
    transform: `scale(${scale}) translateY(${translateY}px)`,
    zIndex: MAX_VISIBLE - index,
    opacity: 1 - depth * 0.08,
  };
}

function CurrentAffairCard({
  item,
  isTop,
  drag,
  index,
  exiting,
  exitDirection,
}: {
  item: CurrentAffairItem;
  isTop: boolean;
  drag: DragState;
  index: number;
  exiting: boolean;
  exitDirection: 'left' | 'right' | null;
}) {
  const hasTextContent = Boolean(
    item.title?.trim() || item.description?.trim() || item.memoryTrick?.trim()
  );

  const downloadImage = async () => {
    if (!item.imageUrl) return;

    try {
      const response = await fetch(item.imageUrl);
      if (!response.ok) throw new Error('Image download failed');
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      const extension = blob.type.split('/')[1]?.split('+')[0] || 'jpg';
      anchor.href = objectUrl;
      anchor.download = `current-affair-${item.date}-${item.id}.${extension}`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(objectUrl);
    } catch {
      window.open(item.imageUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const style = useMemo(() => {
    if (exiting && isTop && exitDirection) {
      const x = exitDirection === 'left' ? -520 : 520;
      return {
        transform: `translate(${x}px, -40px) rotate(${exitDirection === 'left' ? -18 : 18}deg)`,
        zIndex: MAX_VISIBLE + 2,
        opacity: 0,
      };
    }
    return stackStyle(index, isTop, drag);
  }, [drag, exitDirection, exiting, index, isTop]);

  const likeOpacity = isTop ? Math.min(Math.max(drag.x / SWIPE_THRESHOLD, 0), 1) : 0;
  const skipOpacity = isTop ? Math.min(Math.max(-drag.x / SWIPE_THRESHOLD, 0), 1) : 0;

  return (
    <article
      className={cn(
        'absolute inset-x-0 top-0 mx-auto w-full max-w-lg max-h-full',
        'rounded-3xl border border-white/60 bg-white shadow-xl shadow-teal-100/60',
        'overflow-hidden transition-[transform,opacity] duration-300 ease-out',
        item.imageUrl && !hasTextContent && 'h-full',
        isTop && !exiting && 'touch-pan-y cursor-grab active:cursor-grabbing',
        !isTop && 'pointer-events-none'
      )}
      style={style}
    >
      {isTop && (
        <>
          <div
            className="pointer-events-none absolute left-6 top-6 z-10 rounded-xl border-2 border-emerald-400 bg-emerald-50/90 px-3 py-1 text-xs font-bold uppercase tracking-wide text-emerald-600"
            style={{ opacity: likeOpacity }}
          >
            Got it
          </div>
          <div
            className="pointer-events-none absolute right-6 top-6 z-10 rounded-xl border-2 border-rose-400 bg-rose-50/90 px-3 py-1 text-xs font-bold uppercase tracking-wide text-rose-600"
            style={{ opacity: skipOpacity }}
          >
            Skip
          </div>
        </>
      )}

      {item.imageUrl ? (
        <div
          className={cn(
            'relative w-full bg-gray-950',
            hasTextContent ? 'h-40 xs:h-44 sm:h-52' : 'h-full'
          )}
        >
          <Image
            src={item.imageUrl}
            alt={item.title || `Current affairs for ${item.date}`}
            fill
            className={hasTextContent ? 'object-cover' : 'object-contain'}
            sizes="(max-width: 768px) 100vw, 512px"
            unoptimized
          />
          {hasTextContent ? (
            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-black/10" />
          ) : null}
          {isTop ? (
            <button
              type="button"
              onPointerDown={(event) => event.stopPropagation()}
              onClick={(event) => {
                event.stopPropagation();
                void downloadImage();
              }}
              className="absolute bottom-3 right-3 z-20 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/60 bg-black/55 text-white shadow-lg backdrop-blur-md transition hover:bg-black/70 active:scale-95"
              aria-label="Download image"
              title="Download image"
            >
              <Download className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      ) : (
        <div className="h-20 bg-gradient-to-br from-teal-500 via-emerald-500 to-cyan-500 sm:h-28" />
      )}

      {hasTextContent ? (
      <div className="max-h-[calc(100%-10rem)] space-y-3 overflow-y-auto p-4 pt-4 sm:max-h-[calc(100%-13rem)] sm:space-y-4 sm:p-6 sm:pt-5">
        {item.title?.trim() ? (
          <h3 className="text-lg font-bold leading-snug text-gray-900 sm:text-xl">
            {item.title}
          </h3>
        ) : null}
        {item.description?.trim() ? (
          <p className="text-sm leading-relaxed text-gray-600">{item.description}</p>
        ) : null}
        {item.memoryTrick?.trim() ? (
          <div className="rounded-2xl border border-amber-100 bg-amber-50/80 p-3 sm:p-4">
            <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-amber-700">
              <Lightbulb className="h-3.5 w-3.5" />
              Memory trick
            </div>
            <p className="text-sm text-amber-900/90">{item.memoryTrick}</p>
          </div>
        ) : null}
      </div>
      ) : null}
    </article>
  );
}

export default function CurrentAffairsSwipeStack({
  items,
  onComplete,
}: CurrentAffairsSwipeStackProps) {
  const [stack, setStack] = useState(items);
  const [drag, setDrag] = useState<DragState>({ x: 0, y: 0, active: false });
  const [exiting, setExiting] = useState(false);
  const [exitDirection, setExitDirection] = useState<'left' | 'right' | null>(null);
  const pointerIdRef = useRef<number | null>(null);
  const startRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    setStack(items);
    setDrag({ x: 0, y: 0, active: false });
    setExiting(false);
    setExitDirection(null);
  }, [items]);

  const dismissTop = useCallback(
    (direction: 'left' | 'right') => {
      if (stack.length === 0 || exiting) return;
      setExitDirection(direction);
      setExiting(true);
      window.setTimeout(() => {
        setStack((prev) => {
          const next = prev.slice(1);
          if (next.length === 0) onComplete?.();
          return next;
        });
        setExiting(false);
        setExitDirection(null);
        setDrag({ x: 0, y: 0, active: false });
      }, 280);
    },
    [exiting, onComplete, stack.length]
  );

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (exiting || stack.length === 0) return;
    pointerIdRef.current = event.pointerId;
    startRef.current = { x: event.clientX, y: event.clientY };
    setDrag({ x: 0, y: 0, active: true });
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!drag.active || pointerIdRef.current !== event.pointerId) return;
    setDrag({
      x: event.clientX - startRef.current.x,
      y: (event.clientY - startRef.current.y) * 0.35,
      active: true,
    });
  };

  const onPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!drag.active || pointerIdRef.current !== event.pointerId) return;
    event.currentTarget.releasePointerCapture(event.pointerId);
    pointerIdRef.current = null;

    if (drag.x > SWIPE_THRESHOLD) {
      dismissTop('right');
      return;
    }
    if (drag.x < -SWIPE_THRESHOLD) {
      dismissTop('left');
      return;
    }
    setDrag({ x: 0, y: 0, active: false });
  };

  const visible = stack.slice(0, MAX_VISIBLE);
  const total = items.length;
  const readCount = total - stack.length;
  const progress = total > 0 ? (readCount / total) * 100 : 0;

  if (stack.length === 0) {
    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center rounded-3xl border border-dashed border-teal-200 bg-gradient-to-br from-white to-teal-50/70 p-6 text-center shadow-sm sm:min-h-[420px] sm:p-10">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-teal-600">
          Daily streak secured
        </p>
        <h3 className="mt-3 text-xl font-bold text-gray-900 sm:text-2xl">
          Headlines handled. You&apos;re ahead of the curve.
        </h3>
        <p className="mt-2 max-w-sm text-sm text-gray-500">
          That&apos;s today&apos;s knowledge boost done. Come back tomorrow to keep your edge.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-lg px-0 sm:px-2">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
            Progress
          </p>
          <p className="truncate text-sm font-semibold text-gray-800">
            {readCount} of {total} read
          </p>
        </div>
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div
        className="relative mx-auto h-[min(68svh,540px)] min-h-[400px] max-w-lg select-none sm:h-[560px]"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {[...visible].reverse().map((item, reverseIndex) => {
          const index = visible.length - 1 - reverseIndex;
          const isTop = index === 0;
          return (
            <CurrentAffairCard
              key={item.id}
              item={item}
              isTop={isTop}
              drag={isTop ? drag : { x: 0, y: 0, active: false }}
              index={index}
              exiting={exiting && isTop}
              exitDirection={exitDirection}
            />
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-center gap-4 sm:mt-6">
        <button
          type="button"
          onClick={() => dismissTop('left')}
          className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-rose-200 bg-white text-rose-500 shadow-sm transition hover:scale-105 hover:bg-rose-50 active:scale-95"
          aria-label="Skip card"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => dismissTop('right')}
          className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 text-white shadow-lg shadow-teal-200 transition hover:scale-105 active:scale-95"
          aria-label="Mark as read"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>
      <p className="mt-3 text-center text-xs text-gray-400">
        Swipe right when done, left to skip — or use the buttons below
      </p>
    </div>
  );
}
