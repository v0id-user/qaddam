'use client';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';

const Hero = () => {
  const t = useTranslations('landing');
  const router = useRouter();
  const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center bg-white px-4">
      <div className="animate-fade-up mx-auto max-w-4xl space-y-8 text-center">
        {/* Main Arabic Headline */}
        <h1 className="text-foreground text-5xl leading-tight font-bold md:text-7xl">
          {t('hero.title')}
          <br />
          <span className="text-primary">{t('hero.subtitle')}</span>
        </h1>

        {/* Arabic Subtext */}
        <p className="text-muted-foreground mx-auto max-w-2xl text-lg leading-relaxed md:text-xl">
          {t('hero.description')}
        </p>

        {/* CTA Button */}
        <div className="flex flex-col items-center space-y-6">
          <Button
            onClick={() => {
              router.push('/sign');
            }}
            size="lg"
            className="bg-primary text-primary-foreground rounded-xl border-none px-8 py-4 text-lg font-semibold shadow-lg transition-all duration-200 hover:shadow-xl"
          >
            {t('hero.cta')}
          </Button>

          {/* Scroll CTA */}
          <button
            onClick={scrollToFeatures}
            className="group text-muted-foreground flex items-center space-x-2 space-x-reverse transition-colors duration-200"
          >
            <span>{t('hero.scroll_cta')}</span>
            <ChevronDown className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-y-1" />
          </button>
        </div>
      </div>

      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 right-1/4 h-72 w-72 rounded-full bg-indigo-100 opacity-30 blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/4 h-96 w-96 rounded-full bg-purple-100 opacity-20 blur-3xl"></div>
      </div>
    </section>
  );
};

export default Hero;
