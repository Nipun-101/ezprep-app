'use client';

import { SubjectPerf, AIRecommendation } from '@/lib/profileData';
import {
  TrendingUp, TrendingDown, Minus, X, AlertTriangle, CheckCircle2,
  Clock, BarChart3, Target, Lightbulb, Star
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';

interface Props {
  subject: SubjectPerf;
  recommendations: AIRecommendation[];
  onClose: () => void;
}

function getBarColor(score: number) {
  if (score >= 80) return 'bg-emerald-500';
  if (score >= 65) return 'bg-teal-500';
  if (score >= 50) return 'bg-amber-400';
  return 'bg-red-400';
}

function getScoreColor(score: number) {
  if (score >= 80) return 'text-emerald-600';
  if (score >= 65) return 'text-teal-600';
  if (score >= 50) return 'text-amber-600';
  return 'text-red-500';
}

function getLabel(score: number) {
  if (score >= 80) return { text: 'Strong', bg: 'bg-emerald-100 text-emerald-700' };
  if (score >= 65) return { text: 'Good', bg: 'bg-teal-100 text-teal-700' };
  if (score >= 50) return { text: 'Average', bg: 'bg-amber-100 text-amber-700' };
  return { text: 'Needs Work', bg: 'bg-red-100 text-red-700' };
}

function TrendBadge({ trend }: { trend: 'up' | 'down' | 'stable' }) {
  if (trend === 'up') return (
    <span className="flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
      <TrendingUp className="w-3 h-3" /> Improving
    </span>
  );
  if (trend === 'down') return (
    <span className="flex items-center gap-1 text-xs text-red-500 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
      <TrendingDown className="w-3 h-3" /> Declining
    </span>
  );
  return (
    <span className="flex items-center gap-1 text-xs text-gray-500 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-200">
      <Minus className="w-3 h-3" /> Stable
    </span>
  );
}

const recTypeConfig = {
  warning: { icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50 border-red-200' },
  focus: { icon: Target, color: 'text-amber-500', bg: 'bg-amber-50 border-amber-200' },
  tip: { icon: Lightbulb, color: 'text-blue-500', bg: 'bg-blue-50 border-blue-200' },
  strength: { icon: Star, color: 'text-emerald-500', bg: 'bg-emerald-50 border-emerald-200' },
};

export default function TopicDetailDrawer({ subject, recommendations, onClose }: Props) {
  const sortedTopics = [...subject.topics].sort((a, b) => a.score - b.score);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex" onClick={onClose}>
      <div className="flex-1 bg-black/40 backdrop-blur-sm" />
      <div
        className="w-full max-w-lg bg-white h-full overflow-y-auto shadow-2xl flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="font-bold text-gray-900 text-base">{subject.subject}</h2>
            <p className="text-xs text-gray-500 mt-0.5">Full topic-level analysis</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-center gap-4 bg-gray-50 rounded-xl p-4">
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Overall Score</p>
              <p className={cn('text-3xl font-bold', getScoreColor(subject.score))}>{subject.score}%</p>
            </div>
            <div className="flex-1">
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={cn('h-3 rounded-full', getBarColor(subject.score))}
                  style={{ width: `${subject.score}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>0</span><span>50</span><span>100</span>
              </div>
            </div>
            <TrendBadge trend={subject.trend} />
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-teal-500" />
              All Topics (sorted by score)
            </h3>
            <div className="space-y-3">
              {sortedTopics.map((topic) => {
                const label = getLabel(topic.score);
                return (
                  <div key={topic.topic} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {topic.score < 60
                            ? <AlertTriangle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                            : topic.score >= 75
                            ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                            : <Minus className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                          }
                          <p className="text-sm font-medium text-gray-800 truncate">{topic.topic}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', label.bg)}>
                            {label.text}
                          </span>
                          <TrendBadge trend={topic.trend} />
                        </div>
                      </div>
                      <p className={cn('text-xl font-bold flex-shrink-0 ml-3', getScoreColor(topic.score))}>
                        {topic.score}%
                      </p>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
                      <div
                        className={cn('h-1.5 rounded-full', getBarColor(topic.score))}
                        style={{ width: `${topic.score}%` }}
                      />
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <BarChart3 className="w-3 h-3" />
                        {topic.attempts} attempt{topic.attempts !== 1 ? 's' : ''}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {topic.lastAttempted}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {recommendations.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Target className="w-4 h-4 text-teal-500" />
                AI Recommendations for this Subject
              </h3>
              <div className="space-y-2.5">
                {recommendations.map((rec, i) => {
                  const config = recTypeConfig[rec.type];
                  const Icon = config.icon;
                  return (
                    <div key={i} className={cn('rounded-xl border p-3.5', config.bg)}>
                      <div className="flex items-start gap-2.5">
                        <Icon className={cn('w-4 h-4 flex-shrink-0 mt-0.5', config.color)} />
                        <div>
                          {rec.topic && (
                            <p className="text-xs font-semibold text-gray-700 mb-1">{rec.topic}</p>
                          )}
                          <p className="text-xs text-gray-600 leading-relaxed">{rec.message}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
