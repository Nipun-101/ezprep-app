"use client";

import { useState } from "react";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Amalnath K N",
    exam: "RRB NTPC 2025",
    rank: "Selected",
    text: "EzPrep's AI analysis pinpointed my weak subjects instantly.Helped me to clear the exam in a differnet way. ",
    rating: 5,
    initials: "AN",
    color: "from-blue-500 to-cyan-500",
  },
  {
    name: "Athul satheeshan",
    exam: "SSC MTS 2026",
    rank: "Selected",
    text: "Platform is very user friendly unlike other ssc prep platforms and the content is very good.",
    rating: 5,
    initials: "AS",
    color: "from-emerald-500 to-teal-500",
  },
  {
    name: "Haritha P K",
    exam: "KWA grade 2,KPSC",
    rank: "On Going Student",
    text: "Topic wise test is very helpful for technical subjects and makes it easier to improve weak topics.",
    rating: 5,
    initials: "HA",
    color: "from-orange-500 to-amber-500",
  },
  {
    name: "Shidin K V",
    exam: "Customs Department",
    rank: "Selected",
    text: "Concise mock tests, smart AI feedback, and mentor support — EzPrep covered everything I needed.",
    rating: 5,
    initials: "SK",
    color: "from-rose-500 to-pink-500",
  },
  {
    name: "Anoop K Ajay",
    exam: "Excise Department",
    rank: "Selected",
    text: "Regular practice made me exam-ready and contributed significantly to my success in the SSC exam.",
    rating: 5,
    initials: "AK",
    color: "from-sky-500 to-blue-500",
  },
  {
    name: "Vyshnav T",
    exam: "RRB JE",
    rank: "Selected",
    text: "EzPrep's personalized AI reports and expert mentors gave me confidence I never had before.",
    rating: 5,
    initials: "VT",
    color: "from-violet-500 to-purple-500",
  },
];

export default function TestimonialsSection() {
  const [active, setActive] = useState(0);
  const total = testimonials.length;
  const visible = 3;

  const prev = () => setActive((a) => (a - 1 + total) % total);
  const next = () => setActive((a) => (a + 1) % total);

  const getVisible = () => {
    return [0, 1, 2].map((i) => testimonials[(active + i) % total]);
  };

  return (
    <section className="bg-gradient-to-b from-white to-slate-50 py-20 px-4 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div id="success-stories" className="text-center mb-14">
          <span className="inline-block text-xs font-semibold tracking-widest text-cyan-600 uppercase mb-3">
            Student Stories
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4 leading-tight">
            Real Results from Real Students
          </h2>
          <p className="text-gray-500 text-base max-w-xl mx-auto">
            Thousands of aspirants trust{" "}
            <span className="font-semibold text-gray-700">EzPrep</span> — powered by AI analysis and expert guidance.
          </p>
        </div>

        <div className="relative">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {getVisible().map((t, i) => (
              <TestimonialCard key={`${t.name}-${i}`} testimonial={t} />
            ))}
          </div>

          <div className="flex items-center justify-center gap-4 mt-10">
            <button
              onClick={prev}
              className="w-10 h-10 rounded-full border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center shadow-sm transition-all hover:shadow-md"
              aria-label="Previous"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>

            <div className="flex gap-2">
              {Array.from({ length: total }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  className={`transition-all duration-300 rounded-full ${
                    i === active
                      ? "w-6 h-2 bg-cyan-500"
                      : "w-2 h-2 bg-gray-300 hover:bg-gray-400"
                  }`}
                  aria-label={`Go to ${i + 1}`}
                />
              ))}
            </div>

            <button
              onClick={next}
              className="w-10 h-10 rounded-full border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center shadow-sm transition-all hover:shadow-md"
              aria-label="Next"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="mt-14 rounded-2xl bg-gradient-to-r from-cyan-50 to-sky-50 border border-cyan-100 px-6 py-6 flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
          <div className="shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-sky-600 flex items-center justify-center shadow">
            <Star className="w-7 h-7 text-white fill-white" />
          </div>
          <div>
            <p className="text-gray-800 font-bold text-lg">
              Join 3500+ aspirants already preparing smarter with EzPrep
            </p>
            <p className="text-gray-500 text-sm mt-1">
              AI-powered insights · Expert mentors · Proven results
            </p>
          </div>
          <a
            href="/login"
            className="sm:ml-auto shrink-0 bg-gradient-to-r from-cyan-500 to-sky-600 text-white text-sm font-semibold px-6 py-3 rounded-xl shadow hover:shadow-md transition-all hover:-translate-y-0.5"
          >
            Start Free Today
          </a>
        </div>
      </div>
    </section>
  );
}

function TestimonialCard({ testimonial }: { testimonial: typeof testimonials[0] }) {
  return (
    <div className="group relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 p-6 flex flex-col h-full">
      <Quote className="w-7 h-7 text-cyan-100 mb-3" fill="currentColor" />

      <p className="text-gray-700 text-sm leading-relaxed flex-1 mb-5">
        "{testimonial.text}"
      </p>

      <div className="flex mb-4 gap-0.5">
        {Array.from({ length: testimonial.rating }).map((_, i) => (
          <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
        ))}
      </div>

      <div className="flex items-center gap-3 pt-4 border-t border-gray-50">
        <div
          className={`w-10 h-10 rounded-full bg-gradient-to-br ${testimonial.color} flex items-center justify-center text-white text-xs font-bold shrink-0`}
        >
          {testimonial.initials}
        </div>
        <div>
          <p className="text-gray-900 font-semibold text-sm leading-tight">{testimonial.name}</p>
          <p className="text-gray-400 text-xs mt-0.5">
            {testimonial.exam} &middot; <span className="text-cyan-600 font-medium">{testimonial.rank}</span>
          </p>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 h-0.5 w-0 group-hover:w-full rounded-b-2xl bg-gradient-to-r from-cyan-400 to-sky-500 transition-all duration-500" />
    </div>
  );
}
