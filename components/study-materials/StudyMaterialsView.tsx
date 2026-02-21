'use client';

import { useState, useMemo } from 'react';
import {
  BookOpen, Search, Filter, Download, FileStack, Star,
  GraduationCap, Train, Building2, ShieldCheck, X,
} from 'lucide-react';
import { studyMaterialsData } from '@/lib/studyMaterialsData';
import ExamMaterialsSection from './ExamMaterialsSection';

const categories = ['All', 'Railways', 'SSC', 'Intelligence Bureau'];

const categoryIcons: Record<string, React.ElementType> = {
  Railways: Train,
  SSC: Building2,
  'Intelligence Bureau': ShieldCheck,
};

const stats = [
  { label: 'Study Materials', value: '50+', icon: FileStack, color: 'text-teal-600', bg: 'bg-teal-50' },
  { label: 'Exams Covered', value: '5+', icon: GraduationCap, color: 'text-blue-600', bg: 'bg-blue-50' },
  { label: 'Free Downloads', value: '100%', icon: Download, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { label: 'Top Rated', value: '4.8★', icon: Star, color: 'text-amber-600', bg: 'bg-amber-50' },
];

export default function StudyMaterialsView() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = useMemo(() => {
    return studyMaterialsData.filter(exam => {
      const matchesCategory = activeCategory === 'All' || exam.category === activeCategory;
      const matchesSearch = search.trim() === '' ||
        exam.examName.toLowerCase().includes(search.toLowerCase()) ||
        exam.materials.some(m =>
          m.title.toLowerCase().includes(search.toLowerCase()) ||
          m.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
        );
      return matchesCategory && matchesSearch;
    });
  }, [search, activeCategory]);

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-teal-600 via-teal-500 to-emerald-500 rounded-2xl px-8 py-8 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'radial-gradient(circle at 10% 80%, white 2px, transparent 2px), radial-gradient(circle at 90% 20%, white 2px, transparent 2px), radial-gradient(circle at 50% 50%, white 1px, transparent 1px)',
            backgroundSize: '60px 60px, 80px 80px, 30px 30px',
          }}
        />
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span className="text-white/80 text-sm font-medium tracking-wide">Free Study Resources</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">Study Materials</h1>
          <p className="text-teal-100 text-sm max-w-lg">
            Download free PDFs, notes, previous year questions and formula sheets for all major competitive exams.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(stat => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center shrink-0`}>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900 leading-tight">{stat.value}</p>
                <p className="text-xs text-gray-400 leading-tight">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search exams, topics, materials..."
            className="w-full pl-10 pr-10 py-2.5 text-sm bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 transition-all placeholder:text-gray-400"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl p-1.5">
          <Filter className="w-4 h-4 text-gray-400 ml-1" />
          {categories.map(cat => {
            const Icon = categoryIcons[cat];
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                }`}
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-16 flex flex-col items-center gap-3">
          <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center">
            <Search className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-gray-500 font-medium">No materials found</p>
          <p className="text-gray-400 text-sm">Try a different search or category filter</p>
          <button
            onClick={() => { setSearch(''); setActiveCategory('All'); }}
            className="mt-1 text-teal-600 text-sm font-medium hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((exam, idx) => (
            <ExamMaterialsSection key={exam.id} exam={exam} defaultOpen={idx === 0} />
          ))}
        </div>
      )}

      <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl px-8 py-7 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-white font-bold text-lg">Want access to all premium materials?</h3>
          <p className="text-gray-400 text-sm mt-1">Unlock books, detailed notes and full PYQ sets with a free account.</p>
        </div>
        <a
          href="/login"
          className="shrink-0 inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-white font-semibold text-sm px-6 py-3 rounded-xl transition-all active:scale-95 shadow-lg"
        >
          <GraduationCap className="w-4 h-4" />
          Sign up for free
        </a>
      </div>
    </div>
  );
}
