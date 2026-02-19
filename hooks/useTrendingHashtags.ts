'use client';

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface TrendingHashtag {
  id: string;
  tag: string;
  tweetCount: number;
}

export function useTrendingHashtags(limit: number = 5) {
  return useQuery({
    queryKey: ['trending-hashtags', limit],
    queryFn: async (): Promise<TrendingHashtag[]> => {
      const { data, error } = await (supabase as any)
        .from('hashtags')
        .select('id, tag, tweet_count')
        .order('tweet_count', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching trending hashtags:', error);
        return [];
      }

      return (data || []).map((h: any) => ({
        id: h.id,
        tag: h.tag,
        tweetCount: h.tweet_count || 0,
      }));
    },
    staleTime: 5 * 60 * 1000,
  });
}
