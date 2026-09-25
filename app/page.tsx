import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import ExamsSection from '@/components/ExamsSection';
import WhyChooseUsSection from '@/components/WhyChooseUsSection';
import TestimonialsSection from '@/components/TestimonialsSection';
import StatsSection from '@/components/StatsSection';
import Footer from '@/components/Footer';
import GoogleOAuthReturn from '@/components/auth/GoogleOAuthReturn';
import { getExamGroupsByCategory } from '@/lib/api/exams';

export const revalidate = 86400;

export default async function Home({
  searchParams,
}: {
  searchParams?: { code?: string; state?: string; error?: string };
}) {
  if (searchParams?.code || searchParams?.error) {
    return <GoogleOAuthReturn />;
  }

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
    </main>
  );
}