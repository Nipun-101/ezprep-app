'use client';

import {
  FileText, StickyNote, ListChecks, History, BookOpen, Sigma,
  Download, Eye, Lock, Star, Languages, FileStack,
} from 'lucide-react';
import type { StudyMaterial, MaterialType } from '@/lib/studyMaterialsData';

const typeIcons: Record<MaterialType, React.ElementType> = {
  pdf: FileText,
  notes: StickyNote,
  syllabus: ListChecks,
  pyq: History,
  book: BookOpen,
  formula: Sigma,
};

const typeStyles: Record<MaterialType, { bg: string; text: string; label: string }> = {
  pdf: { bg: 'bg-red-50', text: 'text-red-600', label: 'PDF' },
  notes: { bg: 'bg-amber-50', text: 'text-amber-600', label: 'Notes' },
  syllabus: { bg: 'bg-teal-50', text: 'text-teal-600', label: 'Syllabus' },
  pyq: { bg: 'bg-blue-50', text: 'text-blue-600', label: 'PYQ' },
  book: { bg: 'bg-emerald-50', text: 'text-emerald-600', label: 'Book' },
  formula: { bg: 'bg-orange-50', text: 'text-orange-600', label: 'Formula' },
};

function formatDownloads(n: number) {
  if (n >= 100000) return `${(n / 1000).toFixed(0)}K`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return `${n}`;
}

interface Props {
  material: StudyMaterial;
  accentText: string;
}

export default function MaterialCard({ material, accentText }: Props) {
  const Icon = typeIcons[material.type];
  const style = typeStyles[material.type];

  return (
    <div className="group bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-md hover:border-gray-200 transition-all duration-200 flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-xl ${style.bg} flex items-center justify-center shrink-0`}>
          <Icon className={`w-5 h-5 ${style.text}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 flex-wrap">
            <h4 className="text-sm font-semibold text-gray-900 leading-snug">{material.title}</h4>
            {material.isNew && (
              <span className="inline-flex items-center gap-1 bg-teal-50 text-teal-600 text-[10px] font-bold px-2 py-0.5 rounded-full border border-teal-200 shrink-0">
                <Star className="w-2.5 h-2.5" /> NEW
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed line-clamp-2">{material.description}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <span className={`inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-md ${style.bg} ${style.text}`}>
          {style.label}
        </span>
        <span className="inline-flex items-center gap-1 text-[11px] text-gray-500 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">
          <FileStack className="w-3 h-3" /> {material.pages}p
        </span>
        <span className="inline-flex items-center gap-1 text-[11px] text-gray-500 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">
          <Languages className="w-3 h-3" /> {material.language}
        </span>
        <span className="inline-flex items-center gap-1 text-[11px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">
          {material.fileSize}
        </span>
        {material.tags.slice(0, 2).map(tag => (
          <span key={tag} className="inline-flex text-[11px] text-gray-500 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">
            {tag}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between pt-1 border-t border-gray-50">
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <Download className="w-3.5 h-3.5" />
          <span>{formatDownloads(material.downloads)} downloads</span>
          <span className="mx-1">·</span>
          <span>{material.uploadedDate}</span>
        </div>
        {material.isFree ? (
          <button
            className={`flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white transition-all active:scale-95 shadow-sm`}
          >
            <Download className="w-3.5 h-3.5" />
            Download
          </button>
        ) : (
          <button className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition-all active:scale-95 border border-gray-200">
            <Lock className="w-3.5 h-3.5" />
            Unlock
          </button>
        )}
      </div>
    </div>
  );
}
