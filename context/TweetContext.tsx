'use client';

import React, { createContext, useContext, useState, ReactNode, useMemo, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Tweet, User } from "@/types/tweet";
import { useCurrentProfile, profileKeys } from "@/hooks/useProfileQuery";
import { profileService, UpdateProfileData } from "@/lib/profile-service";
import { tweetService } from "@/lib/tweet-service";
import { useToast } from "@/hooks/use-toast";

interface TweetContextType {
  tweets: Tweet[];
  currentUser: User;
  addTweet: (content: string, images?: string[]) => Promise<void>;
  toggleLike: (tweetId: string, isLiked: boolean) => Promise<void>;
  toggleRetweet: (tweetId: string, isRetweeted: boolean) => Promise<void>;
  toggleBookmark: (tweetId: string, isBookmarked: boolean) => Promise<void>;
  addComment: (tweetId: string, content: string) => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  editTweet: (tweetId: string, newContent: string) => Promise<void>;
  deleteTweet: (tweetId: string) => Promise<void>;
}

const TweetContext = createContext<TweetContextType | undefined>(undefined);

const defaultUser: User = {
  id: 'guest',
  username: 'guest',
  displayName: 'Guest',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=guest',
  followers: 0,
  following: 0,
  isVerified: false,
  isPro: false,
  joinedDate: '—',
};

export function TweetProvider({ children }: { children: ReactNode }) {
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const { data: profile } = useCurrentProfile();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const currentUser = useMemo<User>(() => {
    if (!profile) return defaultUser;

    return {
      id: profile.user_id,
      username: profile.username,
      displayName: profile.display_name,
      avatar: profile.avatar || defaultUser.avatar,
      bio: profile.bio || undefined,
      followers: profile.followers_count,
      following: profile.following_count,
      isVerified: profile.is_verified,
      isPro: profile.is_pro,
      joinedDate: new Date(profile.created_at).toLocaleString("en-US", {
        month: "long",
        year: "numeric",
      }),
      coverImage: profile.cover_image || undefined,
    };
  }, [profile]);

  const addTweet = useCallback(async (content: string, images?: string[]) => {
    try {
      await tweetService.createTweet({ content, images });
      await queryClient.invalidateQueries({ queryKey: ['timeline'] });
      toast({ title: "Tweet posted!" });
    } catch (error: any) {
      const message = error?.message ?? 'Something went wrong';
      toast({
        title: "Failed to post tweet",
        description: message,
        variant: "destructive",
      });
      throw new Error(message);
    }
  }, [queryClient, toast]);

  const toggleLike = useCallback(async (tweetId: string, isLiked: boolean) => {
    try {
      if (isLiked) {
        await tweetService.unlikeTweet(tweetId);
      } else {
        await tweetService.likeTweet(tweetId);
      }
      await queryClient.invalidateQueries({ queryKey: ['timeline'] });
    } catch (error: any) {
      toast({
        title: "Action failed",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [queryClient, toast]);

  const toggleRetweet = useCallback(async (tweetId: string, isRetweeted: boolean) => {
    try {
      if (isRetweeted) {
        await tweetService.unretweetTweet(tweetId);
      } else {
        await tweetService.retweetTweet(tweetId);
      }
      await queryClient.invalidateQueries({ queryKey: ['timeline'] });
    } catch (error: any) {
      toast({
        title: "Action failed",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [queryClient, toast]);

  const toggleBookmark = useCallback(async (tweetId: string, isBookmarked: boolean) => {
    try {
      if (isBookmarked) {
        await tweetService.unbookmarkTweet(tweetId);
      } else {
        await tweetService.bookmarkTweet(tweetId);
      }
      await queryClient.invalidateQueries({ queryKey: ['timeline'] });
      await queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
    } catch (error: any) {
      toast({
        title: "Action failed",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [queryClient, toast]);

  const addComment = useCallback(async (tweetId: string, content: string) => {
    try {
      await tweetService.createTweet({ content, parent_tweet_id: tweetId });
      await queryClient.invalidateQueries({ queryKey: ['timeline'] });
      await queryClient.invalidateQueries({ queryKey: ['tweet', tweetId] });
      toast({ title: "Reply posted!" });
    } catch (error: any) {
      toast({
        title: "Failed to post reply",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [queryClient, toast]);

  const updateProfile = useCallback(async (updates: Partial<User>) => {
    if (!profile) return;

    const payload: UpdateProfileData = {};
    if (updates.displayName !== undefined) payload.display_name = updates.displayName;
    if (updates.bio !== undefined) payload.bio = updates.bio;
    if (updates.avatar !== undefined) payload.avatar = updates.avatar;
    if (updates.coverImage !== undefined) payload.cover_image = updates.coverImage;

    if (Object.keys(payload).length > 0) {
      try {
        await profileService.updateProfile(payload);
        await queryClient.invalidateQueries({ queryKey: profileKeys.current() });
        toast({ title: "Profile updated!" });
      } catch (error: any) {
        toast({
          title: "Failed to update profile",
          description: error.message,
          variant: "destructive",
        });
      }
    }
  }, [profile, queryClient, toast]);

  const editTweet = useCallback(async (tweetId: string, newContent: string) => {
    try {
      await tweetService.updateTweet(tweetId, newContent);
      await queryClient.invalidateQueries({ queryKey: ['timeline'] });
      await queryClient.invalidateQueries({ queryKey: ['tweet', tweetId] });
      toast({ title: "Tweet updated!" });
    } catch (error: any) {
      toast({
        title: "Failed to edit tweet",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [queryClient, toast]);

  const deleteTweet = useCallback(async (tweetId: string) => {
    try {
      await tweetService.deleteTweet(tweetId);
      await queryClient.invalidateQueries({ queryKey: ['timeline'] });
      await queryClient.invalidateQueries({ queryKey: ['tweet', tweetId] });
      toast({ title: "Tweet deleted" });
    } catch (error: any) {
      toast({
        title: "Failed to delete tweet",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [queryClient, toast]);

  return (
    <TweetContext.Provider
      value={{
        tweets,
        currentUser,
        addTweet,
        toggleLike,
        toggleRetweet,
        toggleBookmark,
        addComment,
        updateProfile,
        editTweet,
        deleteTweet,
      }}
    >
      {children}
    </TweetContext.Provider>
  );
}

export function useTweets() {
  const context = useContext(TweetContext);
  if (context === undefined) {
    throw new Error("useTweets must be used within a TweetProvider");
  }
  return context;
}
