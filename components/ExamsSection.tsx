'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';
import ExamCard from './ExamCard';

const examsData = [
  {
    id: '1',
    title: 'SBI PO',
    fullName: 'State Bank of India Probationary Officer',
    difficulty: 'Medium' as const,
    testsCount: 45,
    studentsCount: '120K+',
    duration: '3hrs',
    acronym: 'SBI'
  },
  {
    id: '2',
    title: 'IBPS PO',
    fullName: 'Institute of Banking Personnel Selection',
    difficulty: 'Medium' as const,
    testsCount: 52,
    studentsCount: '89K+',
    duration: '3hrs',
    acronym: 'IBPS'
  },
  {
    id: '3',
    title: 'SSC CGL',
    fullName: 'Staff Selection Commission Combined Graduate',
    difficulty: 'Hard' as const,
    testsCount: 67,
    studentsCount: '245K+',
    duration: '2hrs',
    acronym: 'SSC'
  },
  {
    id: '4',
    title: 'SBI Clerk',
    fullName: 'State Bank of India Clerk',
    difficulty: 'Easy' as const,
    testsCount: 38,
    studentsCount: '156K+',
    duration: '2.5hrs',
    acronym: 'SBI'
  },
  {
    id: '5',
    title: 'IBPS Clerk',
    fullName: 'Institute of Banking Personnel Selection',
    difficulty: 'Easy' as const,
    testsCount: 41,
    studentsCount: '92K+',
    duration: '2.5hrs',
    acronym: 'IBPS'
  },
  {
    id: '6',
    title: 'UPSC CSE',
    fullName: 'Union Public Service Commission Civil Services',
    difficulty: 'Hard' as const,
    testsCount: 125,
    studentsCount: '78K+',
    duration: '6hrs',
    acronym: 'UPSC'
  },
  {
    id: '7',
    title: 'Railway NTPC',
    fullName: 'Railway Non-Technical Popular Categories',
    difficulty: 'Medium' as const,
    testsCount: 55,
    studentsCount: '134K+',
    duration: '1.5hrs',
    acronym: 'RLY'
  },
  {
    id: '8',
    title: 'NABARD',
    fullName: 'National Bank for Agriculture and Rural Development',
    difficulty: 'Hard' as const,
    testsCount: 29,
    studentsCount: '34K+',
    duration: '3hrs',
    acronym: 'NAB'
  }
];

export default function ExamsSection() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(isAuthenticated());
  }, []);

  const handleViewAllExams = () => {
    if (isLoggedIn) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  };

  return (
    <section className="bg-gray-50 py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Explore Popular Exams
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Choose from our comprehensive collection of competitive exam preparations
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
          {examsData.map((exam) => (
            <ExamCard key={exam.id} {...exam} />
          ))}
        </div>

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
      </div>
    </section>
  );
}