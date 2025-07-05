'use client';

import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { ThemeProvider } from './theme-provider';
import { Toaster } from './ui/sonner';
import { ConvexAuthNextjsProvider } from '@convex-dev/auth/nextjs';

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <ConvexProvider client={convex}>
        <ConvexAuthNextjsProvider client={convex}>{children}</ConvexAuthNextjsProvider>
      </ConvexProvider>
      <Toaster richColors />
    </ThemeProvider>
  );
}
