'use client';

import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

interface TimerProps {
  durationInMinutes: number;
  onTimeUp: () => void;
  isPaused?: boolean;
}

export default function Timer({ durationInMinutes, onTimeUp, isPaused = false }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(durationInMinutes * 60);

  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeUp();
      return;
    }

    if (isPaused) {
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onTimeUp, isPaused]);

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
