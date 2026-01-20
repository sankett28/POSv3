import { Header } from '@/components/landing/header';
import { Hero } from '@/components/landing/hero';
import { HowItWorks } from '@/components/landing/how-it-works';
import { Features } from '@/components/landing/features';
import { ThemePreview } from '@/components/landing/theme-preview';
import { BusinessTypes } from '@/components/landing/business-types';
import { WhyLichy } from '@/components/landing/why-lichy';
import { Testimonials } from '@/components/landing/testimonials';
import { FinalCta } from '@/components/landing/final-cta';
import { Footer } from '@/components/landing/footer';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen text-foreground">
      <Header />
      <main className="flex-1">
        <Hero />
        <HowItWorks />
        <Features />
        <ThemePreview />
        <BusinessTypes />
        <WhyLichy />
        <Testimonials />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}
