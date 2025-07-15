import { getTranslations } from 'next-intl/server';

const Screenshot = async () => {
  const t = await getTranslations('landing');

  return (
    <section className="bg-white px-4 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <h2 className="text-foreground mb-4 text-4xl font-bold md:text-5xl">
            {t('screenshot.title')}
          </h2>
          <p className="text-muted-foreground text-lg">{t('screenshot.description')}</p>
        </div>

        <div className="relative">
          {/* Placeholder for screenshot */}
          <div className="border-border flex h-96 items-center justify-center rounded-2xl border bg-gradient-to-br from-gray-100 to-gray-200 shadow-2xl md:h-[500px]">
            <div className="space-y-4 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100">
                <svg
                  className="text-primary h-8 w-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-foreground mb-2 text-xl font-semibold">
                  {t('screenshot.coming_soon')}
                </h3>
                <p className="text-muted-foreground">{t('screenshot.preview')}</p>
              </div>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-indigo-100 opacity-30 blur-2xl"></div>
          <div className="absolute -bottom-4 -left-4 h-32 w-32 rounded-full bg-purple-100 opacity-20 blur-2xl"></div>
        </div>
      </div>
    </section>
  );
};

export default Screenshot;
