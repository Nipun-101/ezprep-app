'use client';

import DashboardLayout from '@/components/dashboard/DashboardLayout';
import ComingSoon from '@/components/dashboard/ComingSoon';
import { Video } from 'lucide-react';

export default function ConceptVideosPage() {
  return (
    <DashboardLayout>
      <ComingSoon
        icon={Video}
        title="Concept Videos"
        description="High-quality educational videos to master key concepts"
      />
    </DashboardLayout>
  );
}
