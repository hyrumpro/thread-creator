import { supabase } from '@/integrations/supabase/client';

export interface SignUpData {
  email: string;
  password: string;
  username: string;
  displayName: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface ProfileData {
  username: string;
  display_name: string;
  bio?: string;
  avatar?: string;
  cover_image?: string;
  location?: string;
  website?: string;
}

export const authService = {
  // Sign up with email and password
  async signUp({ email, password, username, displayName }: SignUpData) {
    // Check if username is already taken
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', username)
      .single();

    if (existingUser) {
      throw new Error('Username is already taken');
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          display_name: displayName,
        },
      },
    });

    if (error) throw error;

    // Profile will be created automatically by database trigger
    // The trigger will use username and display_name from raw_user_meta_data
    return data;
  },

  // Sign in with email and password
  async signIn({ email, password }: SignInData) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  },

  // Sign in with magic link (OTP)
  async signInWithMagicLink(email: string) {
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) throw error;
    return data;
  },

  // Sign in with Google OAuth
  async signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) throw error;
    return data;
  },

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Get current session
  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  // Get current user
  async getUser() {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data.user;
  },

  // Get user profile
  async getUserProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data;
  },

  // Get profile by username
  async getProfileByUsername(username: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', username)
      .single();

    if (error) throw error;
    return data;
  },

  // Update user profile
  async updateProfile(userId: string, updates: Partial<ProfileData>) {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Create profile for OAuth users (if not exists)
  async createProfileIfNotExists(userId: string, email: string, metadata: any) {
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('user_id', userId)
      .single();

    if (existingProfile) return existingProfile;

    // Generate username from email or name
    let baseUsername = email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_').slice(0, 12);
    const displayName = metadata.full_name || metadata.name || baseUsername;

    // Ensure username is unique with retry logic
    let username = baseUsername;
    let suffix = 1;
    let isUnique = false;

    while (!isUnique && suffix <= 100) {
      const { data: usernameCheck } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username);

      if (!usernameCheck || usernameCheck.length === 0) {
        isUnique = true;
      } else {
        username = `${baseUsername}_${suffix}`;
        suffix++;
      }
    }

    if (!isUnique) {
      username = `${baseUsername}_${Date.now().toString(36)}`;
    }

    const { data, error } = await supabase
      .from('profiles')
      .insert([
        {
          user_id: userId,
          username,
          display_name: displayName,
          email,
          avatar: metadata.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Profile creation error:', error);
      throw error;
    }

    return data;
  },
};
