'use client';

import { MainLayout } from '@/components/layout/MainLayout';
import { MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function MessagesPage() {
  return (
    <MainLayout showRightSidebar={false}>
      <section className='flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-6'>
        <div className='w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center'>
          <MessageSquare className='w-8 h-8 text-primary' />
        </div>
        <div className='max-w-2xl space-y-4'>
          <h1 className='text-2xl font-bold'>Direct Messages</h1>
          <p className='text-muted-foreground'>Secure conversations between creators will live here. Messaging UX is still in progress, but your inbox is ready for future drops.</p>
          <Button className='rounded-full px-6 py-2' disabled>
            Start a conversation
          </Button>
        </div>
      </section>
    </MainLayout>
  );
}

