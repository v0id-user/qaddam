'use client';

import { useTranslations } from 'next-intl';
import { Target, TrendingUp, FileText, Search, Globe, Bookmark } from 'lucide-react';
import { BentoCard, BentoGrid } from '@/components/magicui/bento-grid';
import { FlickeringGrid } from '@/components/magicui/flickering-grid';

const Features = () => {
  const t = useTranslations('landing');

  const features = [
    {
      icon: <Target className="h-6 w-6" />,
      title: t('features.items.resume_analysis.title'),
      description: t('features.items.resume_analysis.description'),
      className: 'col-span-3 lg:col-span-1',
      href: '#',
      cta: t('features.cta'),
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: t('features.items.job_matching.title'),
      description: t('features.items.job_matching.description'),
      className: 'col-span-3 lg:col-span-2',
      href: '#',
      cta: t('features.cta'),
    },
    {
      icon: <FileText className="h-6 w-6" />,
      title: t('features.items.resume_optimization.title'),
      description: t('features.items.resume_optimization.description'),
      className: 'col-span-3 lg:col-span-2',
      href: '#',
      cta: t('features.cta'),
    },
    {
      icon: <Search className="h-6 w-6" />,
      title: t('features.items.job_search.title'),
      description: t('features.items.job_search.description'),
      className: 'col-span-3 lg:col-span-1',
      href: '#',
      cta: t('features.cta'),
      background: (
        <FlickeringGrid
          className="absolute inset-0 z-0 size-full opacity-20"
          squareSize={4}
          gridGap={6}
          color="#000"
          maxOpacity={0.3}
          flickerChance={0.1}
        />
      ),
    },
    {
      icon: <Globe className="h-6 w-6" />,
      title: t('features.items.language_support.title'),
      description: t('features.items.language_support.description'),
      className: 'col-span-3 lg:col-span-1',
      href: '#',
      cta: t('features.cta'),
    },
    {
      icon: <Bookmark className="h-6 w-6" />,
      title: t('features.items.job_tracking.title'),
      description: t('features.items.job_tracking.description'),
      className: 'col-span-3 lg:col-span-2',
      href: '#',
      cta: t('features.cta'),
    },
  ];

  return (
    <section id="features" className="bg-white px-4 py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <h2 className="text-foreground mb-4 text-4xl font-bold md:text-5xl">
            {t('features.title')}
          </h2>
          <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
            {t('features.description')}
          </p>
        </div>

        <BentoGrid>
          {features.map((feature, idx) => (
            <BentoCard
              key={idx}
              {...feature}
              className={`border-border rounded-xl border bg-white p-6 transition-all duration-800 ease-out ${feature.className}`}
            />
          ))}
        </BentoGrid>
      </div>
    </section>
  );
};

export default Features;
