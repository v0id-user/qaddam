import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('terms');
  
  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function TermsPage() {
  const t = await getTranslations('terms');
  const isRTL = await getLocale() === 'ar';

  return (
    <div className={`min-h-screen bg-background ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {t('title')}
          </h1>
          <p className="text-sm text-muted-foreground mb-4">
            {t('lastUpdated')}
          </p>
          <div className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              {t('description')}
            </p>
            <p className="text-muted-foreground leading-relaxed">
              {t('agreement')}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className={`prose prose-neutral dark:prose-invert max-w-none ${isRTL ? 'text-right' : 'text-left'}`}>
          {/* 1. The Service */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-foreground">
              1. {t('sections.service.title')}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {t('sections.service.content')}
            </p>
          </section>

          {/* 2. Subscriptions & Payments */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-foreground">
              2. {t('sections.subscriptions.title')}
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              {t('sections.subscriptions.intro')}
            </p>
            <ul className="space-y-2 text-muted-foreground">
              {t.raw('sections.subscriptions.points').map((point: string, index: number) => (
                <li key={index} className="flex items-start">
                  <span className={`text-primary ${isRTL ? 'ml-2' : 'mr-2'}`}>•</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* 3. User Responsibilities */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-foreground">
              3. {t('sections.responsibilities.title')}
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              {t('sections.responsibilities.intro')}
            </p>
            <ul className="space-y-2 text-muted-foreground mb-4">
              {t.raw('sections.responsibilities.points').map((point: string, index: number) => (
                <li key={index} className="flex items-start">
                  <span className={`text-primary ${isRTL ? 'ml-2' : 'mr-2'}`}>•</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
            <p className="text-muted-foreground leading-relaxed">
              {t('sections.responsibilities.termination')}
            </p>
          </section>

          {/* 4. Intellectual Property */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-foreground">
              4. {t('sections.intellectual.title')}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {t('sections.intellectual.content')}
            </p>
          </section>

          {/* 5. Disclaimer */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-foreground">
              5. {t('sections.disclaimer.title')}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {t('sections.disclaimer.content')}
            </p>
          </section>

          {/* 6. Changes */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-foreground">
              6. {t('sections.changes.title')}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {t('sections.changes.content')}
            </p>
          </section>

          {/* 7. Contact */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-foreground">
              7. {t('sections.contact.title')}
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              {t('sections.contact.intro')}
            </p>
            <p className="text-muted-foreground leading-relaxed">
              📧 {t('sections.contact.email')}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
