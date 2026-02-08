'use client';

import { LucideIcon } from 'lucide-react';

interface ComingSoonProps {
  icon: LucideIcon;
  title: string;
  description?: string;
}

export default function ComingSoon({ icon: Icon, title, description }: ComingSoonProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="w-24 h-24 bg-gradient-to-br from-teal-100 to-teal-200 rounded-full flex items-center justify-center mb-6">
        <Icon className="w-12 h-12 text-teal-600" />
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-3">{title}</h1>
      <p className="text-lg text-gray-600 mb-4">
        {description || 'This feature is under development'}
      </p>
      <div className="inline-block bg-teal-100 text-teal-700 px-6 py-3 rounded-full font-semibold text-lg">
        Coming Soon
      </div>
    </div>
  );
}
