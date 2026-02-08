'use client';

import DashboardLayout from '@/components/dashboard/DashboardLayout';
import ComingSoon from '@/components/dashboard/ComingSoon';
import { Bookmark } from 'lucide-react';

export default function BookmarksPage() {
  return (
    <DashboardLayout>
      <ComingSoon
        icon={Bookmark}
        title="My Bookmarks"
        description="Save and organize your favorite study materials"
      />
    </DashboardLayout>
  );
}
