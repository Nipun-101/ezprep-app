'use client';

import { UserProfile } from '@/lib/profileData';
import { TrendingUp, Target, AlertTriangle, CheckCircle2, Clock, BarChart3 } from 'lucide-react';

interface Props {
  profile: UserProfile;
  weakAreas: number;
  strongAreas: number;
}

export default function OverallScoreCard({ profile, weakAreas, strongAreas }: Props) {
  const avgSubjectScore = Math.round(
    profile.subjectPerformance.reduce((sum, s) => sum + s.score, 0) / profile.subjectPerformance.length
  );

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600';
    if (score >= 65) return 'text-amber-600';
    return 'text-red-500';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'from-emerald-500 to-teal-500';
    if (score >= 65) return 'from-amber-400 to-orange-400';
    return 'from-red-400 to-rose-500';
  };

  const examDaysLeft = 87;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-xl p-4 border border-teal-100">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-4 h-4 text-teal-600" />
            <span className="text-xs font-medium text-teal-600 uppercase tracking-wide">Avg Score</span>
          </div>
          <p className={`text-3xl font-bold ${getScoreColor(avgSubjectScore)}`}>{avgSubjectScore}%</p>
          <p className="text-xs text-gray-500 mt-1">across all subjects</p>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl p-4 border border-red-100">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <span className="text-xs font-medium text-red-500 uppercase tracking-wide">Weak Areas</span>
          </div>
          <p className="text-3xl font-bold text-red-500">{weakAreas}</p>
          <p className="text-xs text-gray-500 mt-1">need attention</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-medium text-emerald-600 uppercase tracking-wide">Strong Areas</span>
          </div>
          <p className="text-3xl font-bold text-emerald-600">{strongAreas}</p>
          <p className="text-xs text-gray-500 mt-1">performing well</p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-100">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-medium text-blue-600 uppercase tracking-wide">Exam In</span>
          </div>
          <p className="text-3xl font-bold text-blue-600">{examDaysLeft}</p>
          <p className="text-xs text-gray-500 mt-1">days remaining</p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-teal-600 to-emerald-500 rounded-xl p-4 text-white">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
            <Target className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-semibold text-sm mb-1">AI Summary for {profile.targetExam}</p>
            <p className="text-white/90 text-sm leading-relaxed">
              You are performing well in English ({profile.subjectPerformance[1].score}%) and General Intelligence ({profile.subjectPerformance[3].score}%).
              Your biggest opportunity is Quantitative Aptitude ({profile.subjectPerformance[0].score}%) — specifically Trigonometry and Algebra.
              Focusing 40% of your daily study time on Quant topics for the next 2 weeks can push your overall score above 80%.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
