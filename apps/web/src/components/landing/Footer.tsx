import { useTranslations } from 'next-intl';

const Footer = () => {
  const t = useTranslations('landing');
  
  return (
    <footer className="py-12 px-4 bg-background text-primary border-t border-white/10">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-primary">
              {t('footer.brand')}
            </h3>
            <p className="opacity-70" dir="ltr">
              {t('footer.tagline')}
            </p>
          </div>

          {/* Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">{t('footer.quick_links.title')}</h4>
            <ul className="space-y-2 opacity-70">
              <li><a href="#" className="hover:opacity-100 transition-opacity">{t('footer.quick_links.how_it_works')}</a></li>
              <li><a href="#" className="hover:opacity-100 transition-opacity">{t('footer.quick_links.pricing')}</a></li>
              <li><a href="#" className="hover:opacity-100 transition-opacity">{t('footer.quick_links.help')}</a></li>
              <li><a href="#" className="hover:opacity-100 transition-opacity">{t('footer.quick_links.contact')}</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">{t('footer.legal.title')}</h4>
            <ul className="space-y-2 opacity-70">
              <li><a href="#" className="hover:opacity-100 transition-opacity">{t('footer.legal.privacy')}</a></li>
              <li><a href="#" className="hover:opacity-100 transition-opacity">{t('footer.legal.terms')}</a></li>
              <li><a href="#" className="hover:opacity-100 transition-opacity">{t('footer.legal.cookies')}</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 text-center opacity-70 border-t border-white/10">
          <p dir="ltr">{t('footer.copyright')}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
