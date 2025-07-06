'use client';

import { DashboardSidebar } from '@/components/dashboard/sidebar';
import { useQuery } from 'convex/react';
import { api } from '@qaddam/backend/convex/_generated/api';

export default function ClientDashBoard() {
  const me = useQuery(api.users.getMe);

  if (!me) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }


  return (
    <DashboardSidebar 
      variant="sidebar"
      user={{
        name: me.name ?? '',
        email: me.email ?? '',
        avatar: me.avatar?.toString() ?? '',
        userId: me.userId?.toString() ?? '',
      }}
    />
  );
}