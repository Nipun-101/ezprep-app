'use client';

import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  BookOpen,
  Video,
  FileText,
  Users,
  Search,
  Bookmark,
  CreditCard,
  Zap,
  Award,
  LogOut
} from 'lucide-react';
import { navigationItems } from '@/lib/mockData';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const iconMap: Record<string, any> = {
  LayoutDashboard,
  BookOpen,
  Video,
  FileText,
  Users,
  Search,
  Bookmark,
  CreditCard,
  Zap,
  Award,
};

interface SidebarProps {
  onNavigate?: () => void;
}

export default function Sidebar({ onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleNavigation = (href: string) => {
    router.push(href);
    if (onNavigate) {
      onNavigate();
    }
  };

  const handleLogout = () => {
    router.push('/');
    if (onNavigate) {
      onNavigate();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-teal-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">E</span>
          </div>
          <span className="text-2xl font-bold">
            <span className="text-teal-500">eprep</span>
          </span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {navigationItems.map((item) => {
          const Icon = iconMap[item.icon];
          const isActive = pathname === item.href;

          return (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.href)}
              className={cn(
                'w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all text-left',
                isActive
                  ? 'bg-teal-50 text-teal-600 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="flex-1 truncate">{item.label}</span>
              {item.badge && (
                <Badge className="bg-emerald-500 text-white text-xs px-2 py-0.5 hover:bg-emerald-600">
                  {item.badge}
                </Badge>
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-all"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
