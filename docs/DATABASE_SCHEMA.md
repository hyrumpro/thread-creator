# Database Schema

## Tables Overview

### 1. profiles
Stores user profile information linked to authentication.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() | Unique identifier |
| user_id | uuid | FK → auth.users(id), UNIQUE, NOT NULL | Link to auth user |
| username | text | UNIQUE, NOT NULL | User's @handle |
| display_name | text | NOT NULL | User's display name |
| avatar | text | | Profile picture URL |
| bio | text | | User biography |
| cover_image | text | | Profile cover image URL |
| is_verified | boolean | DEFAULT false | Verification status |
| is_pro | boolean | DEFAULT false | Pro subscription status |
| followers_count | integer | DEFAULT 0 | Number of followers |
| following_count | integer | DEFAULT 0 | Number of following |
| created_at | timestamptz | DEFAULT now() | Account creation date |
| updated_at | timestamptz | DEFAULT now() | Last update date |

### 2. tweets
Stores all tweet content.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() | Unique identifier |
| user_id | uuid | FK → auth.users(id), NOT NULL | Tweet author |
| content | text | NOT NULL, CHECK (length <= 4000) | Tweet text content |
| images | text[] | | Array of image URLs |
| parent_tweet_id | uuid | FK → tweets(id) | For replies/quote tweets |
| is_edited | boolean | DEFAULT false | Edit status |
| created_at | timestamptz | DEFAULT now() | Creation timestamp |
| updated_at | timestamptz | DEFAULT now() | Last edit timestamp |

### 3. tweet_interactions
Stores likes, retweets, bookmarks per user.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() | Unique identifier |
| user_id | uuid | FK → auth.users(id), NOT NULL | User who interacted |
| tweet_id | uuid | FK → tweets(id), NOT NULL | Target tweet |
| interaction_type | text | NOT NULL | 'like', 'retweet', 'bookmark' |
| created_at | timestamptz | DEFAULT now() | Interaction timestamp |
| UNIQUE | | (user_id, tweet_id, interaction_type) | Prevent duplicates |

### 4. tweet_stats
Aggregated stats for performance (denormalized).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| tweet_id | uuid | PK, FK → tweets(id) | Tweet reference |
| likes_count | integer | DEFAULT 0 | Total likes |
| retweets_count | integer | DEFAULT 0 | Total retweets |
| comments_count | integer | DEFAULT 0 | Total comments |
| views_count | integer | DEFAULT 0 | Total views |

### 5. user_roles
Stores user roles for authorization (CRITICAL: separate from profiles).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() | Unique identifier |
| user_id | uuid | FK → auth.users(id), NOT NULL | User reference |
| role | app_role | NOT NULL | Role enum value |
| UNIQUE | | (user_id, role) | One role per user |

### 6. follows
User follow relationships.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() | Unique identifier |
| follower_id | uuid | FK → auth.users(id), NOT NULL | User who follows |
| following_id | uuid | FK → auth.users(id), NOT NULL | User being followed |
| created_at | timestamptz | DEFAULT now() | Follow timestamp |
| UNIQUE | | (follower_id, following_id) | Prevent duplicate follows |

## Enums

### app_role
```sql
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
```

## Indexes

- `profiles(username)` - Fast username lookups
- `tweets(user_id, created_at)` - User timeline queries
- `tweet_interactions(tweet_id, interaction_type)` - Fast interaction counts
- `follows(follower_id)` - Following list queries
- `follows(following_id)` - Followers list queries
