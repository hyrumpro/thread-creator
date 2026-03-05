'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/integrations/supabase/client';
import { authService } from '@/lib/auth';

// Helper shared by both session paths
async function resolveSession(
  user: NonNullable<Awaited<ReturnType<typeof supabase.auth.getSession>>['data']['session']>['user'],
  email: string,
  isNewUser: boolean,
  isOAuthUser: boolean
) {
  // DB trigger (handle_new_user) always creates the profile on INSERT into auth.users.
  // createProfileIfNotExists is only called as a safety net for new OAuth/magic-link users
  // in case the trigger somehow failed. Returning users skip this entirely (perf).
  if (isNewUser && isOAuthUser) {
    try {
      await authService.createProfileIfNotExists(user.id, email, user.user_metadata);
    } catch {
      // Trigger already created it — safe to ignore
    }
  }
}

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
          const isNewUser = Date.now() - new Date(session.user.created_at).getTime() < 5 * 60 * 1000;

          await resolveSession(session.user, session.user.email ?? '', isNewUser, isOAuthUser);

          // OAuth users go to onboarding (page skips if already completed)
          if (isOAuthUser) {
            router.push('/onboarding');
          } else {
            router.push(searchParams.get('redirect') ?? '/');
          }
        } else {
          // PKCE code exchange path (magic link, some OAuth flows)
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
            const isNewUser = Date.now() - new Date(newSession.user.created_at).getTime() < 5 * 60 * 1000;

            await resolveSession(newSession.user, newSession.user.email ?? '', isNewUser, isOAuthUser);

            if (isOAuthUser) {
              router.push('/onboarding');
            } else {
              router.push('/');
            }
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
