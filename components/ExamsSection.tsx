'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';
import ExamCard from './ExamCard';

const examsByCategory = [
  {
    id: 'banking',
    label: 'Banking',
    exams: [
      { id: '1', title: 'SBI PO', fullName: 'State Bank of India Probationary Officer', difficulty: 'Medium' as const, testsCount: 45, studentsCount: '120K+', duration: '3hrs', acronym: 'SBI' },
      { id: '4', title: 'SBI Clerk', fullName: 'State Bank of India Clerk', difficulty: 'Easy' as const, testsCount: 38, studentsCount: '156K+', duration: '2.5hrs', acronym: 'SBI' },
      { id: '2', title: 'IBPS PO', fullName: 'Institute of Banking Personnel Selection', difficulty: 'Medium' as const, testsCount: 52, studentsCount: '89K+', duration: '3hrs', acronym: 'IBPS' },
      { id: '5', title: 'IBPS Clerk', fullName: 'Institute of Banking Personnel Selection', difficulty: 'Easy' as const, testsCount: 41, studentsCount: '92K+', duration: '2.5hrs', acronym: 'IBPS' },
      { id: '8', title: 'NABARD', fullName: 'National Bank for Agriculture and Rural Development', difficulty: 'Hard' as const, testsCount: 29, studentsCount: '34K+', duration: '3hrs', acronym: 'NAB' },
    ],
  },
  {
    id: 'ssc',
    label: 'SSC',
    exams: [
      { id: '3', title: 'SSC CGL', fullName: 'Staff Selection Commission Combined Graduate', difficulty: 'Hard' as const, testsCount: 67, studentsCount: '245K+', duration: '2hrs', acronym: 'SSC' },
      { id: '9', title: 'SSC CHSL', fullName: 'Staff Selection Commission Higher Secondary Level', difficulty: 'Medium' as const, testsCount: 44, studentsCount: '130K+', duration: '1hr', acronym: 'SSC' },
      { id: '10', title: 'SSC MTS', fullName: 'Staff Selection Commission Multi-Tasking Staff', difficulty: 'Easy' as const, testsCount: 31, studentsCount: '88K+', duration: '1.5hrs', acronym: 'SSC' },
      { id: '11', title: 'SSC CPO', fullName: 'Staff Selection Commission Central Police Organisation', difficulty: 'Medium' as const, testsCount: 36, studentsCount: '72K+', duration: '2hrs', acronym: 'SSC' },
    ],
  },
  {
    id: 'railways',
    label: 'Railways',
    exams: [
      { id: '7', title: 'RRB NTPC', fullName: 'Railway Non-Technical Popular Categories', difficulty: 'Medium' as const, testsCount: 55, studentsCount: '134K+', duration: '1.5hrs', acronym: 'RLY' },
      { id: '12', title: 'RRB Group D', fullName: 'Railway Recruitment Board Group D', difficulty: 'Easy' as const, testsCount: 42, studentsCount: '198K+', duration: '1.5hrs', acronym: 'RLY' },
      { id: '13', title: 'RRB ALP', fullName: 'Railway Recruitment Board Assistant Loco Pilot', difficulty: 'Medium' as const, testsCount: 38, studentsCount: '87K+', duration: '1hrs', acronym: 'RLY' },
      { id: '14', title: 'RRB JE', fullName: 'Railway Recruitment Board Junior Engineer', difficulty: 'Hard' as const, testsCount: 28, studentsCount: '45K+', duration: '2hrs', acronym: 'RLY' },
    ],
  },
  {
    id: 'upsc',
    label: 'UPSC',
    exams: [
      { id: '6', title: 'UPSC CSE', fullName: 'Union Public Service Commission Civil Services', difficulty: 'Hard' as const, testsCount: 125, studentsCount: '78K+', duration: '6hrs', acronym: 'UPSC' },
      { id: '15', title: 'UPSC CDS', fullName: 'Combined Defence Services Examination', difficulty: 'Hard' as const, testsCount: 48, studentsCount: '42K+', duration: '2hrs', acronym: 'UPSC' },
      { id: '16', title: 'UPSC CAPF', fullName: 'Central Armed Police Forces Examination', difficulty: 'Hard' as const, testsCount: 35, studentsCount: '31K+', duration: '4hrs', acronym: 'UPSC' },
    ],
  },
  {
    id: 'state',
    label: 'State PSC',
    exams: [
      { id: '17', title: 'Kerala PSC', fullName: 'Kerala Public Service Commission', difficulty: 'Medium' as const, testsCount: 60, studentsCount: '95K+', duration: '1.5hrs', acronym: 'PSC' },
      { id: '18', title: 'TNPSC Group 2', fullName: 'Tamil Nadu Public Service Commission Group II', difficulty: 'Medium' as const, testsCount: 52, studentsCount: '112K+', duration: '3hrs', acronym: 'PSC' },
      { id: '19', title: 'MPPSC', fullName: 'Madhya Pradesh Public Service Commission', difficulty: 'Hard' as const, testsCount: 44, studentsCount: '58K+', duration: '2hrs', acronym: 'PSC' },
    ],
  },
];

export default function ExamsSection() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeCategory, setActiveCategory] = useState('banking');

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

  const active = examsByCategory.find((c) => c.id === activeCategory) ?? examsByCategory[0];

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

        <div className="flex items-center gap-2 sm:gap-3 mb-8 overflow-x-auto pb-1 scrollbar-none">
          {examsByCategory.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex-shrink-0 px-4 sm:px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
                activeCategory === cat.id
                  ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-teal-400 hover:text-teal-600'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-10">
          {active.exams.map((exam) => (
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
