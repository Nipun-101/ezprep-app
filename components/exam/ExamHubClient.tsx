'use client';

import Link from 'next/link';
import { Clock, HelpCircle, BookMarked, Layers, BookOpen, FileText, Zap } from 'lucide-react';
import ExamIntro from './ExamIntro';
import ExamAccessCta from './access/ExamAccessCta';
import { useExamPage } from './ExamLayoutClient';
import { ApiExamSubject } from '@/lib/api/exams';

function formatDuration(minutes?: number): string {
  if (!minutes) return '—';
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
}

function subjectName(row: ApiExamSubject): string {
  return row.name?.trim() || 'Subject';
}

export default function ExamHubClient() {
  const { examId, exam, loading, error } = useExamPage();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-600 border-t-transparent" />
      </div>
    );
  }

  if (error || !exam) {
    return (
      <div className="rounded-xl bg-red-50 border border-red-200 p-6 text-center text-red-600">
        {error || 'Exam not found.'}
      </div>
    );
  }

  const subjects = exam.subjects ?? [];

  return (
    <div className="space-y-6">
      <ExamIntro name={exam.name} description={exam.description || ''} />

      <ExamAccessCta examId={examId} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={Clock} label="Duration" value={formatDuration(exam.duration)} />
        <StatCard
          icon={HelpCircle}
          label="Questions"
          value={exam.totalQuestions != null ? String(exam.totalQuestions) : '—'}
        />
        <StatCard
          icon={BookMarked}
          label="Total Marks"
          value={exam.totalMarks != null ? String(exam.totalMarks) : '—'}
        />
        <StatCard
          icon={Layers}
          label="Mode"
          value={exam.isSessionWise ? 'Session-wise' : 'Mixed'}
        />
      </div>

      <section className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Exam Structure</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Subject-wise paper pattern for this exam
          </p>
        </div>
        {subjects.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-gray-500">
            Structure for this exam will be available soon.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-gray-500">
                  <th className="px-5 py-3 font-medium">Subject</th>
                  <th className="px-5 py-3 font-medium">Questions</th>
                  <th className="px-5 py-3 font-medium">Marks / Q</th>
                  <th className="px-5 py-3 font-medium">Negative</th>
                  {exam.isSessionWise && (
                    <th className="px-5 py-3 font-medium">Session time</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {subjects.map((row, i) => (
                  <tr key={`${row.subject}-${i}`} className="text-gray-800">
                    <td className="px-5 py-3 font-medium">{subjectName(row)}</td>
                    <td className="px-5 py-3">{row.numberOfQuestions}</td>
                    <td className="px-5 py-3">{row.marksPerQuestion}</td>
                    <td className="px-5 py-3">
                      {row.hasNegativeMarking
                        ? `-${row.negativeMarksPerQuestion}`
                        : 'None'}
                    </td>
                    {exam.isSessionWise && (
                      <td className="px-5 py-3">
                        {row.sessionTime != null ? `${row.sessionTime} min` : '—'}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <Link
          href={`/dashboard/exam/${examId}/practice`}
          className="group bg-white rounded-xl border border-gray-200 p-6 hover:border-teal-400 hover:shadow-md transition"
        >
          <div className="w-11 h-11 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center mb-4">
            <BookOpen className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-teal-700">
            Topic Wise Tests
          </h3>
          <p className="text-sm text-gray-500">
            Topic-wise drills to master one subject at a time.
          </p>
        </Link>
        <Link
          href={`/dashboard/exam/${examId}/full-mocks`}
          className="group bg-white rounded-xl border border-gray-200 p-6 hover:border-teal-400 hover:shadow-md transition"
        >
          <div className="w-11 h-11 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
            <FileText className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-indigo-700">
            Full Mock Tests
          </h3>
          <p className="text-sm text-gray-500">
            Complete exam simulation with the real paper pattern.
          </p>
        </Link>
        <Link
          href={`/dashboard/exam/${examId}/sprint-tests`}
          className="group bg-white rounded-xl border border-gray-200 p-6 hover:border-teal-400 hover:shadow-md transition"
        >
          <div className="w-11 h-11 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center mb-4">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-amber-800">
            Sprint Tests
          </h3>
          <p className="text-sm text-gray-500">
            Short timed papers to build speed on this exam.
          </p>
        </Link>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center gap-2 text-gray-500 mb-1">
        <Icon className="w-4 h-4" />
        <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-lg font-bold text-gray-900">{value}</p>
    </div>
  );
}
