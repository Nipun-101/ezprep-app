'use client';

import { AIRecommendation } from '@/lib/profileData';
import { AlertTriangle, Lightbulb, Star, Target, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface Props {
  recommendations: AIRecommendation[];
  highPriorityCount: number;
}

const typeConfig = {
  warning: {
    icon: AlertTriangle,
    bg: 'bg-red-50',
    border: 'border-red-200',
    iconColor: 'text-red-500',
    badge: 'bg-red-100 text-red-700',
    label: 'Urgent Focus',
  },
  focus: {
    icon: Target,
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    iconColor: 'text-amber-500',
    badge: 'bg-amber-100 text-amber-700',
    label: 'Focus Area',
  },
  tip: {
    icon: Lightbulb,
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    iconColor: 'text-blue-500',
    badge: 'bg-blue-100 text-blue-700',
    label: 'Tip',
  },
  strength: {
    icon: Star,
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    iconColor: 'text-emerald-500',
    badge: 'bg-emerald-100 text-emerald-700',
    label: 'Strength',
  },
};

function RecommendationCard({ rec }: { rec: AIRecommendation }) {
  const [expanded, setExpanded] = useState(false);
  const config = typeConfig[rec.type];
  const Icon = config.icon;

  return (
    <div className={cn('rounded-xl border p-3.5 cursor-pointer transition-colors', config.bg, config.border)}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-start gap-2.5">
        <div className={cn('w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5', config.badge)}>
          <Icon className={cn('w-3.5 h-3.5', config.iconColor)} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full', config.badge)}>
              {config.label}
            </span>
            {expanded
              ? <ChevronUp className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              : <ChevronDown className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            }
          </div>
          <p className="text-xs font-medium text-gray-800 mt-1">
            {rec.subject}{rec.topic ? ` — ${rec.topic}` : ''}
          </p>
          {expanded && (
            <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">{rec.message}</p>
          )}
          {!expanded && (
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{rec.message}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AIRecommendationsPanel({ recommendations, highPriorityCount }: Props) {
  const ordered = [
    ...recommendations.filter(r => r.type === 'warning'),
    ...recommendations.filter(r => r.type === 'focus'),
    ...recommendations.filter(r => r.type === 'tip'),
    ...recommendations.filter(r => r.type === 'strength'),
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      {highPriorityCount > 0 && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5 mb-4">
          <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <p className="text-xs font-medium text-red-700">
            {highPriorityCount} high-priority area{highPriorityCount > 1 ? 's' : ''} need immediate attention
          </p>
        </div>
      )}

      <div className="space-y-2.5">
        {ordered.map((rec, i) => (
          <RecommendationCard key={i} rec={rec} />
        ))}
      </div>
    </div>
  );
}
