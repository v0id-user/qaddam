import { useTranslations } from 'next-intl';
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const Pricing = () => {
  const t = useTranslations('landing');
  
  const plans = [
    {
      name: t('pricing.plans.free.name'),
      price: t('pricing.plans.free.price'),
      features: [
        t('pricing.plans.free.features.0'),
        t('pricing.plans.free.features.1'),
        t('pricing.plans.free.features.2'),
        t('pricing.plans.free.features.3')
      ],
      isPopular: false,
      buttonText: t('pricing.plans.free.button'),
      buttonClasses: "bg-foreground text-background border-none"
    },
    {
      name: t('pricing.plans.pro.name'),
      price: t('pricing.plans.pro.price'),
      priceDetail: t('pricing.plans.pro.price_detail'),
      features: [
        t('pricing.plans.pro.features.0'),
        t('pricing.plans.pro.features.1'),
        t('pricing.plans.pro.features.2'),
        t('pricing.plans.pro.features.3'),
        t('pricing.plans.pro.features.4'),
        t('pricing.plans.pro.features.5')
      ],
      isPopular: true,
      buttonText: t('pricing.plans.pro.button'),
      buttonClasses: "bg-primary text-primary-foreground border-none"
    }
  ];

  return (
    <section className="py-20 px-4 bg-muted">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            {t('pricing.title')}
          </h2>
          <p className="text-lg text-muted-foreground">
            {t('pricing.description')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`bg-white rounded-2xl p-8 shadow-sm border-2 transition-all duration-200 hover:shadow-lg ${
                plan.isPopular 
                  ? 'relative border-primary' 
                  : 'border-border hover:border-gray-200'
              }`}
            >
              {plan.isPopular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="px-4 py-2 rounded-full text-sm font-medium bg-primary text-primary-foreground">
                    {t('pricing.popular')}
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2 text-foreground">
                  {plan.name}
                </h3>
                <div className="flex items-center justify-center space-x-2 space-x-reverse">
                  <span className="text-4xl font-bold text-foreground">
                    {plan.price}
                  </span>
                  {plan.priceDetail && (
                    <span className="text-muted-foreground">
                      {plan.priceDetail}
                    </span>
                  )}
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center space-x-3 space-x-reverse">
                    <div className="flex-shrink-0">
                      <Check className="w-5 h-5 text-green-500" />
                    </div>
                    <span className="text-foreground">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Button 
                className={`w-full py-3 text-lg font-semibold rounded-xl transition-all duration-200 ${plan.buttonClasses}`}
              >
                {plan.buttonText}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
