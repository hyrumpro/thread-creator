export interface User {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  bio?: string;
  followers: number;
  following: number;
  isVerified?: boolean;
  isPro?: boolean;
  joinedDate: string;
  coverImage?: string;
}

export interface Tweet {
  id: string;
  content: string;
  author: User;
  createdAt: Date;
  likes: number;
  retweets: number;
  comments: number;
  views: number;
  isLiked: boolean;
  isRetweeted: boolean;
  isBookmarked: boolean;
  isEdited?: boolean;
  images?: string[];
  parentTweet?: Tweet;
  hashtags?: string[];
}

export interface TrendingTopic {
  id: string;
  category: string;
  topic: string;
  tweetCount: string;
}
