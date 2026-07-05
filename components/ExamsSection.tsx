'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { isAuthenticated } from '@/lib/auth';
import ExamCard from './ExamCard';
import { ApiExamGroupCategory } from '@/lib/api/exams';

interface ExamsSectionProps {
  categories: ApiExamGroupCategory[];
}

export default function ExamsSection({ categories }: ExamsSectionProps) {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeCategory, setActiveCategory] = useState(categories[0]?.id ?? '');

  useEffect(() => {
    setIsLoggedIn(isAuthenticated());
  }, []);

  const handleViewAllExams = () => {
    router.push(isLoggedIn ? '/dashboard' : '/login');
  };

  const active = categories.find((c) => c.id === activeCategory) ?? categories[0];

  return (
    <section className="bg-gray-50 py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Explore Popular Exams
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Choose from our comprehensive collection of competitive exam preparations
          </p>
        </div>

        {categories.length === 0 ? (
          <p className="text-center text-gray-500 py-12">Exam listings will be available soon.</p>
        ) : (
          <>
            <div className="bg-gray-100 rounded-xl p-1 flex flex-wrap gap-1 mb-8">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center space-x-2 flex-1 min-w-[calc(33.333%-4px)] sm:flex-none sm:min-w-0 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200 text-center leading-snug whitespace-nowrap ${
                    activeCategory === cat.id
                      ? 'bg-white text-gray-900 shadow-sm font-semibold'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <div className="w-5 h-5 rounded overflow-hidden flex-shrink-0">
                    <Image
                      src={cat.imageUrl}
                      alt={cat.shortName}
                      width={20}
                      height={20}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  </div>
                  <span>{cat.shortName}</span>
                </button>
              ))}
            </div>

            {active && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-10">
                {active.examGroups.map((examGroup) => (
                  <ExamCard
                    key={examGroup.id}
                    id={examGroup.id}
                    name={examGroup.name}
                    shortName={examGroup.shortName}
                    imageUrl={active.imageUrl}
                    categoryName={active.name}
                    categoryShortName={active.shortName}
                  />
                ))}
              </div>
            )}

            <div className="text-center">
              <button
                onClick={handleViewAllExams}
                className="text-teal-600 hover:text-teal-700 font-semibold text-lg transition-colors inline-flex items-center space-x-2 group"
              >
                <span>View All Exams</span>
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
