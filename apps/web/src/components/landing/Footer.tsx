import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
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
                <Link
                  href="https://github.com/v0id-user/qaddam"
                  className="transition-opacity hover:opacity-100"
                >
                  {t('footer.quick_links.how_it_works')}
                </Link>
              </li>
              <li>
                <Link
                  href="https://github.com/v0id-user/qaddam"
                  className="transition-opacity hover:opacity-100"
                  target="_blank"
                >
                  {t('footer.quick_links.pricing')}
                </Link>
              </li>
              <li>
                <Link
                  href="https://github.com/v0id-user/qaddam"
                  className="transition-opacity hover:opacity-100"
                  target="_blank"
                >
                  {t('footer.quick_links.help')}
                </Link>
              </li>
              <li>
                <Link
                  href="https://github.com/v0id-user/qaddam"
                  className="transition-opacity hover:opacity-100"
                  target="_blank"
                >
                  {t('footer.quick_links.contact')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">{t('footer.legal.title')}</h4>
            <ul className="space-y-2 opacity-70">
              <li>
                <Link href="/privacy" className="transition-opacity hover:opacity-100">
                  {t('footer.legal.privacy')}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="transition-opacity hover:opacity-100">
                  {t('footer.legal.terms')}
                </Link>
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
