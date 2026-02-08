'use client';

import { useState, useEffect } from 'react';
import { Menu, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface DashboardHeaderProps {
  onMenuClick: () => void;
}

export default function DashboardHeader({ onMenuClick }: DashboardHeaderProps) {
  const [timeLeft, setTimeLeft] = useState({
    hours: 10,
    minutes: 54,
    seconds: 54,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { hours, minutes, seconds } = prev;

        if (seconds > 0) {
          seconds--;
        } else if (minutes > 0) {
          minutes--;
          seconds = 59;
        } else if (hours > 0) {
          hours--;
          minutes = 59;
          seconds = 59;
        }

        return { hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="flex items-center justify-between px-4 lg:px-8 py-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Menu className="w-6 h-6 text-gray-700" />
        </button>

        <div className="hidden lg:block" />

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
            <Gift className="w-5 h-5 text-red-500" />
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-900">Offers</span>
              <Badge className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 mt-1">
                Expires in {String(timeLeft.hours).padStart(2, '0')} : {String(timeLeft.minutes).padStart(2, '0')} : {String(timeLeft.seconds).padStart(2, '0')}
              </Badge>
            </div>
          </div>

          <Button className="bg-teal-500 hover:bg-teal-600 text-white font-semibold px-6">
            BUY COURSES
          </Button>
        </div>
      </div>
    </header>
  );
}
