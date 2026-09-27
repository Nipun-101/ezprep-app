import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import ExamsSection from '@/components/ExamsSection';
import WhyChooseUsSection from '@/components/WhyChooseUsSection';
import TestimonialsSection from '@/components/TestimonialsSection';
import StatsSection from '@/components/StatsSection';
import Footer from '@/components/Footer';
import GoogleSignInPrompt from '@/components/auth/GoogleSignInPrompt';
import { getExamGroupsByCategory } from '@/lib/api/exams';

export default async function MarketingHome() {
  const categories = await getExamGroupsByCategory().catch(() => []);

  return (
    <main className="min-h-screen bg-white">
      <Header />
      <HeroSection />
      <ExamsSection categories={categories} />
      <WhyChooseUsSection />
      <TestimonialsSection />
      <StatsSection />
      <Footer />
      <GoogleSignInPrompt />
    </main>
  );
}
