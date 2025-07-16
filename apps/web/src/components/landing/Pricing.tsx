import { getTranslations, getLocale } from 'next-intl/server';
import { Check } from 'lucide-react';
import { api } from '@qaddam/backend/convex/_generated/api';
import { fetchQuery } from 'convex/nextjs';
import { convexAuthNextjsToken } from '@convex-dev/auth/nextjs/server';
import { PricingCTAButton } from './CTAButton';

const SaudiRiyal = ({ className = '', size = 0.8 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 1124.14 1256.39"
    className={`inline-block ${className}`}
    style={{ width: `${size}em`, height: `${size}em`, verticalAlign: 'middle' }}
  >
    <path
      fill="currentColor"
      d="M699.62,1113.02h0c-20.06,44.48-33.32,92.75-38.4,143.37l424.51-90.24c20.06-44.47,33.31-92.75,38.4-143.37l-424.51,90.24Z"
    />
    <path
      fill="currentColor"
      d="M1085.73,895.8c20.06-44.47,33.32-92.75,38.4-143.37l-330.68,70.33v-135.2l292.27-62.11c20.06-44.47,33.32-92.75,38.4-143.37l-330.68,70.27V66.13c-50.67,28.45-95.67,66.32-132.25,110.99v403.35l-132.25,28.11V0c-50.67,28.44-95.67,66.32-132.25,110.99v525.69l-295.91,62.88c-20.06,44.47-33.33,92.75-38.42,143.37l334.33-71.05v170.26l-358.3,76.14c-20.06,44.47-33.32,92.75-38.4,143.37l375.04-79.7c30.53-6.35,56.77-24.4,73.83-49.24l68.78-101.97v-.02c7.14-10.55,11.3-23.27,11.3-36.97v-149.98l132.25-28.11v270.4l424.53-90.28Z"
    />
  </svg>
);

const Pricing = async () => {
  const t = await getTranslations('landing');
  const locale = await getLocale();
  const token = await convexAuthNextjsToken();
  const me = await fetchQuery(api.users.getMe, {}, { token });
  const renderCurrencySymbol = (currency: string) => {
    if (currency === 'USD') {
      return <span className="text-foreground text-4xl font-bold">$</span>;
    } else if (currency === 'SAR') {
      return <SaudiRiyal className="text-foreground" size={1} />;
    }
    return null;
  };

  const plans = [
    {
      name: t('pricing.plans.free.name'),
      price: t('pricing.plans.free.price'),
      currency: null, // Free plan has no currency
      features: [
        t('pricing.plans.free.features.0'),
        t('pricing.plans.free.features.1'),
        t('pricing.plans.free.features.2'),
        t('pricing.plans.free.features.3'),
      ],
      isPopular: false,
      buttonText: t('pricing.plans.free.button'),
      buttonClasses: 'bg-foreground text-background border-none',
      params: { p: 'f' },
      planType: 'free',
    },
    {
      name: t('pricing.plans.pro.name'),
      price: t('pricing.plans.pro.price'),
      currency: t('pricing.plans.pro.currency'),
      priceDetail: t('pricing.plans.pro.price_detail'),
      features: [
        t('pricing.plans.pro.features.0'),
        t('pricing.plans.pro.features.1'),
        t('pricing.plans.pro.features.2'),
        t('pricing.plans.pro.features.3'),
        t('pricing.plans.pro.features.4'),
        t('pricing.plans.pro.features.5'),
      ],
      isPopular: true,
      buttonText: t('pricing.plans.pro.button'),
      buttonClasses: 'bg-primary text-primary-foreground border-none',
      params: { p: 'p' },
      planType: 'pro',
    },
  ];

  return (
    <section className="bg-muted px-4 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <h2 className="text-foreground mb-4 text-4xl font-bold md:text-5xl">
            {t('pricing.title')}
          </h2>
          <p className="text-muted-foreground text-lg">{t('pricing.description')}</p>
        </div>

        <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`rounded-2xl border-2 bg-white p-8 shadow-sm transition-all duration-200 hover:shadow-lg ${
                plan.isPopular ? 'border-primary relative' : 'border-border hover:border-gray-200'
              }`}
            >
              {plan.isPopular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 transform">
                  <span className="bg-primary text-primary-foreground rounded-full px-4 py-2 text-sm font-medium">
                    {t('pricing.popular')}
                  </span>
                </div>
              )}

              <div className="mb-8 text-center">
                <h3 className="text-foreground mb-2 text-2xl font-bold">{plan.name}</h3>
                <div className="flex items-center justify-center space-x-2 space-x-reverse">
                  {locale === 'ar' ? (
                    // Arabic: price first (right), then currency (left)
                    <>
                      <span className="text-foreground text-4xl font-bold">{plan.price}</span>
                      {plan.currency && renderCurrencySymbol(plan.currency)}
                    </>
                  ) : (
                    // English: currency first (left), then price (right)
                    <>
                      {plan.currency && renderCurrencySymbol(plan.currency)}
                      <span className="text-foreground text-4xl font-bold">{plan.price}</span>
                    </>
                  )}
                  {
                    plan.price !== 'Free' &&
                      plan.price !== 'مجاناً' &&
                      '/' /* Split between price and currency */
                  }
                  {plan.priceDetail && (
                    <span className="text-muted-foreground">{plan.priceDetail}</span>
                  )}
                </div>
              </div>

              <ul className="mb-8 space-y-4">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center space-x-3 space-x-reverse">
                    <div className="flex-shrink-0">
                      <Check className="h-5 w-5 text-green-500" />
                    </div>
                    <span className="text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
                <PricingCTAButton
                  href={`/sign?${new URLSearchParams(plan.params).toString()}`}
                  planType={plan.planType}
                  className={`w-full rounded-xl py-3 text-lg font-semibold transition-all duration-200 ${plan.buttonClasses}`}
                >
                  {plan.buttonText}
                </PricingCTAButton>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
