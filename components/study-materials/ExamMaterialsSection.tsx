'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, FileStack, Train, Building2, ShieldCheck, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import type { ExamMaterials } from '@/lib/studyMaterialsData';
import { categoryColors } from '@/lib/studyMaterialsData';
import MaterialCard from './MaterialCard';

const categoryIcons: Record<string, React.ElementType> = {
  Railways: Train,
  SSC: Building2,
  'Intelligence Bureau': ShieldCheck,
};

interface Props {
  exam: ExamMaterials;
  defaultOpen?: boolean;
}

export default function ExamMaterialsSection({ exam, defaultOpen = false }: Props) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const colors = categoryColors[exam.color] ?? categoryColors['blue'];
  const CategoryIcon = categoryIcons[exam.category] ?? Building2;
  const freeCount = exam.materials.filter(m => m.isFree).length;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <button
        onClick={() => setIsOpen(v => !v)}
        className="w-full flex items-center justify-between px-6 py-5 hover:bg-gray-50/60 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className={`w-11 h-11 rounded-xl ${colors.bg} ${colors.border} border flex items-center justify-center shrink-0`}>
            <CategoryIcon className={`w-5 h-5 ${colors.text}`} />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-gray-900">{exam.examName}</h3>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${colors.badge}`}>
                {exam.category}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-1">
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <FileStack className="w-3.5 h-3.5" />
                {exam.materials.length} materials
              </span>
              <span className="text-xs text-teal-600 font-medium">
                {freeCount} free
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className={`hidden sm:flex text-xs font-semibold px-3 py-1 rounded-lg ${colors.bg} ${colors.text} ${colors.border} border`}>
            {exam.examCode}
          </span>
          <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center">
            {isOpen
              ? <ChevronUp className="w-4 h-4 text-gray-500" />
              : <ChevronDown className="w-4 h-4 text-gray-500" />
            }
          </div>
        </div>
      </button>

      {isOpen && (
        <div className="px-6 pb-6 border-t border-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-5">
            {exam.materials.map(material => (
              <MaterialCard
                key={material.id}
                material={material}
                accentText={colors.text}
              />
            ))}
          </div>
          <div className="mt-5 pt-4 border-t border-gray-50 flex justify-end">
            <Link
              href={`/study-materials/${exam.id}`}
              className={`inline-flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl transition-all active:scale-95 ${colors.bg} ${colors.text} ${colors.border} border hover:opacity-80`}
            >
              View All {exam.examName} Materials
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
