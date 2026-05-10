'use client';

import { useEffect, useState, useRef } from 'react';
import { Clock } from 'lucide-react';

interface AttemptTimerProps {
  initialSeconds: number;
  onTimeUp: () => void;
  isPaused?: boolean;
  onTick?: (secondsLeft: number) => void;
}

export default function AttemptTimer({
  initialSeconds,
  onTimeUp,
  isPaused = false,
  onTick,
}: AttemptTimerProps) {
  const [timeLeft, setTimeLeft] = useState(Math.max(0, initialSeconds));
  const onTimeUpRef = useRef(onTimeUp);
  const onTickRef = useRef(onTick);

  useEffect(() => {
    onTimeUpRef.current = onTimeUp;
    onTickRef.current = onTick;
  }, [onTimeUp, onTick]);

  useEffect(() => {
    setTimeLeft(Math.max(0, initialSeconds));
  }, [initialSeconds]);

  useEffect(() => {
    if (isPaused) return;
    if (timeLeft <= 0) {
      onTimeUpRef.current?.();
      return;
    }

    const id = setInterval(() => {
      setTimeLeft((prev) => {
        const next = prev - 1;
        onTickRef.current?.(next);
        if (next <= 0) {
          clearInterval(id);
          onTimeUpRef.current?.();
          return 0;
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(id);
  }, [isPaused, timeLeft]);

  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;

  const isWarning = timeLeft <= 300;
  const isCritical = timeLeft <= 60;

  return (
    <div
      className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded border transition-colors ${
        isCritical
          ? 'border-red-500 text-red-600 bg-red-50'
          : isWarning
          ? 'border-amber-500 text-amber-700 bg-amber-50'
          : 'border-gray-300 text-gray-700 bg-white'
      }`}
    >
      <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
      <span className="text-xs sm:text-sm font-medium tabular-nums">
        {hours > 0 && `${hours.toString().padStart(2, '0')}:`}
        {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
      </span>
    </div>
  );
}
