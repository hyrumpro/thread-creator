import { supabase } from '@/integrations/supabase/client';

export interface Profile {
  user_id: string;
  username: string;
  display_name: string;
  bio?: string;
  avatar?: string;
  cover_image?: string;
  location?: string;
  website?: string;
  is_verified: boolean;
  is_pro: boolean;
  followers_count: number;
  following_count: number;
  tweets_count: number;
  created_at: string;
  updated_at: string;
}

export interface UpdateProfileData {
  username?: string;
  display_name?: string;
  bio?: string;
  avatar?: string;
  cover_image?: string;
  location?: string;
  website?: string;
}

export const profileService = {
  // Get current user's profile
  async getCurrentProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) throw error;
    return data as Profile;
  },

  // Get profile by username
  async getProfileByUsername(username: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', username)
      .single();

    if (error) throw error;
    return data as Profile;
  },

  // Get profile by user ID
  async getProfileById(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data as Profile;
  },

  // Update profile
  async updateProfile(updates: UpdateProfileData) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data as Profile;
  },

  // Upgrade to Pro
  async upgradeToPro() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('profiles')
      .update({ is_pro: true })
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data as Profile;
  },

  // Check if user has Pro subscription
  async checkProStatus() {
    const profile = await this.getCurrentProfile();
    return profile.is_pro;
  },

  // Follow a user
  async followUser(followingId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('follows')
      .insert({
        follower_id: user.id,
        following_id: followingId,
      });

    if (error) throw error;
  },

  // Unfollow a user
  async unfollowUser(followingId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', user.id)
      .eq('following_id', followingId);

    if (error) throw error;
  },

  // Check if following a user
  async isFollowing(followingId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', user.id)
      .eq('following_id', followingId)
      .single();

    return !!data && !error;
  },

  // Get followers
  async getFollowers(userId: string) {
    const { data, error } = await supabase
      .from('follows')
      .select(`
        follower:profiles!follows_follower_id_fkey(*)
      `)
      .eq('following_id', userId);

    if (error) throw error;
    return data.map(f => f.follower);
  },

  // Get following
  async getFollowing(userId: string) {
    const { data, error } = await supabase
      .from('follows')
      .select(`
        following:profiles!follows_following_id_fkey(*)
      `)
      .eq('follower_id', userId);

    if (error) throw error;
    return data.map(f => f.following);
  },
};
