'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Search, BookOpen, FileText, Video, Tag, X, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { examCategories } from '@/lib/mockData';

interface SearchResult {
  id: string;
  label: string;
  sublabel: string;
  type: 'category' | 'exam' | 'course' | 'mock-test';
  href: string;
}

const COURSES: SearchResult[] = [
  { id: 'course-rrb', label: 'RRB NTPC Complete Course', sublabel: 'Course', type: 'course', href: '/dashboard/courses' },
  { id: 'course-ssc', label: 'SSC CGL Master Course', sublabel: 'Course', type: 'course', href: '/dashboard/courses' },
  { id: 'course-ib', label: 'IB ACIO Full Prep Course', sublabel: 'Course', type: 'course', href: '/dashboard/courses' },
  { id: 'course-gk', label: 'General Awareness Booster', sublabel: 'Course', type: 'course', href: '/dashboard/courses' },
  { id: 'course-math', label: 'Mathematics Crash Course', sublabel: 'Course', type: 'course', href: '/dashboard/courses' },
];

const MOCK_TESTS: SearchResult[] = [
  { id: 'mt-rrb-1', label: 'RRB NTPC Mock Test 1', sublabel: 'Mock Test · Free', type: 'mock-test', href: '/dashboard/exam/rrb-ntpc' },
  { id: 'mt-ssc-1', label: 'SSC CGL Tier I Mock Test 1', sublabel: 'Mock Test · Free', type: 'mock-test', href: '/dashboard/exam/ssc-cgl-tier1' },
  { id: 'mt-rrb-2', label: 'RRB Group D Mock Test', sublabel: 'Mock Test', type: 'mock-test', href: '/dashboard/exam/rrb-group-d' },
  { id: 'mt-ssc-2', label: 'SSC CHSL Full Mock Test', sublabel: 'Mock Test', type: 'mock-test', href: '/dashboard/exam/ssc-chsl' },
];

function buildSearchIndex(): SearchResult[] {
  const results: SearchResult[] = [];

  examCategories.forEach((cat) => {
    results.push({
      id: `cat-${cat.id}`,
      label: cat.title,
      sublabel: 'Category',
      type: 'category',
      href: '/dashboard/tests',
    });
    cat.exams.forEach((exam) => {
      results.push({
        id: `exam-${exam.id}`,
        label: exam.name,
        sublabel: cat.title.replace('Popular Exams from ', ''),
        type: 'exam',
        href: `/dashboard/exam/${exam.id}`,
      });
    });
  });

  results.push(...COURSES, ...MOCK_TESTS);
  return results;
}

const ALL_RESULTS = buildSearchIndex();

const TYPE_CONFIG: Record<SearchResult['type'], { icon: React.ElementType; color: string; bg: string }> = {
  category: { icon: Tag, color: 'text-orange-600', bg: 'bg-orange-50' },
  exam: { icon: FileText, color: 'text-teal-600', bg: 'bg-teal-50' },
  course: { icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50' },
  'mock-test': { icon: Video, color: 'text-emerald-600', bg: 'bg-emerald-50' },
};

const TYPE_LABEL: Record<SearchResult['type'], string> = {
  category: 'Categories',
  exam: 'Exams',
  course: 'Courses',
  'mock-test': 'Mock Tests',
};

function highlight(text: string, query: string) {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-teal-100 text-teal-800 rounded font-semibold not-italic">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  );
}

interface SearchBoxProps {
  variant?: 'default' | 'hero';
}

export default function SearchBox({ variant = 'default' }: SearchBoxProps) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = query.trim().length > 0
    ? ALL_RESULTS.filter((r) =>
        r.label.toLowerCase().includes(query.toLowerCase()) ||
        r.sublabel.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 20)
    : [];

  const grouped = (['category', 'exam', 'course', 'mock-test'] as SearchResult['type'][])
    .map((type) => ({ type, items: filtered.filter((r) => r.type === type) }))
    .filter((g) => g.items.length > 0);

  const flatItems = grouped.flatMap((g) => g.items);

  const handleSelect = useCallback((result: SearchResult) => {
    router.push(result.href);
    setQuery('');
    setOpen(false);
  }, [router]);

  useEffect(() => {
    setActiveIndex(-1);
  }, [query]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  function onKeyDown(e: React.KeyboardEvent) {
    if (!open) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, flatItems.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      handleSelect(flatItems[activeIndex]);
    } else if (e.key === 'Escape') {
      setOpen(false);
      inputRef.current?.blur();
    }
  }

  let flatCounter = 0;

  const isHero = variant === 'hero';

  return (
    <div ref={containerRef} className="relative w-full max-w-xl">
      <div
        className={`flex items-center gap-2.5 rounded-2xl px-4 transition-all duration-200 ${
          isHero
            ? `bg-white border-2 py-3 shadow-xl ${open ? 'border-teal-400 shadow-teal-200/60' : 'border-white/80 hover:border-teal-300'}`
            : `bg-gray-50 border-2 py-2.5 ${open ? 'border-teal-400 bg-white shadow-lg shadow-teal-100/60' : 'border-gray-200 hover:border-gray-300'}`
        }`}
      >
        <Search className="w-4 h-4 text-gray-400 shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          placeholder="Search exams, courses, mock tests..."
          className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none min-w-0"
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
        />
        {query && (
          <button
            onClick={() => { setQuery(''); inputRef.current?.focus(); }}
            className="p-0.5 rounded-full hover:bg-gray-200 transition-colors"
          >
            <X className="w-3.5 h-3.5 text-gray-400" />
          </button>
        )}
      </div>

      {open && query.trim().length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl shadow-gray-200/80 border border-gray-100 overflow-hidden z-50 max-h-[420px] overflow-y-auto">
          {grouped.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-gray-400">
              <Search className="w-8 h-8 mb-2 opacity-40" />
              <p className="text-sm font-medium">No results for "{query}"</p>
              <p className="text-xs mt-1 text-gray-300">Try searching for an exam name or category</p>
            </div>
          ) : (
            <>
              {grouped.map(({ type, items }) => {
                const cfg = TYPE_CONFIG[type];
                const Icon = cfg.icon;
                return (
                  <div key={type}>
                    <div className="px-4 pt-3 pb-1 flex items-center gap-2">
                      <span className={`text-[10px] font-bold uppercase tracking-widest ${cfg.color}`}>
                        {TYPE_LABEL[type]}
                      </span>
                    </div>
                    {items.map((result) => {
                      const index = flatCounter++;
                      const isActive = index === activeIndex;
                      return (
                        <button
                          key={result.id}
                          onClick={() => handleSelect(result)}
                          onMouseEnter={() => setActiveIndex(index)}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                            isActive ? 'bg-teal-50' : 'hover:bg-gray-50'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-xl ${cfg.bg} flex items-center justify-center shrink-0`}>
                            <Icon className={`w-4 h-4 ${cfg.color}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate">
                              {highlight(result.label, query)}
                            </p>
                            <p className="text-xs text-gray-400 truncate">{result.sublabel}</p>
                          </div>
                          <ArrowRight className={`w-3.5 h-3.5 text-gray-300 shrink-0 transition-opacity ${isActive ? 'opacity-100' : 'opacity-0'}`} />
                        </button>
                      );
                    })}
                  </div>
                );
              })}
              <div className="px-4 py-2.5 border-t border-gray-100 text-center">
                <span className="text-xs text-gray-400">{filtered.length} result{filtered.length !== 1 ? 's' : ''} found</span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
