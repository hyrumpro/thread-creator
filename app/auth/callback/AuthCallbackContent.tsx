'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/integrations/supabase/client';
import { authService } from '@/lib/auth';

export function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const errorParam = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');
        
        if (errorParam) {
          console.error('OAuth error:', errorParam, errorDescription);
          router.push(`/login?error=${encodeURIComponent(errorDescription || errorParam)}`);
          return;
        }

        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Error during auth callback:', error);
          router.push('/login?error=auth_callback_failed');
          return;
        }

        if (session?.user) {
          const isOAuthUser = session.user.app_metadata?.provider !== 'email';
          
          if (isOAuthUser) {
            try {
              await authService.createProfileIfNotExists(
                session.user.id,
                session.user.email || '',
                session.user.user_metadata
              );
            } catch (profileError: any) {
              console.error('Profile creation error:', profileError);
              if (!profileError.message?.includes('already exists')) {
                router.push('/login?error=profile_creation_failed');
                return;
              }
            }
          }

          const redirectTo = searchParams.get('redirect') || '/';
          router.push(redirectTo);
        } else {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(
            window.location.href
          );
          
          if (exchangeError) {
            console.error('Exchange error:', exchangeError);
            router.push('/login?error=session_exchange_failed');
            return;
          }

          const { data: { session: newSession } } = await supabase.auth.getSession();
          
          if (newSession?.user) {
            const isOAuthUser = newSession.user.app_metadata?.provider !== 'email';
            
            if (isOAuthUser) {
              try {
                await authService.createProfileIfNotExists(
                  newSession.user.id,
                  newSession.user.email || '',
                  newSession.user.user_metadata
                );
              } catch (profileError: any) {
                console.error('Profile creation error:', profileError);
              }
            }
            router.push('/');
          } else {
            router.push('/login');
          }
        }
      } catch (error) {
        console.error('Callback error:', error);
        router.push('/login?error=callback_error');
      }
    };

    handleCallback();
  }, [router, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="text-muted-foreground">Completing sign in...</p>
        <p className="text-xs text-muted-foreground">Setting up your profile</p>
      </div>
    </div>
  );
}
