import React, { createContext, useContext, useState, ReactNode } from "react";
import { Tweet, User } from "@/types/tweet";
import { initialTweets, currentUser } from "@/data/mockData";

interface TweetContextType {
  tweets: Tweet[];
  bookmarkedTweets: Tweet[];
  currentUser: User;
  addTweet: (content: string) => void;
  toggleLike: (tweetId: string) => void;
  toggleRetweet: (tweetId: string) => void;
  toggleBookmark: (tweetId: string) => void;
  addComment: (tweetId: string, content: string) => void;
}

const TweetContext = createContext<TweetContextType | undefined>(undefined);

export function TweetProvider({ children }: { children: ReactNode }) {
  const [tweets, setTweets] = useState<Tweet[]>(initialTweets);

  const extractHashtags = (content: string): string[] => {
    const hashtagRegex = /#(\w+)/g;
    const matches = content.match(hashtagRegex);
    return matches ? matches.map((tag) => tag.slice(1)) : [];
  };

  const addTweet = (content: string) => {
    const newTweet: Tweet = {
      id: Date.now().toString(),
      content,
      author: currentUser,
      createdAt: new Date(),
      likes: 0,
      retweets: 0,
      comments: 0,
      views: 0,
      isLiked: false,
      isRetweeted: false,
      isBookmarked: false,
      hashtags: extractHashtags(content),
    };
    setTweets((prev) => [newTweet, ...prev]);
  };

  const toggleLike = (tweetId: string) => {
    setTweets((prev) =>
      prev.map((tweet) =>
        tweet.id === tweetId
          ? {
              ...tweet,
              isLiked: !tweet.isLiked,
              likes: tweet.isLiked ? tweet.likes - 1 : tweet.likes + 1,
            }
          : tweet
      )
    );
  };

  const toggleRetweet = (tweetId: string) => {
    setTweets((prev) =>
      prev.map((tweet) =>
        tweet.id === tweetId
          ? {
              ...tweet,
              isRetweeted: !tweet.isRetweeted,
              retweets: tweet.isRetweeted ? tweet.retweets - 1 : tweet.retweets + 1,
            }
          : tweet
      )
    );
  };

  const toggleBookmark = (tweetId: string) => {
    setTweets((prev) =>
      prev.map((tweet) =>
        tweet.id === tweetId
          ? { ...tweet, isBookmarked: !tweet.isBookmarked }
          : tweet
      )
    );
  };

  const addComment = (tweetId: string, content: string) => {
    setTweets((prev) =>
      prev.map((tweet) =>
        tweet.id === tweetId
          ? { ...tweet, comments: tweet.comments + 1 }
          : tweet
      )
    );
  };

  const bookmarkedTweets = tweets.filter((tweet) => tweet.isBookmarked);

  return (
    <TweetContext.Provider
      value={{
        tweets,
        bookmarkedTweets,
        currentUser,
        addTweet,
        toggleLike,
        toggleRetweet,
        toggleBookmark,
        addComment,
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
