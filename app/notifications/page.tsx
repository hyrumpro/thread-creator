'use client';

import { MainLayout } from '@/components/layout/MainLayout';
import { Bell } from 'lucide-react';

export default function NotificationsPage() {
  return (
    <MainLayout>
      <section className='flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-6'>
        <div className='w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center'>
          <Bell className='w-8 h-8 text-primary' />
        </div>
        <div>
          <h1 className='text-2xl font-bold'>Notifications</h1>
          <p className='text-muted-foreground mt-2 max-w-md'>Real-time alerts for mentions, follows, and engagement will appear here soon. For now you can keep exploring the Home feed.</p>
        </div>
      </section>
    </MainLayout>
  );
}

