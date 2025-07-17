import type { Metadata } from 'next';
import { Geist, Geist_Mono, IBM_Plex_Sans_Arabic } from 'next/font/google';
import '@/index.css';
import { ConvexAuthNextjsServerProvider } from '@convex-dev/auth/nextjs/server';
import { NextIntlClientProvider } from 'next-intl';
import Providers from '@/components/providers';
import { Toaster } from 'react-hot-toast';
import { getTranslations } from 'next-intl/server';
import { WebVitals } from '@/lib/axiom/client';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const arabicFont = IBM_Plex_Sans_Arabic({
  weight: ['100', '200', '300', '400', '500', '600', '700'],
  subsets: ['arabic'],
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale });

  return {
    title: t('metadata.title'),
    description: t('metadata.description'),
  };
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <ConvexAuthNextjsServerProvider>
      <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'} suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} ${arabicFont.className} antialiased`}
        >
          <Toaster />
          <NextIntlClientProvider>
            <Providers>
              <WebVitals />
              <div className="grid h-svh grid-rows-[auto_1fr]">{children}</div>
            </Providers>
          </NextIntlClientProvider>
        </body>
      </html>
    </ConvexAuthNextjsServerProvider>
  );
}
