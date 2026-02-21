'use client';

import { useState, useEffect } from 'react';
import { Menu, Gift } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import SearchBox from './SearchBox';
import { dummyProfile } from '@/lib/profileData';

interface DashboardHeaderProps {
  onMenuClick: () => void;
}

export default function DashboardHeader({ onMenuClick }: DashboardHeaderProps) {
  const router = useRouter();
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
    <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 shadow-sm">
      <div className="flex items-center gap-3 px-4 lg:px-10 py-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2.5 hover:bg-gray-100 rounded-xl transition-all active:scale-95 shrink-0"
        >
          <Menu className="w-6 h-6 text-gray-700" />
        </button>

        <div className="flex-1 min-w-0">
          <SearchBox />
        </div>

        <div className="hidden sm:flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-3 bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl px-4 py-2.5 shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-md shrink-0">
              <Gift className="w-4 h-4 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-gray-800">Limited Offer</span>
              <span className="text-xs font-mono font-bold text-red-600">
                {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
              </span>
            </div>
          </div>

          <Button className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-semibold px-6 py-5 rounded-2xl shadow-lg shadow-teal-200/50 hover:shadow-xl hover:shadow-teal-300/50 transition-all duration-200 active:scale-95 text-sm">
            BUY COURSES
          </Button>

          <button
            onClick={() => router.push('/dashboard/profile')}
            className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center text-white text-sm font-bold shadow-md shadow-teal-200 hover:shadow-lg hover:scale-105 transition-all active:scale-95"
            title="My Profile"
          >
            {dummyProfile.avatar}
          </button>
        </div>

        <div className="sm:hidden shrink-0">
          <Button size="sm" className="bg-gradient-to-r from-teal-500 to-teal-600 text-white font-semibold rounded-xl px-3 py-2 text-xs">
            BUY
          </Button>
        </div>
      </div>
    </header>
  );
}
