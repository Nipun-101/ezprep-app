import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import ExamsSection from '@/components/ExamsSection';

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      <HeroSection />
      <ExamsSection />
    </main>
  );
}