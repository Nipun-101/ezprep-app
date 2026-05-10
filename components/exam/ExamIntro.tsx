'use client';

import { BookOpen } from 'lucide-react';

interface ExamIntroProps {
  name: string;
  description: string;
}

export default function ExamIntro({ name, description }: ExamIntroProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
      <div className="flex items-start gap-6">
        <div className="w-20 h-20 rounded-full flex items-center justify-center flex-shrink-0 border-4 border-red-500 bg-red-100">
          <BookOpen className="w-10 h-10 text-red-600" />
        </div>

        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{name}</h1>
          <p className="text-gray-700 leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  );
}
