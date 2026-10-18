'use client';

import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  CreditCard,
  Zap,
  UserCircle,
  LogOut,
} from 'lucide-react';
import Image from 'next/image';
import OfferCallout from './OfferCallout';
import SupportSection from './SupportSection';
import { navigationItems } from '@/lib/mockData';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { logout } from '@/lib/auth';
import { useCurrentAffairsNotification } from '@/hooks/useCurrentAffairsNotification';

const iconMap: Record<string, any> = {
  LayoutDashboard,
  CreditCard,
  Zap,
  UserCircle,
};

interface SidebarProps {
  onNavigate?: () => void;
  /** Shown in the mobile drawer, where the header offer chip is hidden. */
  showOfferCallout?: boolean;
}

export default function Sidebar({ onNavigate, showOfferCallout }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const showCurrentAffairsBadge = useCurrentAffairsNotification();

  const handleNavigation = (href: string) => {
    router.push(href);
    if (onNavigate) {
      onNavigate();
    }
  };

  const handleLogout = () => {
    // Clear authentication tokens and redirect to login
    logout();
    if (onNavigate) {
      onNavigate();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-lg shadow-gray-200/50">
      <div className="p-6 pb-8">
        <div className="flex items-center">
          <div className="relative h-12 w-36">
            <Image
              src="/ezprep-logo-1.png"
              alt="EzPrep"
              fill
              className="object-contain object-center"
              priority
            />
          </div>
        </div>
      </div>

      {showOfferCallout ? (
        <div className="px-4 pb-2 -mt-2">
          <OfferCallout className="py-3" />
        </div>
      ) : null}

      <nav className="flex-1 overflow-y-auto px-4 pb-4 space-y-1.5">
        {navigationItems.map((item) => {
          const Icon = iconMap[item.icon];
          const isActive = pathname === item.href;

          return (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.href)}
              className={cn(
                'w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-200 text-left group',
                isActive
                  ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white font-medium shadow-md shadow-teal-200'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <Icon className={cn(
                'w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110',
                isActive ? 'text-white' : 'text-gray-400 group-hover:text-teal-500'
              )} />
              <span className="flex-1 truncate">{item.label}</span>
              {item.id === 'current-affairs' && showCurrentAffairsBadge ? (
                <span className="relative flex h-2.5 w-2.5 shrink-0">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-white" />
                </span>
              ) : null}
              {item.badge && (
                <Badge className="bg-emerald-500 text-white text-xs px-2.5 py-0.5 hover:bg-emerald-600 font-semibold shadow-sm">
                  {item.badge}
                </Badge>
              )}
            </button>
          );
        })}
      </nav>

      <SupportSection />

      <div className="p-4 pt-2">
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200 group"
        >
          <LogOut className="w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
