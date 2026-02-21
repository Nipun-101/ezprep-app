'use client';

import { useState } from 'react';
import { dummyProfile, aiRecommendations } from '@/lib/profileData';
import OverallScoreCard from './OverallScoreCard';
import SubjectBreakdownCard from './SubjectBreakdownCard';
import AIRecommendationsPanel from './AIRecommendationsPanel';
import TopicDetailDrawer from './TopicDetailDrawer';
import { SubjectPerf } from '@/lib/profileData';
import { Brain, Sparkles } from 'lucide-react';

export default function AIAnalyticsDashboard() {
  const [selectedSubject, setSelectedSubject] = useState<SubjectPerf | null>(null);

  const highPriority = aiRecommendations.filter(r => r.priority === 'high');
  const strengths = aiRecommendations.filter(r => r.type === 'strength');
  const weaknesses = aiRecommendations.filter(r => r.type === 'warning' || r.type === 'focus');

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-lg flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">AI Analytics</h1>
          </div>
          <p className="text-gray-500 text-sm ml-10">
            Personalized insights for {dummyProfile.name} &middot; Target: {dummyProfile.targetExam}
          </p>
        </div>
        <div className="flex items-center gap-1.5 bg-teal-50 border border-teal-200 text-teal-700 text-xs font-medium px-3 py-1.5 rounded-full">
          <Sparkles className="w-3.5 h-3.5" />
          AI Powered
        </div>
      </div>

      <OverallScoreCard profile={dummyProfile} weakAreas={weaknesses.length} strongAreas={strengths.length} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-base font-semibold text-gray-800">Subject & Topic Breakdown</h2>
          {dummyProfile.subjectPerformance.map((subject) => (
            <SubjectBreakdownCard
              key={subject.subject}
              subject={subject}
              onViewTopics={() => setSelectedSubject(subject)}
            />
          ))}
        </div>

        <div className="space-y-4">
          <h2 className="text-base font-semibold text-gray-800">AI Recommendations</h2>
          <AIRecommendationsPanel
            recommendations={aiRecommendations}
            highPriorityCount={highPriority.length}
          />
        </div>
      </div>

      {selectedSubject && (
        <TopicDetailDrawer
          subject={selectedSubject}
          recommendations={aiRecommendations.filter(r => r.subject === selectedSubject.subject)}
          onClose={() => setSelectedSubject(null)}
        />
      )}
    </div>
  );
}
