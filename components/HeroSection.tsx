'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';

export default function HeroSection() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(isAuthenticated());
  }, []);

  const handleStartFreeTrial = () => {
    if (isLoggedIn) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  };

  const handleViewAllExams = () => {
    if (isLoggedIn) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  };

  return (
    <>
      <section className="relative bg-gradient-to-br from-teal-100 via-teal-200 to-emerald-200 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-32 h-32 bg-teal-300 rounded-full"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-emerald-300 rounded-full"></div>
          <div className="absolute bottom-20 left-1/4 w-20 h-20 bg-teal-400 rounded-full"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                Crack Your Dream{' '}
                <span className="text-teal-600">Government Exams</span>
              </h1>

              <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto lg:mx-0">
                Master competitive exams with AI-powered mock tests, expert faculty guidance,
                and comprehensive practice sessions tailored for your success.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
                {!isLoggedIn && (
                  <button
                    onClick={handleStartFreeTrial}
                    className="bg-teal-500 hover:bg-teal-600 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all transform hover:scale-105 shadow-lg"
                  >
                    Start Free Trial
                  </button>
                )}
                <button
                  onClick={handleViewAllExams}
                  className="border-2 border-teal-500 text-teal-600 hover:bg-teal-50 px-8 py-4 rounded-lg font-semibold text-lg transition-all"
                >
                  View All Exams
                </button>
              </div>

              <div className="flex flex-wrap justify-center lg:justify-start gap-6 md:gap-8">
                <div className="flex items-center space-x-2 text-gray-700">
                  <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                  <span className="font-medium">50,000+ Questions</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-700">
                  <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                  <span className="font-medium">Expert Faculty</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-700">
                  <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                  <span className="font-medium">AI Analysis</span>
                </div>
              </div>
            </div>

            <div className="hidden lg:block">
              <div className="relative w-full aspect-[4/3] max-w-[32rem] lg:max-w-none ml-auto">
                <Image
                  src="/ezprep-banner-image-1.png"
                  alt="Student studying for government exams with EzPrep"
                  fill
                  className="rounded-xl object-cover shadow-md shadow-teal-900/10"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
