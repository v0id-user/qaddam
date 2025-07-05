import { useTranslations } from 'next-intl';
import { Target, TrendingUp, FileText, Search, Globe, Bookmark } from "lucide-react";
import { BentoCard, BentoGrid } from "@/components/magicui/bento-grid";
import { FlickeringGrid } from "@/components/magicui/flickering-grid";

const Features = () => {
  const t = useTranslations('landing');
  
  const features = [
    {
      Icon: Target,
      name: t('features.items.resume_analysis.title'),
      description: t('features.items.resume_analysis.description'),
      href: "#",
      cta: t('features.cta'),
      className: "col-span-3 lg:col-span-1",
      background: null,
    },
    {
      Icon: TrendingUp,
      name: t('features.items.job_matching.title'),
      description: t('features.items.job_matching.description'),
      href: "#",
      cta: t('features.cta'),
      className: "col-span-3 lg:col-span-2",
      background: null,
    },
    {
      Icon: FileText,
      name: t('features.items.resume_optimization.title'),
      description: t('features.items.resume_optimization.description'),
      href: "#",
      cta: t('features.cta'),
      className: "col-span-3 lg:col-span-2",
      background: null,
    },
    {
      Icon: Search,
      name: t('features.items.job_search.title'),
      description: t('features.items.job_search.description'),
      href: "#",
      cta: t('features.cta'),
      className: "col-span-3 lg:col-span-1",
      background: (
        <FlickeringGrid
          className="z-0 absolute inset-0 size-full"
          squareSize={4}
          gridGap={6}
          color="#3b82f6"
          maxOpacity={0.5}
          flickerChance={0.1}
          height={800}
          width={800}
        />
      ),
    },
    {
      Icon: Globe,
      name: t('features.items.language_support.title'),
      description: t('features.items.language_support.description'),
      href: "#",
      cta: t('features.cta'),
      className: "col-span-3 lg:col-span-1",
      background: null,
    },
    {
      Icon: Bookmark,
      name: t('features.items.job_tracking.title'),
      description: t('features.items.job_tracking.description'),
      href: "#",
      cta: t('features.cta'),
      className: "col-span-3 lg:col-span-2",
      background: null,
    }
  ];

  return (
    <section id="features" className="py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            {t('features.title')}
          </h2>
          <p className="text-lg max-w-2xl mx-auto text-muted-foreground">
            {t('features.description')}
          </p>
        </div>

        <BentoGrid>
          {features.map((feature, idx) => (
            <BentoCard key={idx} {...feature} />
          ))}
        </BentoGrid>
      </div>
    </section>
  );
};

export default Features;
