'use client';

import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { ThemeProvider } from './theme-provider';
import { Toaster } from './ui/sonner';
import { ConvexAuthNextjsProvider } from '@convex-dev/auth/nextjs';
import { NuqsAdapter } from 'nuqs/adapters/next/app'

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <ConvexProvider client={convex}>
        <ConvexAuthNextjsProvider client={convex}>
          <NuqsAdapter>{children}</NuqsAdapter>
        </ConvexAuthNextjsProvider>
      </ConvexProvider>
      <Toaster richColors />
    </ThemeProvider>
  );
}
