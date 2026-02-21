'use client';

import StudyMaterialsView from '@/components/study-materials/StudyMaterialsView';

export default function StudyMaterialsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-teal-50/30">
      <div className="max-w-6xl mx-auto py-8 px-4 lg:px-8">
        <StudyMaterialsView />
      </div>
    </div>
  );
}
