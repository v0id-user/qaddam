import { useTranslations } from 'next-intl';
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

const Hero = () => {
  const t = useTranslations('landing');
  
  const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-4 relative bg-white">
      <div className="text-center max-w-4xl mx-auto space-y-8 animate-fade-up">
        {/* Main Arabic Headline */}
        <h1 className="text-5xl md:text-7xl font-bold leading-tight text-foreground">
          {t('hero.title')}
          <br />
          <span className="text-primary">{t('hero.subtitle')}</span>
        </h1>

        {/* Arabic Subtext */}
        <p className="text-lg md:text-xl max-w-2xl mx-auto leading-relaxed text-muted-foreground">
          {t('hero.description')}
        </p>

        {/* CTA Button */}
        <div className="flex flex-col items-center space-y-6">
          <Button 
            size="lg" 
            className="px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 bg-primary text-primary-foreground border-none"
          >
            {t('hero.cta')}
          </Button>

          {/* Scroll CTA */}
          <button 
            onClick={scrollToFeatures}
            className="flex items-center space-x-2 space-x-reverse transition-colors duration-200 group text-muted-foreground"
          >
            <span>{t('hero.scroll_cta')}</span>
            <ChevronDown className="w-4 h-4 group-hover:translate-y-1 transition-transform duration-200 ml-2" />
          </button>
        </div>
      </div>

      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-indigo-100 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-purple-100 rounded-full blur-3xl opacity-20"></div>
      </div>
    </section>
  );
};

export default Hero;
