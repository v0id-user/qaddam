'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAction } from 'convex/react';
import { api } from '@qaddam/backend/convex/_generated/api';
import { toast } from 'sonner';

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

export default function UpgradePage() {
  const t = useTranslations('landing');
  const locale = useLocale();
  const [isLoading, setIsLoading] = useState(false);
  const generateCheckoutLink = useAction(api.polar.generateCheckoutLink);

  const renderCurrencySymbol = (currency: string) => {
    if (currency === 'USD') {
      return <span className="text-foreground text-4xl font-bold">$</span>;
    } else if (currency === 'SAR') {
      return <SaudiRiyal className="text-foreground" size={1} />;
    }
    return null;
  };

  const proPlan = {
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
    buttonText: t('pricing.plans.pro.button'),
  };

  const handleUpgrade = async () => {
    try {
      setIsLoading(true);
      const checkoutResult = await generateCheckoutLink({
        // TODO: This is so bad, we need to fix this, to env variable or something
        productIds: ['b97a0870-765f-4e94-8cee-f8099a7e1edb'],
        origin: window.location.origin,
        successUrl: `${window.location.origin}/dashboard?upgrade=success`,
      });
      
      if (checkoutResult?.url) {
        window.location.href = checkoutResult.url;
      } else {
        throw new Error('Failed to generate checkout link');
      }
    } catch (error) {
      console.error('Upgrade error:', error);
      toast.error(t('pricing.upgrade_error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8 text-center">
        <h1 className="text-foreground mb-4 text-4xl font-bold md:text-5xl">
          {t('pricing.upgrade_title')}
        </h1>
        <p className="text-muted-foreground text-lg">
          {t('pricing.upgrade_subtitle')}
        </p>
      </div>

      <Card className="relative rounded-2xl border-2 border-primary bg-white p-8 shadow-lg">
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 transform">
          <span className="bg-primary text-primary-foreground rounded-full px-4 py-2 text-sm font-medium">
            {t('pricing.popular')}
          </span>
        </div>

        <div className="mb-8 text-center">
          <h2 className="text-foreground mb-2 text-2xl font-bold">{proPlan.name}</h2>
          <div className="flex items-center justify-center space-x-2 space-x-reverse">
            {locale === 'ar' ? (
              // Arabic: price first (right), then currency (left)
              <>
                <span className="text-foreground text-4xl font-bold">{proPlan.price}</span>
                {proPlan.currency && renderCurrencySymbol(proPlan.currency)}
              </>
            ) : (
              // English: currency first (left), then price (right)
              <>
                {proPlan.currency && renderCurrencySymbol(proPlan.currency)}
                <span className="text-foreground text-4xl font-bold">{proPlan.price}</span>
              </>
            )}
            {proPlan.price !== 'Free' && proPlan.price !== 'مجاناً' && '/'}
            {proPlan.priceDetail && (
              <span className="text-muted-foreground">{proPlan.priceDetail}</span>
            )}
          </div>
        </div>

        <ul className="mb-8 space-y-4">
          {proPlan.features.map((feature, index) => (
            <li key={index} className="flex items-center space-x-3 space-x-reverse">
              <div className="flex-shrink-0">
                <Check className="h-5 w-5 text-green-500" />
              </div>
              <span className="text-foreground">{feature}</span>
            </li>
          ))}
        </ul>

        <Button
          onClick={handleUpgrade}
          disabled={isLoading}
          className="w-full rounded-xl py-3 text-lg font-semibold bg-primary text-primary-foreground border-none hover:bg-primary/90 transition-all duration-200"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('pricing.processing')}
            </>
          ) : (
            proPlan.buttonText
          )}
        </Button>
      </Card>
    </div>
  );
}
