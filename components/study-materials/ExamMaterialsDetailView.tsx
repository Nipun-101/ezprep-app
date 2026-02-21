'use client';

import { useState, useMemo } from 'react';
import {
  ArrowLeft, Search, Download, Star, FileText, StickyNote, ListChecks,
  History, BookOpen, Sigma, FlaskConical, Brain, Globe, Calculator,
  BookA, FileStack, Languages, ChevronLeft, ChevronRight, X, Filter,
  Sparkles, TrendingUp, Clock, Zap, SlidersHorizontal,
} from 'lucide-react';
import Link from 'next/link';
import type { ExamDetailData, DetailedMaterial, MaterialType } from '@/lib/examMaterialsDetail';

const TYPE_ICONS: Record<MaterialType, React.ElementType> = {
  pdf: FileText,
  notes: StickyNote,
  syllabus: ListChecks,
  pyq: History,
  book: BookOpen,
  formula: Sigma,
  'video-notes': FileText,
  'mock-test': Zap,
};

const TYPE_STYLE: Record<MaterialType, { bg: string; text: string; border: string; label: string }> = {
  pdf: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200', label: 'PDF' },
  notes: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200', label: 'Notes' },
  syllabus: { bg: 'bg-teal-50', text: 'text-teal-600', border: 'border-teal-200', label: 'Syllabus' },
  pyq: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200', label: 'PYQ' },
  book: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200', label: 'Book' },
  formula: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200', label: 'Formula' },
  'video-notes': { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200', label: 'Video Notes' },
  'mock-test': { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-200', label: 'Mock Test' },
};

const DIFFICULTY_STYLE: Record<string, { bg: string; text: string }> = {
  Easy: { bg: 'bg-green-50', text: 'text-green-600' },
  Medium: { bg: 'bg-amber-50', text: 'text-amber-600' },
  Hard: { bg: 'bg-red-50', text: 'text-red-600' },
};

const SUBJECT_ICONS: Record<string, React.ElementType> = {
  Mathematics: Calculator,
  'General Intelligence & Reasoning': Brain,
  'General Awareness': Globe,
  'General Science': FlaskConical,
  'English Language': BookA,
  'All Subjects': BookOpen,
};

const PAGE_SIZE = 9;

function formatDownloads(n: number) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
  return `${n}`;
}

interface Props {
  data: ExamDetailData;
}

export default function ExamMaterialsDetailView({ data }: Props) {
  const [search, setSearch] = useState('');
  const [activeSubject, setActiveSubject] = useState('All');
  const [activeType, setActiveType] = useState<MaterialType | 'All'>('All');
  const [activeTopic, setActiveTopic] = useState('All');
  const [sortBy, setSortBy] = useState<'popular' | 'newest' | 'rating'>('popular');
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const allTopics = useMemo(() => {
    const subject = data.subjects.find(s => s.name === activeSubject);
    if (!subject) return ['All'];
    return ['All', ...subject.topics];
  }, [activeSubject, data.subjects]);

  const filtered = useMemo(() => {
    let list = [...data.materials];
    if (activeSubject !== 'All') list = list.filter(m => m.subject === activeSubject);
    if (activeType !== 'All') list = list.filter(m => m.type === activeType);
    if (activeTopic !== 'All') list = list.filter(m => m.topic === activeTopic || m.tags.includes(activeTopic));
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(m =>
        m.title.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q) ||
        m.tags.some(t => t.toLowerCase().includes(q)) ||
        m.topic.toLowerCase().includes(q)
      );
    }
    list.sort((a, b) => {
      if (sortBy === 'popular') return b.downloads - a.downloads;
      if (sortBy === 'rating') return b.rating - a.rating;
      return 0;
    });
    return list;
  }, [data.materials, activeSubject, activeType, activeTopic, search, sortBy]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const featuredMaterials = data.materials.filter(m => m.isFeatured).slice(0, 3);

  function handleSubjectChange(subject: string) {
    setActiveSubject(subject);
    setActiveTopic('All');
    setPage(1);
  }

  function handleFilter(fn: () => void) {
    fn();
    setPage(1);
  }

  const typeOptions: Array<MaterialType | 'All'> = ['All', 'notes', 'pyq', 'syllabus', 'formula', 'book', 'mock-test'];

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-teal-500 rounded-2xl px-8 py-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 10% 80%, white 2px, transparent 2px), radial-gradient(circle at 90% 20%, white 2px, transparent 2px), radial-gradient(circle at 50% 50%, white 1px, transparent 1px)', backgroundSize: '60px 60px, 80px 80px, 30px 30px' }} />
        <div className="relative">
          <Link href="/study-materials" className="inline-flex items-center gap-1.5 text-white/70 hover:text-white text-sm mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Study Materials
          </Link>
          <div className="flex flex-col md:flex-row md:items-end gap-4 justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center bg-white/20 border border-white/30 text-white text-xs font-bold px-2.5 py-1 rounded-full">{data.category}</span>
                <span className="inline-flex items-center bg-white/20 border border-white/30 text-white text-xs font-bold px-2.5 py-1 rounded-full">{data.examCode}</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">{data.examName} – Study Materials</h1>
              <p className="text-blue-100 text-sm max-w-2xl">{data.description}</p>
            </div>
            <div className="flex gap-4 shrink-0">
              <div className="text-center">
                <p className="text-white font-bold text-xl">{data.totalMaterials}+</p>
                <p className="text-blue-200 text-xs">Materials</p>
              </div>
              <div className="w-px bg-white/20" />
              <div className="text-center">
                <p className="text-white font-bold text-xl">{formatDownloads(data.totalDownloads)}</p>
                <p className="text-blue-200 text-xs">Downloads</p>
              </div>
              <div className="w-px bg-white/20" />
              <div className="text-center">
                <p className="text-white font-bold text-xl">{data.lastUpdated}</p>
                <p className="text-blue-200 text-xs">Updated</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <h2 className="text-sm font-bold text-gray-700">Featured Resources</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {featuredMaterials.map(m => {
            const Icon = TYPE_ICONS[m.type];
            const style = TYPE_STYLE[m.type];
            return (
              <div key={m.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 rounded-bl-full opacity-5 bg-blue-500" />
                <div className="flex items-start gap-3 mb-3">
                  <div className={`w-9 h-9 rounded-xl ${style.bg} flex items-center justify-center shrink-0`}>
                    <Icon className={`w-4.5 h-4.5 ${style.text}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className={`inline-flex text-[10px] font-bold px-1.5 py-0.5 rounded ${style.bg} ${style.text} mb-1`}>{style.label}</span>
                    <h3 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2">{m.title}</h3>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-400 mb-4">
                  <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-400 fill-amber-400" />{m.rating} ({m.ratingCount.toLocaleString()})</span>
                  <span className="flex items-center gap-1"><Download className="w-3 h-3" />{formatDownloads(m.downloads)}</span>
                </div>
                <button className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2 rounded-xl transition-all active:scale-95">
                  <Download className="w-3.5 h-3.5" /> Download Free
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="px-5 py-4 border-b border-gray-100 overflow-x-auto">
          <div className="flex items-center gap-2 min-w-max">
            <button onClick={() => handleSubjectChange('All')} className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${activeSubject === 'All' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100'}`}>
              <BookOpen className="w-3.5 h-3.5" /> All Subjects
            </button>
            {data.subjects.map(sub => {
              const Icon = SUBJECT_ICONS[sub.name] ?? BookOpen;
              const isActive = activeSubject === sub.name;
              return (
                <button key={sub.id} onClick={() => handleSubjectChange(sub.name)} className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${isActive ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100'}`}>
                  <Icon className="w-3.5 h-3.5" /> {sub.name}
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-400'}`}>{sub.totalMaterials}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search materials, topics, tags…" className="w-full pl-10 pr-10 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white transition-all placeholder:text-gray-400" />
              {search && <button onClick={() => { setSearch(''); setPage(1); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>}
            </div>
            <div className="flex gap-2">
              <select value={sortBy} onChange={e => handleFilter(() => setSortBy(e.target.value as typeof sortBy))} className="text-sm border border-gray-200 rounded-xl px-3 py-2.5 bg-white outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-gray-600">
                <option value="popular">Most Popular</option>
                <option value="rating">Top Rated</option>
                <option value="newest">Newest</option>
              </select>
              <button onClick={() => setShowFilters(v => !v)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${showFilters ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                <SlidersHorizontal className="w-4 h-4" /> Filters
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="bg-gray-50 rounded-xl p-4 space-y-4 border border-gray-100">
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1"><Filter className="w-3.5 h-3.5" /> Material Type</p>
                <div className="flex flex-wrap gap-2">
                  {typeOptions.map(type => {
                    const style = type !== 'All' ? TYPE_STYLE[type] : null;
                    const isActive = activeType === type;
                    return (
                      <button key={type} onClick={() => handleFilter(() => setActiveType(type))} className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-all ${isActive ? (style ? `${style.bg} ${style.text} ${style.border}` : 'bg-blue-600 text-white border-blue-600') : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}`}>
                        {type === 'All' ? 'All Types' : TYPE_STYLE[type].label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {activeSubject !== 'All' && allTopics.length > 1 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-2">Topic</p>
                  <div className="flex flex-wrap gap-2">
                    {allTopics.map(topic => (
                      <button key={topic} onClick={() => handleFilter(() => setActiveTopic(topic))} className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-all ${activeTopic === topic ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}`}>
                        {topic}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing <span className="font-semibold text-gray-700">{Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)}</span> of <span className="font-semibold text-gray-700">{filtered.length}</span> materials
            </p>
            {(search || activeType !== 'All' || activeTopic !== 'All') && (
              <button onClick={() => { setSearch(''); setActiveType('All'); setActiveTopic('All'); setPage(1); }} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                <X className="w-3 h-3" /> Clear filters
              </button>
            )}
          </div>
        </div>
      </div>

      {paginated.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-16 flex flex-col items-center gap-3">
          <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center">
            <Search className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-gray-500 font-medium">No materials found</p>
          <p className="text-gray-400 text-sm">Try adjusting your filters or search query</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {paginated.map(m => <MaterialDetailCard key={m.id} material={m} />)}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
            <ChevronLeft className="w-4 h-4" />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)} className={`w-9 h-9 rounded-xl border text-sm font-medium transition-all ${p === page ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
              {p}
            </button>
          ))}
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

function MaterialDetailCard({ material: m }: { material: DetailedMaterial }) {
  const Icon = TYPE_ICONS[m.type];
  const style = TYPE_STYLE[m.type];
  const SubjectIcon = SUBJECT_ICONS[m.subject] ?? BookOpen;

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-md hover:border-gray-200 transition-all duration-200 flex flex-col gap-4 group">
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-xl ${style.bg} border ${style.border} flex items-center justify-center shrink-0`}>
          <Icon className={`w-5 h-5 ${style.text}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-1.5 flex-wrap mb-0.5">
            {m.isNew && (
              <span className="inline-flex items-center gap-0.5 bg-teal-50 text-teal-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-teal-200 shrink-0">
                <Sparkles className="w-2.5 h-2.5" /> NEW
              </span>
            )}
            {m.isFeatured && (
              <span className="inline-flex items-center gap-0.5 bg-amber-50 text-amber-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-amber-200 shrink-0">
                <Star className="w-2.5 h-2.5" /> FEATURED
              </span>
            )}
          </div>
          <h4 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2">{m.title}</h4>
          <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
            <SubjectIcon className="w-3 h-3 shrink-0" /> {m.subject}
          </p>
        </div>
      </div>

      <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{m.description}</p>

      <div className="flex flex-wrap gap-1.5">
        <span className={`inline-flex text-[11px] font-semibold px-2 py-0.5 rounded-md ${style.bg} ${style.text}`}>{style.label}</span>
        {m.difficulty && (
          <span className={`inline-flex text-[11px] font-medium px-2 py-0.5 rounded-md ${DIFFICULTY_STYLE[m.difficulty].bg} ${DIFFICULTY_STYLE[m.difficulty].text}`}>{m.difficulty}</span>
        )}
        <span className="inline-flex items-center gap-1 text-[11px] text-gray-500 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">
          <FileStack className="w-3 h-3" /> {m.pages}p
        </span>
        <span className="inline-flex items-center gap-1 text-[11px] text-gray-500 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">
          <Languages className="w-3 h-3" /> {m.language}
        </span>
        <span className="inline-flex text-[11px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">{m.fileSize}</span>
      </div>

      {m.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {m.tags.slice(0, 3).map(tag => (
            <span key={tag} className="text-[11px] text-gray-400 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-md">#{tag}</span>
          ))}
          {m.tags.length > 3 && <span className="text-[11px] text-gray-400">+{m.tags.length - 3} more</span>}
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-gray-50">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span className="font-medium text-gray-600">{m.rating}</span>
            <span>({m.ratingCount.toLocaleString()})</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-gray-400">
            <Download className="w-3 h-3" />
            <span>{formatDownloads(m.downloads)} · {m.uploadedDate}</span>
          </div>
        </div>
        <button className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-all active:scale-95 shadow-sm">
          <Download className="w-3.5 h-3.5" /> Download
        </button>
      </div>
    </div>
  );
}
