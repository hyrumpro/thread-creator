'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSession } from '@/hooks/useAuth';
import { useCurrentProfile, profileKeys } from '@/hooks/useProfileQuery';
import { profileService } from '@/lib/profile-service';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function Onboarding() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: authUser, isLoading: authLoading } = useSession();
  const { data: profile, isLoading: profileLoading } = useCurrentProfile();

  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !authUser) {
      router.replace('/login');
      return;
    }
    // Already completed onboarding — skip straight to home
    if (!authLoading && authUser && localStorage.getItem('onboarding_done') === '1') {
      router.replace('/');
    }
  }, [authUser, authLoading, router]);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '');
      setUsername(profile.username || '');
    }
  }, [profile]);

  const validateUsername = (val: string) => {
    if (val.length < 3) return 'At least 3 characters required';
    if (val.length > 15) return 'Maximum 15 characters';
    if (!/^[a-zA-Z0-9_]+$/.test(val)) return 'Letters, numbers and underscores only';
    return '';
  };

  const handleUsernameChange = (val: string) => {
    const clean = val.toLowerCase().replace(/[^a-z0-9_]/g, '');
    setUsername(clean);
    setUsernameError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const err = validateUsername(username);
    if (err) { setUsernameError(err); return; }
    if (!displayName.trim()) { toast.error('Please enter your name'); return; }

    setIsSaving(true);
    try {
      await profileService.updateProfile({
        display_name: displayName.trim(),
        username: username.trim(),
      });
      localStorage.setItem('onboarding_done', '1');
      await queryClient.invalidateQueries({ queryKey: profileKeys.current() });
      router.replace('/');
    } catch (error: any) {
      if (error.message?.includes('unique') || error.message?.includes('duplicate') || error.code === '23505') {
        setUsernameError('This username is already taken');
      } else {
        toast.error(error.message || 'Failed to save profile');
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading || profileLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <svg viewBox="0 0 24 24" className="w-10 h-10 fill-foreground mx-auto mb-4">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          <h1 className="text-2xl font-bold">Set up your profile</h1>
          <p className="text-muted-foreground mt-1 text-sm">Choose how you appear to others</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="displayName">Name</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name"
              className="h-12"
              maxLength={50}
              autoComplete="name"
            />
            <p className="text-xs text-muted-foreground">Shown on your profile and posts.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground select-none">@</span>
              <Input
                id="username"
                value={username}
                onChange={(e) => handleUsernameChange(e.target.value)}
                placeholder="username"
                className={`h-12 pl-7 ${usernameError ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                maxLength={15}
                autoComplete="username"
              />
            </div>
            {usernameError ? (
              <p className="text-xs text-destructive">{usernameError}</p>
            ) : (
              <p className="text-xs text-muted-foreground">3–15 characters. Letters, numbers, underscores.</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full h-12 text-base font-bold rounded-full"
            disabled={isSaving}
          >
            {isSaving ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</>
            ) : (
              "Let's go"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
