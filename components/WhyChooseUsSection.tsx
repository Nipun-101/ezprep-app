'use client';

import { GraduationCap, Sparkles, BarChart3, Languages, Brain } from 'lucide-react';

const features = [
  {
    icon: GraduationCap,
    title: 'Ground-Level Expert Faculty',
    description:
      'Learn from educators who have spent years teaching thousands of students in large offline coaching centers. Real classroom experience, proven results, and deep understanding of what it takes to clear competitive exams.',
    gradient: 'from-teal-400 to-emerald-500',
    bg: 'bg-teal-50',
    iconColor: 'text-teal-600',
    accent: 'border-teal-200',
  },
  {
    icon: Sparkles,
    title: 'Future-Proof Questions',
    description:
      'Questions crafted by industry experts and validated using advanced AI models that track evolving exam patterns. We stay ahead of the curve so your preparation is always aligned with where exams are heading — not just where they have been.',
    gradient: 'from-sky-400 to-cyan-500',
    bg: 'bg-sky-50',
    iconColor: 'text-sky-600',
    accent: 'border-sky-200',
  },
  {
    icon: Brain,
    title: 'Personalized Learning Path',
    description:
      'Your performance data drives smart topic recommendations. Focus your energy on what needs improvement and skip what you already know. Less manual planning, more targeted progress — all guided automatically.',
    gradient: 'from-emerald-400 to-teal-500',
    bg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    accent: 'border-emerald-200',
  },
  {
    icon: Languages,
    title: 'Native Language Support',
    description:
      'Exclusive content available in your regional language — Hindi, Tamil, Telugu, Kannada, Malayalam, and more. Understand concepts in the language you think in, making learning faster and more effective.',
    gradient: 'from-amber-400 to-orange-500',
    bg: 'bg-amber-50',
    iconColor: 'text-amber-600',
    accent: 'border-amber-200',
  },
  {
    icon: BarChart3,
    title: 'Smart Performance Analytics',
    description:
      'Detailed insights into your speed, accuracy, and weak areas after every test. Know exactly where you stand and what to work on next, without spending hours analyzing results yourself.',
    gradient: 'from-cyan-400 to-teal-500',
    bg: 'bg-cyan-50',
    iconColor: 'text-cyan-600',
    accent: 'border-cyan-200',
  },
];

export default function WhyChooseUsSection() {
  return (
    <section className="bg-white py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <span className="inline-block bg-teal-50 text-teal-600 text-sm font-semibold tracking-widest uppercase px-4 py-1.5 rounded-full mb-4 border border-teal-100">
            Our Edge
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            What Sets Us Apart
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            Built by educators, powered by technology — everything designed to give you a real advantage in your exam preparation.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {features.slice(0, 3).map((feature) => (
            <FeatureTile key={feature.title} feature={feature} />
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:max-w-2xl lg:mx-auto xl:max-w-none xl:grid-cols-2 xl:gap-6">
          <div className="sm:col-span-1 xl:col-span-1 flex">
            <FeatureTile feature={features[3]} />
          </div>
          <div className="sm:col-span-1 xl:col-span-1 flex">
            <FeatureTile feature={features[4]} />
          </div>
        </div>
      </div>
    </section>
  );
}

function FeatureTile({ feature }: { feature: typeof features[0] }) {
  const Icon = feature.icon;
  return (
    <div
      className={`group relative rounded-2xl border ${feature.accent} ${feature.bg} p-7 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-default h-full`}
    >
      <div className="flex items-start gap-5">
        <div
          className={`shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center shadow-sm`}
        >
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-base font-bold text-gray-900 mb-2 leading-snug">{feature.title}</h3>
          <p className="text-sm text-gray-500 leading-relaxed">{feature.description}</p>
        </div>
      </div>

      <div
        className={`absolute bottom-0 left-0 h-1 w-0 group-hover:w-full rounded-b-2xl bg-gradient-to-r ${feature.gradient} transition-all duration-500`}
      />
    </div>
  );
}
