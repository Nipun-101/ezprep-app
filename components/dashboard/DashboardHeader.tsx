'use client';

import { Menu, Gift } from 'lucide-react';
import { useRouter } from 'next/navigation';
import SearchBox from './SearchBox';
import { dummyProfile } from '@/lib/profileData';

interface DashboardHeaderProps {
  onMenuClick: () => void;
}

export default function DashboardHeader({ onMenuClick }: DashboardHeaderProps) {
  const router = useRouter();

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
  );
}
