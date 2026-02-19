# Complete API & Services Documentation

## 🎯 Overview

This document covers all the backend services, CRUD operations, authentication, subscriptions, and the Twitter-style algorithm implementation.

---

## 📋 Table of Contents

1. [Authentication Service](#authentication-service)
2. [Profile Service](#profile-service)
3. [Tweet Service](#tweet-service)
4. [Pro Subscription](#pro-subscription)
5. [Rate Limiting](#rate-limiting)
6. [Timeline Algorithm](#timeline-algorithm)
7. [Database Schema](#database-schema)
8. [RLS Policies](#rls-policies)

---

## 🔐 Authentication Service

### Location
`lib/auth.ts`

### Features
- ✅ Email/Password sign up and login
- ✅ Google OAuth integration
- ✅ Magic Link (passwordless) login
- ✅ Automatic profile creation on signup
- ✅ Session management

### Usage Examples

```typescript
import { authService } from '@/lib/auth';

// Sign up
await authService.signUp({
  email: 'user@example.com',
  password: 'SecurePass123',
  username: 'johndoe',
  displayName: 'John Doe'
});

// Sign in
await authService.signIn({
  email: 'user@example.com',
  password: 'SecurePass123'
});

// Magic Link
await authService.signInWithMagicLink('user@example.com');

// Google OAuth
await authService.signInWithGoogle();

// Sign out
await authService.signOut();
```

---

## 👤 Profile Service

### Location
`lib/profile-service.ts`

### Features
- ✅ Get current user profile
- ✅ Get profile by username
- ✅ Update profile (bio, avatar, cover, location, website)
- ✅ Follow/unfollow users
- ✅ Get followers and following lists
- ✅ Upgrade to Pro subscription

### Usage Examples

```typescript
import { profileService } from '@/lib/profile-service';

// Get current profile
const profile = await profileService.getCurrentProfile();

// Get profile by username
const userProfile = await profileService.getProfileByUsername('johndoe');

// Update profile
await profileService.updateProfile({
  display_name: 'John Doe Updated',
  bio: 'Software developer passionate about React and TypeScript',
  location: 'San Francisco, CA',
  website: 'https://johndoe.com'
});

// Follow a user
await profileService.followUser('user-uuid-here');

// Unfollow a user
await profileService.unfollowUser('user-uuid-here');

// Check if following
const isFollowing = await profileService.isFollowing('user-uuid-here');

// Get followers
const followers = await profileService.getFollowers('user-uuid-here');

// Get following
const following = await profileService.getFollowing('user-uuid-here');

// Upgrade to Pro
await profileService.upgradeToPro();

// Check Pro status
const isPro = await profileService.checkProStatus();
```

---

## 🐦 Tweet Service

### Location
`lib/tweet-service.ts`

### Features
- ✅ Create tweets (with character limit based on subscription)
- ✅ Update tweets (Pro users only)
- ✅ Delete tweets
- ✅ Like/unlike tweets
- ✅ Retweet/unretweet
- ✅ Bookmark/unbookmark (private)
- ✅ Get timeline with algorithm
- ✅ Get following feed
- ✅ Get user tweets
- ✅ Get tweet replies
- ✅ Search by hashtag
- ✅ View count increment

### Usage Examples

```typescript
import { tweetService } from '@/lib/tweet-service';

// Create a tweet
const tweet = await tweetService.createTweet({
  content: 'Hello world! #firsttweet',
  images: ['https://example.com/image.jpg']
});

// Create a reply
const reply = await tweetService.createTweet({
  content: 'Great post!',
  parent_tweet_id: 'parent-tweet-uuid'
});

// Update a tweet (Pro only)
await tweetService.updateTweet('tweet-uuid', 'Updated content');

// Delete a tweet
await tweetService.deleteTweet('tweet-uuid');

// Like a tweet
await tweetService.likeTweet('tweet-uuid');

// Unlike a tweet
await tweetService.unlikeTweet('tweet-uuid');

// Retweet
await tweetService.retweetTweet('tweet-uuid');

// Unretweet
await tweetService.unretweetTweet('tweet-uuid');

// Bookmark (private)
await tweetService.bookmarkTweet('tweet-uuid');

// Remove bookmark
await tweetService.unbookmarkTweet('tweet-uuid');

// Get bookmarks
const bookmarks = await tweetService.getBookmarks();

// Get timeline (with algorithm)
const timeline = await tweetService.getTimeline(50, 48); // 50 tweets, last 48 hours

// Get following feed (chronological)
const followingFeed = await tweetService.getFollowingFeed(50);

// Get user's tweets
const userTweets = await tweetService.getUserTweets('user-uuid', 50);

// Get tweet by ID
const tweet = await tweetService.getTweetById('tweet-uuid');

// Get replies to a tweet
const replies = await tweetService.getTweetReplies('tweet-uuid');

// Search by hashtag
const hashtagTweets = await tweetService.searchByHashtag('react', 50);

// Check user interactions with tweet
const interactions = await tweetService.getUserInteractions('tweet-uuid');
// Returns: { isLiked: boolean, isRetweeted: boolean, isBookmarked: boolean }

// Increment view count
await tweetService.incrementViews('tweet-uuid');
```

---

## 💎 Pro Subscription

### Benefits

| Feature | Free | Pro |
|---------|------|-----|
| **Tweet Length** | 280 characters | 10,000 characters |
| **Edit Tweets** | ❌ No | ✅ Yes |
| **Blue Checkmark** | ❌ No | ✅ Yes |
| **Rate Limit** | 20 tweets/hour | 100 tweets/hour |
| **Verified Badge** | ❌ No | ✅ Auto-assigned |

### Implementation

#### Database
Pro status is stored in `profiles.is_pro` column (boolean).

#### Auto-verification
When `is_pro` is set to `true`, the `is_verified` column is automatically set to `true` via database trigger.

#### Upgrade Process

```typescript
// Upgrade to Pro
await profileService.upgradeToPro();

// Check if user has Pro
const profile = await profileService.getCurrentProfile();
if (profile.is_pro) {
  // User has Pro features
  // - Can post tweets up to 10,000 characters
  // - Can edit tweets
  // - Has blue checkmark (is_verified = true)
  // - Higher rate limit
}
```

#### UI Implementation

```tsx
// Show Pro badge
{profile.is_verified && (
  <svg viewBox="0 0 22 22" className="w-5 h-5 fill-primary">
    <path d="M20.396 11c-.018-.646-.215-1.275-.57-1.816..." />
  </svg>
)}

// Show Pro indicator in composer
{!profile.is_pro && content.length > 280 && (
  <p className="text-sm text-destructive">
    Upgrade to Pro to post longer tweets (10,000 characters)
  </p>
)}

// Show edit button (Pro only)
{profile.is_pro && isOwnTweet && (
  <Button onClick={() => editTweet(tweet.id)}>
    Edit Tweet
  </Button>
)}
```

---

## ⏱️ Rate Limiting

### Implementation

Rate limiting is enforced at the **database level** using PostgreSQL triggers.

### Limits

- **Free users**: 20 tweets per hour
- **Pro users**: 100 tweets per hour

### How It Works

```sql
-- Trigger checks tweet count in the last hour
-- If limit exceeded, raises exception
-- Frontend receives error and shows toast message
```

### Database Function

Located in `database/functions.sql`:

```sql
CREATE OR REPLACE FUNCTION check_tweet_rate_limit()
RETURNS TRIGGER AS $$
DECLARE
  tweet_count INT;
  is_pro BOOLEAN;
BEGIN
  SELECT profiles.is_pro INTO is_pro
  FROM profiles
  WHERE user_id = NEW.user_id;

  SELECT COUNT(*) INTO tweet_count
  FROM tweets
  WHERE user_id = NEW.user_id
  AND created_at > NOW() - INTERVAL '1 hour';

  IF is_pro THEN
    IF tweet_count >= 100 THEN
      RAISE EXCEPTION 'Rate limit exceeded. Pro users can post 100 tweets per hour.';
    END IF;
  ELSE
    IF tweet_count >= 20 THEN
      RAISE EXCEPTION 'Rate limit exceeded. You can post 20 tweets per hour. Upgrade to Pro for more!';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### Frontend Handling

```typescript
try {
  await tweetService.createTweet({ content });
} catch (error: any) {
  if (error.message.includes('Rate limit exceeded')) {
    toast({
      title: "Rate limit exceeded",
      description: "You've reached your hourly tweet limit. Try again later or upgrade to Pro!",
      variant: "destructive",
    });
  }
}
```

---

## 🧠 Timeline Algorithm

### Twitter-Style Scoring

The algorithm scores tweets based on:

```typescript
score =
  (likes * 1.5) +
  (retweets * 2) +
  (replies * 1) +
  (authorIsFollowed ? 5 : 0) -
  (ageInHours * 0.5)
```

### Why This Works

- ✅ **Engagement matters**: Likes, retweets, comments boost score
- ✅ **Following matters**: +5 bonus for followed accounts
- ✅ **Recency matters**: Newer tweets win, old ones decay
- ✅ **Deterministic**: No black box, easy to understand
- ✅ **Fast**: O(n log n) sorting
- ✅ **Tunable**: Easy to adjust weights

### Implementation

#### TypeScript (Client-side)

```typescript
// Get scored timeline
const timeline = await tweetService.getTimeline(50, 48);
// Returns top 50 tweets from last 48 hours, sorted by score
```

#### SQL (Server-side)

```sql
-- Call from SQL
SELECT * FROM get_scored_timeline(
  'user-uuid',  -- Current user ID
  50,           -- Limit
  48            -- Hours ago
);
```

### Algorithm Breakdown

1. **Fetch recent tweets** (last 48 hours by default)
2. **Calculate engagement score**:
   ```
   likes_count * 1.5 +
   retweets_count * 2 +
   comments_count * 1
   ```
3. **Add follow boost**: +5 if user follows the author
4. **Apply time decay**: -0.5 per hour of age
5. **Sort by score** (DESC)
6. **Return top N tweets**

### Feed Types

#### 1. For You (Algorithmic)
```typescript
const forYouFeed = await tweetService.getTimeline(50, 48);
```
- Scored by algorithm
- Includes tweets from everyone
- Prioritizes followed accounts
- Best engagement wins

#### 2. Following (Chronological)
```typescript
const followingFeed = await tweetService.getFollowingFeed(50);
```
- Only tweets from followed accounts
- Pure chronological order
- No scoring

### Tuning the Algorithm

Want different behavior? Adjust the weights in `lib/tweet-service.ts`:

```typescript
const engagementScore =
  stats.likes_count * 1.5 +      // Like weight
  stats.retweets_count * 2 +     // Retweet weight
  stats.comments_count * 1;      // Reply weight

const followBoost = followingIds.includes(tweet.user_id) ? 5 : 0;  // Follow boost
const timeDecay = ageInHours * 0.5;  // Time decay rate
```

**Examples**:
- Increase retweet weight to value shares more
- Increase time decay to favor newer content
- Increase follow boost to prioritize followed accounts

---

## 🗄️ Database Schema

### Tables

1. **profiles** - User profiles
2. **tweets** - All tweets and replies
3. **tweet_stats** - Denormalized statistics
4. **tweet_interactions** - Likes, retweets, bookmarks
5. **follows** - Follow relationships
6. **hashtags** - Hashtag index
7. **tweet_hashtags** - Many-to-many relation
8. **notifications** - User notifications
9. **messages** - Direct messages
10. **user_roles** - Admin/moderator roles

### Key Fields

#### profiles
```sql
- user_id (UUID, PK)
- username (TEXT, UNIQUE)
- display_name (TEXT)
- bio (TEXT)
- avatar (TEXT)
- cover_image (TEXT)
- location (TEXT)
- website (TEXT)
- is_verified (BOOLEAN)
- is_pro (BOOLEAN)
- followers_count (INT)
- following_count (INT)
- tweets_count (INT)
```

#### tweets
```sql
- id (UUID, PK)
- user_id (UUID, FK)
- content (TEXT, max 280 or 10000)
- images (TEXT[])
- parent_tweet_id (UUID, FK) -- For replies
- quoted_tweet_id (UUID, FK) -- For quote tweets
- is_edited (BOOLEAN)
- edited_at (TIMESTAMP)
- created_at (TIMESTAMP)
```

#### tweet_stats
```sql
- tweet_id (UUID, PK, FK)
- likes_count (INT)
- retweets_count (INT)
- quotes_count (INT)
- comments_count (INT)
- views_count (INT)
- bookmarks_count (INT)
```

---

## 🔒 Row Level Security (RLS) Policies

All tables have RLS enabled. Key policies:

### Profiles
- **SELECT**: Everyone can view
- **UPDATE**: Users can update their own profile
- **INSERT**: Users can create their own profile

### Tweets
- **SELECT**: Everyone can view
- **INSERT**: Authenticated users can create
- **UPDATE**: Users can update their own tweets (Pro only, enforced by trigger)
- **DELETE**: Users can delete their own tweets

### Tweet Interactions
- **SELECT**: Everyone can view
- **INSERT**: Authenticated users can create
- **DELETE**: Users can delete their own interactions

### Follows
- **SELECT**: Everyone can view
- **INSERT**: Users can follow others
- **DELETE**: Users can unfollow

### Bookmarks
Bookmarks are stored in `tweet_interactions` with `interaction_type = 'bookmark'`.

- Only the user who bookmarked can see their bookmarks
- Bookmarks are **private** (not visible to others)

---

## 🚀 Quick Start Guide

### 1. Set Up Database

```bash
# In Supabase SQL Editor, run these files in order:
1. database/schema.sql      # Creates tables, triggers, RLS
2. database/functions.sql   # Creates functions, rate limiting
```

### 2. Use Services in Components

```typescript
'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import { tweetService } from '@/lib/tweet-service';
import { profileService } from '@/lib/profile-service';

export default function TimelinePage() {
  // Get timeline
  const { data: timeline, isLoading } = useQuery({
    queryKey: ['timeline'],
    queryFn: () => tweetService.getTimeline(50, 48),
  });

  // Create tweet mutation
  const createTweetMutation = useMutation({
    mutationFn: tweetService.createTweet,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeline'] });
    },
  });

  // Like tweet mutation
  const likeMutation = useMutation({
    mutationFn: tweetService.likeTweet,
  });

  return (
    <div>
      {timeline?.map(tweet => (
        <TweetCard
          key={tweet.id}
          tweet={tweet}
          onLike={() => likeMutation.mutate(tweet.id)}
        />
      ))}
    </div>
  );
}
```

---

## 📊 Performance Optimization

### Indexes
All critical queries have indexes:
- `idx_tweets_created_at_no_parent` - For timeline queries
- `idx_tweet_interactions_user_tweet` - For interaction lookups
- `idx_follows_follower_id` - For follow queries
- `idx_follows_following_id` - For follower queries

### Caching Strategy

```typescript
// Use React Query for caching
const { data: timeline } = useQuery({
  queryKey: ['timeline'],
  queryFn: () => tweetService.getTimeline(),
  staleTime: 60 * 1000, // 1 minute
  cacheTime: 5 * 60 * 1000, // 5 minutes
});
```

### Rate Limiting
- Database-level enforcement
- No additional backend code needed
- Automatic error messages

---

## 🎯 Next Steps

1. **Test authentication** - Sign up, login, OAuth
2. **Create tweets** - Test character limits for free vs Pro
3. **Test interactions** - Like, retweet, bookmark
4. **Test algorithm** - Create sample data and verify scoring
5. **Test rate limits** - Try posting 21+ tweets in an hour
6. **Test Pro features** - Upgrade and test edit capability
7. **Test RLS** - Verify users can only edit their own data

---

## 🐛 Troubleshooting

### Common Issues

**Issue**: "Rate limit exceeded" error
- **Solution**: Wait an hour or upgrade to Pro

**Issue**: "Tweet editing is a Pro feature"
- **Solution**: Only Pro users can edit tweets

**Issue**: "Username already taken"
- **Solution**: Choose a different username during signup

**Issue**: Tweets not showing in timeline
- **Solution**: Check that tweets are less than 48 hours old (adjustable)

---

## 📚 Resources

- TypeScript services: `lib/tweet-service.ts`, `lib/profile-service.ts`, `lib/auth.ts`
- Database schema: `database/schema.sql`
- Database functions: `database/functions.sql`
- Setup guide: `SETUP_GUIDE.md`

---

**You now have a complete, production-ready Twitter clone with:**
- ✅ Authentication (3 methods)
- ✅ Profile management
- ✅ Tweet CRUD
- ✅ Like/Retweet/Bookmark
- ✅ Pro subscriptions with benefits
- ✅ Rate limiting
- ✅ Twitter-style algorithm
- ✅ RLS security
- ✅ Database triggers and automation

Ready to ship! 🚀
