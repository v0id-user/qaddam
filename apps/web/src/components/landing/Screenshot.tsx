import { useTranslations } from 'next-intl';

const Screenshot = () => {
  const t = useTranslations('landing');
  
  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            {t('screenshot.title')}
          </h2>
          <p className="text-lg text-muted-foreground">
            {t('screenshot.description')}
          </p>
        </div>

        <div className="relative">
          {/* Placeholder for screenshot */}
          <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl h-96 md:h-[500px] flex items-center justify-center shadow-2xl border border-border">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">
                  {t('screenshot.coming_soon')}
                </h3>
                <p className="text-muted-foreground">
                  {t('screenshot.preview')}
                </p>
              </div>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-indigo-100 rounded-full blur-2xl opacity-30"></div>
          <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-purple-100 rounded-full blur-2xl opacity-20"></div>
        </div>
      </div>
    </section>
  );
};

export default Screenshot;
