import { getTranslations } from 'next-intl/server';

const Footer = async () => {
  const t = await getTranslations('landing');

  return (
    <footer className="bg-background text-primary border-t border-white/10 px-4 py-12">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="text-primary text-2xl font-bold">{t('footer.brand')}</h3>
            <p className="opacity-70">{t('footer.tagline')}</p>
          </div>

          {/* Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">{t('footer.quick_links.title')}</h4>
            <ul className="space-y-2 opacity-70">
              <li>
                <a href="#" className="transition-opacity hover:opacity-100">
                  {t('footer.quick_links.how_it_works')}
                </a>
              </li>
              <li>
                <a href="#" className="transition-opacity hover:opacity-100">
                  {t('footer.quick_links.pricing')}
                </a>
              </li>
              <li>
                <a href="#" className="transition-opacity hover:opacity-100">
                  {t('footer.quick_links.help')}
                </a>
              </li>
              <li>
                <a href="#" className="transition-opacity hover:opacity-100">
                  {t('footer.quick_links.contact')}
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">{t('footer.legal.title')}</h4>
            <ul className="space-y-2 opacity-70">
              <li>
                <a href="/privacy" className="transition-opacity hover:opacity-100">
                  {t('footer.legal.privacy')}
                </a>
              </li>
              <li>
                <a href="/terms" className="transition-opacity hover:opacity-100">
                  {t('footer.legal.terms')}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-white/10 pt-8 text-center opacity-70">
          <p>{t('footer.copyright')}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
