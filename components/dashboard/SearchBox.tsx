'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Search, FileText, Tag, X, ArrowRight, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { searchGlobal, GlobalSearchData } from '@/lib/api/search';

interface SearchResult {
  id: string;
  label: string;
  sublabel?: string;
  type: 'category' | 'exam';
  href: string;
}

const TYPE_CONFIG: Record<SearchResult['type'], { icon: React.ElementType; color: string; bg: string }> = {
  category: { icon: Tag, color: 'text-orange-600', bg: 'bg-orange-50' },
  exam: { icon: FileText, color: 'text-teal-600', bg: 'bg-teal-50' },
};

const TYPE_LABEL: Record<SearchResult['type'], string> = {
  category: 'Categories',
  exam: 'Exams',
};

function mapApiToResults(data: GlobalSearchData): SearchResult[] {
  const out: SearchResult[] = [];

  for (const c of data.categories) {
    out.push({
      id: c.id,
      label: c.name,
      sublabel: c.shortName?.trim() ? c.shortName : undefined,
      type: 'category',
      href: `/dashboard?categoryId=${encodeURIComponent(c.id)}`,
    });
  }

  for (const e of data.exams) {
    const cat = e.category;
    const sub =
      cat?.name?.trim() ||
      cat?.shortName?.trim() ||
      undefined;
    out.push({
      id: e.id,
      label: e.name,
      sublabel: sub,
      type: 'exam',
      href: `/dashboard/exam/${encodeURIComponent(e.id)}`,
    });
  }

  return out;
}

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
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [results, setResults] = useState<SearchResult[]>([]);
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedQuery(query.trim()), 320);
    return () => window.clearTimeout(t);
  }, [query]);

  useEffect(() => {
    if (!debouncedQuery) {
      setResults([]);
      setFetchError(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setFetchError(null);
    setResults([]);

    searchGlobal(debouncedQuery)
      .then((data) => {
        if (cancelled) return;
        setResults(mapApiToResults(data));
      })
      .catch(() => {
        if (cancelled) return;
        setFetchError('Something went wrong. Try again.');
        setResults([]);
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  const searchingPending = query.trim().length > 0 && query.trim() !== debouncedQuery;

  const grouped = useMemo(() => {
    return (['category', 'exam'] as SearchResult['type'][])
      .map((type) => ({ type, items: results.filter((r) => r.type === type) }))
      .filter((g) => g.items.length > 0);
  }, [results]);

  const flatItems = useMemo(() => grouped.flatMap((g) => g.items), [grouped]);

  const handleSelect = useCallback(
    (result: SearchResult) => {
      router.push(result.href);
      setQuery('');
      setDebouncedQuery('');
      setResults([]);
      setOpen(false);
    },
    [router]
  );

  useEffect(() => {
    setActiveIndex(-1);
  }, [query, results]);

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
    } else if (e.key === 'Enter' && activeIndex >= 0 && flatItems[activeIndex]) {
      e.preventDefault();
      handleSelect(flatItems[activeIndex]);
    } else if (e.key === 'Escape') {
      setOpen(false);
      inputRef.current?.blur();
    }
  }

  let flatCounter = 0;

  const isHero = variant === 'hero';
  const showPanel = open && query.trim().length > 0;
  const showEmpty =
    !loading &&
    !searchingPending &&
    !fetchError &&
    debouncedQuery === query.trim() &&
    flatItems.length === 0;
  const highlightQuery = debouncedQuery === query.trim() ? debouncedQuery : query.trim();

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
          placeholder="Search exams, categories..."
          className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none min-w-0"
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setDebouncedQuery('');
              setResults([]);
              inputRef.current?.focus();
            }}
            className="p-0.5 rounded-full hover:bg-gray-200 transition-colors"
          >
            <X className="w-3.5 h-3.5 text-gray-400" />
          </button>
        )}
      </div>

      {showPanel && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl shadow-gray-200/80 border border-gray-100 overflow-hidden z-50 max-h-[420px] overflow-y-auto">
          {(loading || searchingPending) && (
            <div className="flex items-center justify-center gap-2 py-10 text-gray-500">
              <Loader2 className="w-5 h-5 animate-spin shrink-0" />
              <span className="text-sm font-medium">Searching…</span>
            </div>
          )}

          {fetchError && !loading && !searchingPending && (
            <div className="flex flex-col items-center justify-center py-10 text-gray-400 px-4 text-center">
              <p className="text-sm font-medium text-red-600">{fetchError}</p>
              <p className="text-xs mt-1 text-gray-400">Check your connection and try again.</p>
            </div>
          )}

          {showEmpty && (
            <div className="flex flex-col items-center justify-center py-10 text-gray-400">
              <Search className="w-8 h-8 mb-2 opacity-40" />
              <p className="text-sm font-medium">No results for "{query}"</p>
              <p className="text-xs mt-1 text-gray-300">Try a different exam or category name</p>
            </div>
          )}

          {!loading && !searchingPending && !fetchError && grouped.length > 0 && (
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
                          key={`${result.type}-${result.id}`}
                          type="button"
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
                              {highlight(result.label, highlightQuery)}
                            </p>
                            {result.sublabel ? (
                              <p className="text-xs text-gray-400 truncate">{result.sublabel}</p>
                            ) : null}
                          </div>
                          <ArrowRight className={`w-3.5 h-3.5 text-gray-300 shrink-0 transition-opacity ${isActive ? 'opacity-100' : 'opacity-0'}`} />
                        </button>
                      );
                    })}
                  </div>
                );
              })}
              <div className="px-4 py-2.5 border-t border-gray-100 text-center">
                <span className="text-xs text-gray-400">
                  {flatItems.length} result{flatItems.length !== 1 ? 's' : ''} found
                </span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
