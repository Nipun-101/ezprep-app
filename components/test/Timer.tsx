'use client';

import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

interface TimerProps {
  durationInMinutes: number;
  onTimeUp: () => void;
}

export default function Timer({ durationInMinutes, onTimeUp }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(durationInMinutes * 60);

  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeUp();
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
  }, [timeLeft, onTimeUp]);

  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;

  const isWarning = timeLeft <= 300;
  const isCritical = timeLeft <= 60;

  return (
    <div
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${
        isCritical
          ? 'bg-red-100 text-red-700'
          : isWarning
          ? 'bg-amber-100 text-amber-700'
          : 'bg-teal-100 text-teal-700'
      }`}
    >
      <Clock className="w-5 h-5" />
      <span className="text-lg tabular-nums">
        {hours > 0 && `${hours.toString().padStart(2, '0')}:`}
        {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
      </span>
    </div>
  );
}
