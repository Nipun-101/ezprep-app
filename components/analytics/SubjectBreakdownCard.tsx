'use client';

import { SubjectPerf } from '@/lib/profileData';
import { TrendingUp, TrendingDown, Minus, ChevronRight, AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  subject: SubjectPerf;
  onViewTopics: () => void;
}

const SCORE_THRESHOLDS = { strong: 75, decent: 60 };

function getLabel(score: number): { text: string; color: string; bg: string } {
  if (score >= 80) return { text: 'Strong', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' };
  if (score >= 65) return { text: 'Good', color: 'text-teal-700', bg: 'bg-teal-50 border-teal-200' };
  if (score >= 50) return { text: 'Average', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' };
  return { text: 'Needs Work', color: 'text-red-700', bg: 'bg-red-50 border-red-200' };
}

function getBarColor(score: number) {
  if (score >= 80) return 'bg-emerald-500';
  if (score >= 65) return 'bg-teal-500';
  if (score >= 50) return 'bg-amber-400';
  return 'bg-red-400';
}

function TrendIcon({ trend }: { trend: 'up' | 'down' | 'stable' }) {
  if (trend === 'up') return <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />;
  if (trend === 'down') return <TrendingDown className="w-3.5 h-3.5 text-red-400" />;
  return <Minus className="w-3.5 h-3.5 text-gray-400" />;
}

export default function SubjectBreakdownCard({ subject, onViewTopics }: Props) {
  const label = getLabel(subject.score);
  const weakTopics = subject.topics.filter(t => t.score < 60);
  const strongTopics = subject.topics.filter(t => t.score >= 75);

  const sortedTopics = [...subject.topics].sort((a, b) => a.score - b.score);
  const previewTopics = sortedTopics.slice(0, 4);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">{subject.subject}</h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <TrendIcon trend={subject.trend} />
                <span className="text-xs text-gray-500">
                  {subject.trend === 'up' ? 'Improving' : subject.trend === 'down' ? 'Declining' : 'Stable'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={cn('text-xs font-medium px-2.5 py-1 rounded-full border', label.bg, label.color)}>
              {label.text}
            </span>
            <span className="text-2xl font-bold text-gray-900">{subject.score}%</span>
          </div>
        </div>

        <div className="w-full bg-gray-100 rounded-full h-2 mb-4">
          <div
            className={cn('h-2 rounded-full transition-all', getBarColor(subject.score))}
            style={{ width: `${subject.score}%` }}
          />
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4">
          {previewTopics.map((topic) => {
            const tLabel = getLabel(topic.score);
            return (
              <div key={topic.topic} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  {topic.score < 60
                    ? <AlertTriangle className="w-3 h-3 text-red-400 flex-shrink-0" />
                    : topic.score >= 75
                    ? <CheckCircle2 className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                    : <Minus className="w-3 h-3 text-gray-400 flex-shrink-0" />
                  }
                  <span className="text-xs text-gray-700 truncate">{topic.topic}</span>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                  <TrendIcon trend={topic.trend} />
                  <span className={cn('text-xs font-semibold', tLabel.color)}>{topic.score}%</span>
                </div>
              </div>
            );
          })}
        </div>

        {(weakTopics.length > 0 || strongTopics.length > 0) && (
          <div className="flex gap-3 mb-4">
            {weakTopics.length > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-red-600 bg-red-50 px-2.5 py-1 rounded-full border border-red-100">
                <AlertTriangle className="w-3 h-3" />
                {weakTopics.length} weak topic{weakTopics.length > 1 ? 's' : ''}
              </div>
            )}
            {strongTopics.length > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                <CheckCircle2 className="w-3 h-3" />
                {strongTopics.length} strong topic{strongTopics.length > 1 ? 's' : ''}
              </div>
            )}
          </div>
        )}

        <button
          onClick={onViewTopics}
          className="w-full flex items-center justify-center gap-2 text-sm font-medium text-teal-600 hover:text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-xl py-2.5 transition-colors"
        >
          View Full Topic Analysis
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
