'use client';

import { useEffect, useRef, useState } from 'react';
import { Users, GraduationCap, FileText, BookOpen } from 'lucide-react';

const stats = [
  {
    icon: Users,
    value: 3500,
    suffix: '+',
    label: 'Students Enrolled',
    description: 'Aspirants trust EzPrep nationwide',
    color: 'from-teal-500 to-cyan-500',
    bg: 'bg-teal-50',
    iconColor: 'text-teal-600',
  },
  {
    icon: GraduationCap,
    value: 8,
    suffix: '+',
    label: 'Expert Mentors',
    description: 'Top educators & ex-officers',
    color: 'from-sky-500 to-blue-500',
    bg: 'bg-sky-50',
    iconColor: 'text-sky-600',
  },
  {
    icon: FileText,
    value: 1200,
    suffix: '+',
    label: 'Mock Tests',
    description: 'Full-length & sectional tests',
    color: 'from-emerald-500 to-teal-500',
    bg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
  },
  {
    icon: BookOpen,
    value: 50000,
    suffix: '+',
    label: 'Questions in Bank',
    description: 'Curated, exam-pattern questions',
    color: 'from-amber-500 to-orange-500',
    bg: 'bg-amber-50',
    iconColor: 'text-amber-600',
  },
];

function useCountUp(target: number, duration: number, active: boolean) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!active) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [active, target, duration]);

  return count;
}

function StatCard({ stat, active }: { stat: typeof stats[0]; active: boolean }) {
  const count = useCountUp(stat.value, 1800, active);
  const Icon = stat.icon;

  return (
    <div className="group relative flex flex-col items-center text-center p-8 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-400 hover:-translate-y-1 overflow-hidden">
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none">
        <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.color}`} />
      </div>

      <div className={`w-14 h-14 rounded-2xl ${stat.bg} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
        <Icon className={`w-7 h-7 ${stat.iconColor}`} strokeWidth={1.8} />
      </div>

      <div className="flex items-end gap-0.5 mb-1">
        <span className="text-4xl font-extrabold text-gray-900 tabular-nums leading-none">
          {count.toLocaleString()}
        </span>
        <span className={`text-2xl font-extrabold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent leading-none mb-0.5`}>
          {stat.suffix}
        </span>
      </div>

      <p className="text-gray-900 font-semibold text-base mt-2 mb-1">{stat.label}</p>
      <p className="text-gray-400 text-sm leading-snug">{stat.description}</p>
    </div>
  );
}

export default function StatsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="bg-gradient-to-b from-slate-50 to-white py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <span className="inline-block text-xs font-semibold tracking-widest text-teal-600 uppercase mb-3">
            Our Impact
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4 leading-tight">
            Trusted by Lakhs of Aspirants
          </h2>
          <p className="text-gray-500 text-base max-w-xl mx-auto">
            Numbers that reflect years of dedication to helping students crack their dream government exams.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {stats.map((stat) => (
            <StatCard key={stat.label} stat={stat} active={active} />
          ))}
        </div>
      </div>
    </section>
  );
}
