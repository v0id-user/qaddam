import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { isAuthenticated } from '@qaddam/backend/convex/auth';
import { trackEvent } from '@/analytics/server';
import { fetchQuery } from 'convex/nextjs';
import { api } from '@qaddam/backend/convex/_generated/api';
import { convexAuthNextjsToken } from '@convex-dev/auth/nextjs/server';

const Hero = async () => {
  const t = await getTranslations('landing');
  const token = await convexAuthNextjsToken();
  const me = await fetchQuery(api.users.getMe, {}, { token });
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
          <form
            action={async () => {
              // TODO: YES. I'm not going to make this alone a client side, let the server do it, until I see an issue which is it might be expensive AF :P
              'use server';
              if (isAuthenticated && me) {
                trackEvent('landing_cta', { source: '/dashboard' }, me.email);
                redirect('/dashboard');
              } else {
                trackEvent('landing_cta', { source: '/sign' });
                redirect('/sign');
              }
            }}
          >
            <Button
              size="lg"
              className="bg-primary text-primary-foreground rounded-xl border-none px-8 py-4 text-lg font-semibold shadow-lg transition-all duration-200 hover:shadow-xl"
            >
              {isAuthenticated ? t('hero.cta_authenticated') : t('hero.cta_unauthenticated')}
            </Button>
          </form>
          {/* Scroll CTA */}
          <a
            href="#features"
            className="group text-muted-foreground flex items-center space-x-2 space-x-reverse scroll-smooth transition-colors duration-200"
          >
            <span>{t('hero.scroll_cta')}</span>
            <ChevronDown className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-y-1" />
          </a>
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
