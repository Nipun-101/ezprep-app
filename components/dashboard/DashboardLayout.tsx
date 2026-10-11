'use client';

import { useState } from 'react';
import Sidebar from './Sidebar';
import DashboardHeader from './DashboardHeader';
import { Sheet, SheetContent } from '@/components/ui/sheet';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-teal-50/30">
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col lg:pl-6 lg:py-6">
        <Sidebar />
      </div>

      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="p-0 w-72">
          <Sidebar
            onNavigate={() => setIsMobileMenuOpen(false)}
            showOfferCallout
          />
        </SheetContent>
      </Sheet>

      <div className="lg:pl-72">
        <DashboardHeader onMenuClick={() => setIsMobileMenuOpen(true)} />

        <main className="py-6 px-4 lg:px-10 lg:py-8 max-w-[1600px]">
          {children}
        </main>
      </div>
    </div>
  );
}
