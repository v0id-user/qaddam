import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('privacy');

  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function PrivacyPage() {
  const t = await getTranslations('privacy');
  const isRTL = (await getLocale()) === 'ar';

  return (
    <div className={`bg-background min-h-screen ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="container mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-foreground mb-2 text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground mb-4 text-sm">{t('lastUpdated')}</p>
          <div className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">{t('description')}</p>
            <p className="text-muted-foreground leading-relaxed">{t('agreement')}</p>
          </div>
        </div>

        {/* Content */}
        <div
          className={`prose prose-neutral dark:prose-invert max-w-none ${isRTL ? 'text-right' : 'text-left'}`}
        >
          {/* Interpretation and Definitions */}
          <section className="mb-8">
            <h2 className="text-foreground mb-4 text-2xl font-semibold">
              {t('sections.interpretation.title')}
            </h2>

            <div className="mb-6">
              <h3 className="text-foreground mb-3 text-xl font-medium">
                {t('sections.interpretation.interpretation.title')}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {t('sections.interpretation.interpretation.content')}
              </p>
            </div>

            <div>
              <h3 className="text-foreground mb-3 text-xl font-medium">
                {t('sections.interpretation.definitions.title')}
              </h3>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                {t('sections.interpretation.definitions.intro')}
              </p>
              <ul className="space-y-3">
                {Object.entries({
                  account: {
                    term: t('sections.interpretation.definitions.terms.account'),
                    description: t('sections.interpretation.definitions.descriptions.account'),
                  },
                  affiliate: {
                    term: t('sections.interpretation.definitions.terms.affiliate'),
                    description: t('sections.interpretation.definitions.descriptions.affiliate'),
                  },
                  company: {
                    term: t('sections.interpretation.definitions.terms.company'),
                    description: t('sections.interpretation.definitions.descriptions.company'),
                  },
                  cookies: {
                    term: t('sections.interpretation.definitions.terms.cookies'),
                    description: t('sections.interpretation.definitions.descriptions.cookies'),
                  },
                  country: {
                    term: t('sections.interpretation.definitions.terms.country'),
                    description: t('sections.interpretation.definitions.descriptions.country'),
                  },
                  device: {
                    term: t('sections.interpretation.definitions.terms.device'),
                    description: t('sections.interpretation.definitions.descriptions.device'),
                  },
                  personalData: {
                    term: t('sections.interpretation.definitions.terms.personalData'),
                    description: t('sections.interpretation.definitions.descriptions.personalData'),
                  },
                  service: {
                    term: t('sections.interpretation.definitions.terms.service'),
                    description: t('sections.interpretation.definitions.descriptions.service'),
                  },
                  serviceProvider: {
                    term: t('sections.interpretation.definitions.terms.serviceProvider'),
                    description: t(
                      'sections.interpretation.definitions.descriptions.serviceProvider'
                    ),
                  },
                  thirdPartyService: {
                    term: t('sections.interpretation.definitions.terms.thirdPartyService'),
                    description: t(
                      'sections.interpretation.definitions.descriptions.thirdPartyService'
                    ),
                  },
                  usageData: {
                    term: t('sections.interpretation.definitions.terms.usageData'),
                    description: t('sections.interpretation.definitions.descriptions.usageData'),
                  },
                  website: {
                    term: t('sections.interpretation.definitions.terms.website'),
                    description: t('sections.interpretation.definitions.descriptions.website'),
                  },
                  you: {
                    term: t('sections.interpretation.definitions.terms.you'),
                    description: t('sections.interpretation.definitions.descriptions.you'),
                  },
                }).map(([key, { term, description }]) => (
                  <li key={key} className="text-muted-foreground leading-relaxed">
                    <strong className="text-foreground">{term}:</strong> {description}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Data Collection */}
          <section className="mb-8">
            <h2 className="text-foreground mb-4 text-2xl font-semibold">
              {t('sections.dataCollection.title')}
            </h2>

            <div className="mb-6">
              <h3 className="text-foreground mb-3 text-xl font-medium">
                {t('sections.dataCollection.typesOfData.title')}
              </h3>

              <div className="space-y-6">
                <div>
                  <h4 className="text-foreground mb-2 text-lg font-medium">
                    {t('sections.dataCollection.typesOfData.personalData.title')}
                  </h4>
                  <p className="text-muted-foreground mb-3 leading-relaxed">
                    {t('sections.dataCollection.typesOfData.personalData.intro')}
                  </p>
                  <ul
                    className={`text-muted-foreground list-disc space-y-1 ${isRTL ? 'mr-4 list-inside' : 'ml-4 list-inside'}`}
                  >
                    {t
                      .raw('sections.dataCollection.typesOfData.personalData.items')
                      .map((item: string, index: number) => (
                        <li key={index}>{item}</li>
                      ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-foreground mb-2 text-lg font-medium">
                    {t('sections.dataCollection.typesOfData.usageData.title')}
                  </h4>
                  <p className="text-muted-foreground mb-3 leading-relaxed">
                    {t('sections.dataCollection.typesOfData.usageData.content')}
                  </p>
                  <p className="text-muted-foreground mb-3 leading-relaxed">
                    {t('sections.dataCollection.typesOfData.usageData.description')}
                  </p>
                  <p className="text-muted-foreground mb-3 leading-relaxed">
                    {t('sections.dataCollection.typesOfData.usageData.mobileInfo')}
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    {t('sections.dataCollection.typesOfData.usageData.browserInfo')}
                  </p>
                </div>

                <div>
                  <h4 className="text-foreground mb-2 text-lg font-medium">
                    {t('sections.dataCollection.typesOfData.thirdPartyInfo.title')}
                  </h4>
                  <p className="text-muted-foreground mb-3 leading-relaxed">
                    {t('sections.dataCollection.typesOfData.thirdPartyInfo.intro')}
                  </p>
                  <ul
                    className={`text-muted-foreground mb-3 list-disc space-y-1 ${isRTL ? 'mr-4 list-inside' : 'ml-4 list-inside'}`}
                  >
                    {t
                      .raw('sections.dataCollection.typesOfData.thirdPartyInfo.services')
                      .map((service: string, index: number) => (
                        <li key={index}>{service}</li>
                      ))}
                  </ul>
                  <p className="text-muted-foreground mb-3 leading-relaxed">
                    {t('sections.dataCollection.typesOfData.thirdPartyInfo.dataCollection')}
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    {t('sections.dataCollection.typesOfData.thirdPartyInfo.additionalInfo')}
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-foreground mb-3 text-xl font-medium">
                {t('sections.dataCollection.trackingTechnologies.title')}
              </h3>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                {t('sections.dataCollection.trackingTechnologies.intro')}
              </p>

              <div className="space-y-4">
                <div>
                  <p className="text-muted-foreground leading-relaxed">
                    <strong className="text-foreground">
                      {t('sections.dataCollection.trackingTechnologies.labels.cookies')}
                    </strong>{' '}
                    {t('sections.dataCollection.trackingTechnologies.technologies.cookies')}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground leading-relaxed">
                    <strong className="text-foreground">
                      {t('sections.dataCollection.trackingTechnologies.labels.webBeacons')}
                    </strong>{' '}
                    {t('sections.dataCollection.trackingTechnologies.technologies.webBeacons')}
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  {t('sections.dataCollection.trackingTechnologies.cookieTypes.intro')}
                </p>
                <div className="space-y-4">
                  {Object.entries({
                    necessary: t.raw(
                      'sections.dataCollection.trackingTechnologies.cookieTypes.necessary'
                    ),
                    acceptance: t.raw(
                      'sections.dataCollection.trackingTechnologies.cookieTypes.acceptance'
                    ),
                    functionality: t.raw(
                      'sections.dataCollection.trackingTechnologies.cookieTypes.functionality'
                    ),
                  }).map(([key, cookieType]) => (
                    <div
                      key={key}
                      className={`border-primary ${isRTL ? 'border-r-4 pr-4' : 'border-l-4 pl-4'}`}
                    >
                      <h4 className="text-foreground mb-1 font-medium">{cookieType.title}</h4>
                      <p className="text-muted-foreground mb-2 text-sm">
                        <strong>
                          {t('sections.dataCollection.trackingTechnologies.labels.type')}
                        </strong>{' '}
                        {cookieType.type}
                      </p>
                      <p className="text-muted-foreground text-sm">
                        <strong>
                          {t('sections.dataCollection.trackingTechnologies.labels.purpose')}
                        </strong>{' '}
                        {cookieType.purpose}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-foreground mb-3 text-xl font-medium">
                {t('sections.dataCollection.useOfData.title')}
              </h3>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                {t('sections.dataCollection.useOfData.intro')}
              </p>
              <ul className="text-muted-foreground space-y-2">
                {t
                  .raw('sections.dataCollection.useOfData.purposes')
                  .map((purpose: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <span className={`text-primary ${isRTL ? 'ml-2' : 'mr-2'}`}>•</span>
                      <span>{purpose}</span>
                    </li>
                  ))}
              </ul>

              <div className="mt-6">
                <h4 className="text-foreground mb-2 text-lg font-medium">
                  {t('sections.dataCollection.useOfData.sharing.title')}
                </h4>
                <ul className="text-muted-foreground space-y-2">
                  {t
                    .raw('sections.dataCollection.useOfData.sharing.situations')
                    .map((situation: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <span className={`text-primary ${isRTL ? 'ml-2' : 'mr-2'}`}>•</span>
                        <span>{situation}</span>
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          </section>

          {/* Data Retention */}
          <section className="mb-8">
            <h2 className="text-foreground mb-4 text-2xl font-semibold">
              {t('sections.dataRetention.title')}
            </h2>
            <p className="text-muted-foreground mb-4 leading-relaxed">
              {t('sections.dataRetention.content')}
            </p>
            <p className="text-muted-foreground leading-relaxed">
              {t('sections.dataRetention.usageData')}
            </p>
          </section>

          {/* Data Transfer */}
          <section className="mb-8">
            <h2 className="text-foreground mb-4 text-2xl font-semibold">
              {t('sections.dataTransfer.title')}
            </h2>
            <p className="text-muted-foreground mb-4 leading-relaxed">
              {t('sections.dataTransfer.content')}
            </p>
            <p className="text-muted-foreground mb-4 leading-relaxed">
              {t('sections.dataTransfer.consent')}
            </p>
            <p className="text-muted-foreground leading-relaxed">
              {t('sections.dataTransfer.security')}
            </p>
          </section>

          {/* Delete Data */}
          <section className="mb-8">
            <h2 className="text-foreground mb-4 text-2xl font-semibold">
              {t('sections.deleteData.title')}
            </h2>
            <p className="text-muted-foreground mb-4 leading-relaxed">
              {t('sections.deleteData.rights')}
            </p>
            <p className="text-muted-foreground mb-4 leading-relaxed">
              {t('sections.deleteData.serviceAbility')}
            </p>
            <p className="text-muted-foreground mb-4 leading-relaxed">
              {t('sections.deleteData.howTo')}
            </p>
            <p className="text-muted-foreground leading-relaxed">
              {t('sections.deleteData.retention')}
            </p>
          </section>

          {/* Disclosure */}
          <section className="mb-8">
            <h2 className="text-foreground mb-4 text-2xl font-semibold">
              {t('sections.disclosure.title')}
            </h2>

            <div className="space-y-6">
              <div>
                <h3 className="text-foreground mb-3 text-xl font-medium">
                  {t('sections.disclosure.businessTransactions.title')}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {t('sections.disclosure.businessTransactions.content')}
                </p>
              </div>

              <div>
                <h3 className="text-foreground mb-3 text-xl font-medium">
                  {t('sections.disclosure.lawEnforcement.title')}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {t('sections.disclosure.lawEnforcement.content')}
                </p>
              </div>

              <div>
                <h3 className="text-foreground mb-3 text-xl font-medium">
                  {t('sections.disclosure.legalRequirements.title')}
                </h3>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  {t('sections.disclosure.legalRequirements.intro')}
                </p>
                <ul className="text-muted-foreground space-y-2">
                  {t
                    .raw('sections.disclosure.legalRequirements.reasons')
                    .map((reason: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <span className={`text-primary ${isRTL ? 'ml-2' : 'mr-2'}`}>•</span>
                        <span>{reason}</span>
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          </section>

          {/* Security */}
          <section className="mb-8">
            <h2 className="text-foreground mb-4 text-2xl font-semibold">
              {t('sections.security.title')}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {t('sections.security.content')}
            </p>
          </section>

          {/* Children's Privacy */}
          <section className="mb-8">
            <h2 className="text-foreground mb-4 text-2xl font-semibold">
              {t('sections.childrenPrivacy.title')}
            </h2>
            <p className="text-muted-foreground mb-4 leading-relaxed">
              {t('sections.childrenPrivacy.content')}
            </p>
            <p className="text-muted-foreground mb-4 leading-relaxed">
              {t('sections.childrenPrivacy.removal')}
            </p>
            <p className="text-muted-foreground leading-relaxed">
              {t('sections.childrenPrivacy.parentalConsent')}
            </p>
          </section>

          {/* External Links */}
          <section className="mb-8">
            <h2 className="text-foreground mb-4 text-2xl font-semibold">
              {t('sections.externalLinks.title')}
            </h2>
            <p className="text-muted-foreground mb-4 leading-relaxed">
              {t('sections.externalLinks.content')}
            </p>
            <p className="text-muted-foreground leading-relaxed">
              {t('sections.externalLinks.disclaimer')}
            </p>
          </section>

          {/* Changes */}
          <section className="mb-8">
            <h2 className="text-foreground mb-4 text-2xl font-semibold">
              {t('sections.changes.title')}
            </h2>
            <p className="text-muted-foreground mb-4 leading-relaxed">
              {t('sections.changes.notification')}
            </p>
            <p className="text-muted-foreground mb-4 leading-relaxed">
              {t('sections.changes.notice')}
            </p>
            <p className="text-muted-foreground leading-relaxed">{t('sections.changes.review')}</p>
          </section>

          {/* Contact */}
          <section className="mb-8">
            <h2 className="text-foreground mb-4 text-2xl font-semibold">
              {t('sections.contact.title')}
            </h2>
            <p className="text-muted-foreground mb-4 leading-relaxed">
              {t('sections.contact.intro')}
            </p>
            <p className="text-muted-foreground leading-relaxed">{t('sections.contact.email')}</p>
          </section>
        </div>
      </div>
    </div>
  );
}
