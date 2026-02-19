'use client';

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SearchResult {
  id: string;
  type: 'user' | 'hashtag';
  username?: string;
  displayName?: string;
  avatar?: string;
  isVerified?: boolean;
  tag?: string;
  tweetCount?: number;
}

async function searchContent(query: string, limit: number = 10): Promise<SearchResult[]> {
  if (!query.trim()) return [];

  const cleanQuery = query.trim().replace(/^#/, '');
  const results: SearchResult[] = [];

  if (query.startsWith('#')) {
    const { data: hashtagData, error: hashtagError } = await supabase
      .from('hashtags')
      .select('id, tag, tweet_count')
      .ilike('tag', `${cleanQuery}%`)
      .order('tweet_count', { ascending: false })
      .limit(limit);

    if (!hashtagError && hashtagData) {
      results.push(...hashtagData.map(h => ({
        id: h.id,
        type: 'hashtag' as const,
        tag: h.tag,
        tweetCount: h.tweet_count || 0,
      })));
    }
  } else {
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('user_id, username, display_name, avatar, is_verified')
      .or(`username.ilike.%${cleanQuery}%,display_name.ilike.%${cleanQuery}%`)
      .order('followers_count', { ascending: false })
      .limit(limit);

    if (!userError && userData) {
      results.push(...userData.map(u => ({
        id: u.user_id,
        type: 'user' as const,
        username: u.username,
        displayName: u.display_name || u.username,
        avatar: u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`,
        isVerified: u.is_verified || false,
      })));
    }

    const { data: hashtagData, error: hashtagError } = await supabase
      .from('hashtags')
      .select('id, tag, tweet_count')
      .ilike('tag', `${cleanQuery}%`)
      .order('tweet_count', { ascending: false })
      .limit(3);

    if (!hashtagError && hashtagData) {
      results.push(...hashtagData.map(h => ({
        id: h.id,
        type: 'hashtag' as const,
        tag: h.tag,
        tweetCount: h.tweet_count || 0,
      })));
    }
  }

  return results;
}

export function useSearch(query: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['search', query],
    queryFn: () => searchContent(query),
    enabled: enabled && query.trim().length > 0,
    staleTime: 30 * 1000,
  });
}
