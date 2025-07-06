'use client';
import { Authenticated } from 'convex/react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import ClientDashBoard from './ClientDashBoard';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  return (
    <Authenticated>
      <SidebarProvider>
        <ClientDashBoard />
        <main className="flex-1 p-4">
          <SidebarTrigger />
          {children}
        </main>
      </SidebarProvider>
    </Authenticated>
  );
}
