'use client';

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { profileService, Profile } from '@/lib/profile-service';

export interface SuggestedUser {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  isVerified: boolean;
  isPro: boolean;
  followersCount: number;
}

async function fetchSuggestedUsers(limit: number = 3): Promise<SuggestedUser[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const followingIds = await getFollowingIds(user.id);
  const excludeIds = [user.id, ...followingIds];

  const { data, error } = await supabase
    .from('profiles')
    .select('user_id, username, display_name, avatar, is_verified, is_pro, followers_count')
    .not('user_id', 'in', `(${excludeIds.map(id => `'${id}'`).join(',')})`)
    .order('followers_count', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching suggested users:', error);
    return [];
  }

  return (data || []).map((p: any) => ({
    id: p.user_id,
    username: p.username,
    displayName: p.display_name || p.username,
    avatar: p.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.username}`,
    isVerified: p.is_verified || false,
    isPro: p.is_pro || false,
    followersCount: p.followers_count || 0,
  }));
}

async function getFollowingIds(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', userId);

  if (error || !data) return [];
  return data.map(f => f.following_id);
}

export function useSuggestedUsers(limit: number = 3) {
  return useQuery({
    queryKey: ['suggested-users', limit],
    queryFn: () => fetchSuggestedUsers(limit),
    staleTime: 5 * 60 * 1000,
  });
}
