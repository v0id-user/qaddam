import type { Metadata } from "next";
import { Geist, Geist_Mono, IBM_Plex_Sans_Arabic } from "next/font/google";
import "../index.css";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import {NextIntlClientProvider} from 'next-intl';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const arabicFont = IBM_Plex_Sans_Arabic({
  weight: ['100', '200', '300', '400', '500', '600', '700'],
  subsets: ['arabic'],
});


export const metadata: Metadata = {
  title: "qaddam",
  description: "qaddam",
};

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;

  return (
    <ConvexAuthNextjsServerProvider>
      <html lang={locale} dir={locale === "ar" ? "rtl" : "ltr"} suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} ${arabicFont.className} antialiased`}
        >
          <NextIntlClientProvider>
            <div className="grid grid-rows-[auto_1fr] h-svh">
              {children}
            </div>
          </NextIntlClientProvider>
        </body>
      </html>
    </ConvexAuthNextjsServerProvider>
  );
}
