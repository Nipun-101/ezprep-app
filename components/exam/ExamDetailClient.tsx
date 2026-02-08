'use client';

import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import ExamIntro from './ExamIntro';
import PracticeTestCard from './PracticeTestCard';
import MockTestCard from './MockTestCard';
import { Button } from '@/components/ui/button';
import { ExamDetail, Exam } from '@/lib/mockData';
import { ArrowLeft, ChevronRight } from 'lucide-react';

interface ExamDetailClientProps {
  examDetail: ExamDetail | null;
  currentExam: Exam | undefined;
  examId: string;
}

export default function ExamDetailClient({ examDetail, currentExam, examId }: ExamDetailClientProps) {
  const router = useRouter();

  if (!examDetail || !currentExam) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Exam Not Found</h1>
          <p className="text-gray-600 mb-6">The exam you're looking for doesn't exist or is not available yet.</p>
          <Button onClick={() => router.push('/dashboard')} className="bg-teal-500 hover:bg-teal-600">
            Back to Dashboard
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const handleStartPracticeTest = (testId: string) => {
    console.log('Starting practice test:', testId);
  };

  const handleStartMockTest = (testId: string) => {
    console.log('Starting mock test:', testId);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <button
          onClick={() => router.push('/dashboard')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="font-medium">Back to Dashboard</span>
        </button>

        <ExamIntro
          name={examDetail.name}
          iconType={examDetail.iconType}
          description={examDetail.description}
          totalTests={examDetail.totalTests}
          totalStudents={examDetail.totalStudents}
        />

        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Daily Practice Tests</h2>
              <p className="text-gray-600">Master topics with focused practice tests</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {examDetail.practiceTests.map((test) => (
              <PracticeTestCard
                key={test.id}
                test={test}
                onStart={() => handleStartPracticeTest(test.id)}
              />
            ))}
          </div>

          <div className="flex justify-center">
            <Button
              variant="outline"
              className="border-teal-500 text-teal-600 hover:bg-teal-50"
            >
              View More Tests
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Full Mock Tests</h2>
              <p className="text-gray-600">Complete exam simulation for better preparation</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {examDetail.mockTests.map((test) => (
              <MockTestCard
                key={test.id}
                test={test}
                onStart={() => handleStartMockTest(test.id)}
              />
            ))}
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
