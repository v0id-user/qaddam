import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('refund');

  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function RefundPage() {
  const t = await getTranslations('refund');
  const isRTL = (await getLocale()) === 'ar';

  return (
    <div className={`bg-background min-h-screen ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="container mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-foreground mb-2 text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground mb-4 text-sm">{t('lastUpdated')}</p>
          <div className="space-y-4">
            <p className="text-muted-foreground leading-relaxed font-medium">{t('description')}</p>
            <p className="text-muted-foreground leading-relaxed">{t('explanation')}</p>
          </div>
        </div>

        {/* Content */}
        <div
          className={`prose prose-neutral dark:prose-invert max-w-none ${isRTL ? 'text-right' : 'text-left'}`}
        >
          {/* No Usage Does Not Equal Free Refund */}
          <section className="mb-8">
            <h2 className="text-foreground mb-4 text-2xl font-semibold">
              {t('sections.noUsage.title')}
            </h2>
            <p className="text-muted-foreground leading-relaxed">{t('sections.noUsage.content')}</p>
          </section>

          {/* Limited Refund Exceptions */}
          <section className="mb-8">
            <h2 className="text-foreground mb-4 text-2xl font-semibold">
              {t('sections.exceptions.title')}
            </h2>
            <p className="text-muted-foreground mb-4 leading-relaxed">
              {t('sections.exceptions.intro')}
            </p>
            <ul className="text-muted-foreground space-y-2">
              {t.raw('sections.exceptions.conditions').map((condition: string, index: number) => (
                <li key={index} className="flex items-start">
                  <span className={`text-primary ${isRTL ? 'ml-2' : 'mr-2'}`}>•</span>
                  <span>{condition}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Payment Processing Fees */}
          <section className="mb-8">
            <h2 className="text-foreground mb-4 text-2xl font-semibold">
              {t('sections.processingFees.title')}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {t('sections.processingFees.content')}
            </p>
          </section>

          {/* Chargebacks Policy */}
          <section className="mb-8">
            <h2 className="text-foreground mb-4 text-2xl font-semibold">
              {t('sections.chargebacks.title')}
            </h2>
            <p className="text-muted-foreground mb-4 leading-relaxed">
              {t('sections.chargebacks.content')}
            </p>
            <p className="text-muted-foreground leading-relaxed">
              {t('sections.chargebacks.contactFirst')} {t('contact.email')}
            </p>
          </section>

          {/* Summary */}
          <section className="mb-8">
            <h2 className="text-foreground mb-4 text-2xl font-semibold">
              {t('sections.summary.title')}
            </h2>
            <ul className="text-muted-foreground space-y-2">
              {t.raw('sections.summary.points').map((point: string, index: number) => (
                <li key={index} className="flex items-start">
                  <span className={`text-primary ${isRTL ? 'ml-2' : 'mr-2'}`}>•</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
