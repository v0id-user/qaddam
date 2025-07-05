import { Authenticated } from 'convex/react';
import { SidebarProvider } from '@/components/ui/sidebar';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  return (
    <Authenticated>
      <SidebarProvider>
        {children}
      </SidebarProvider>
    </Authenticated>
  );
}
