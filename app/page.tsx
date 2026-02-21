import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import ExamsSection from '@/components/ExamsSection';
import WhyChooseUsSection from '@/components/WhyChooseUsSection';
import TestimonialsSection from '@/components/TestimonialsSection';

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      <HeroSection />
      <ExamsSection />
      <WhyChooseUsSection />
      <TestimonialsSection />
    </main>
  );
}