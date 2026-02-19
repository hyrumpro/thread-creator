# Thread Creator - Next.js Migration & Setup Guide

## 🎉 Migration Complete!

Your Twitter/X clone has been successfully migrated from React + Vite to **Next.js 15** with the App Router.

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Getting Started](#getting-started)
5. [Database Setup](#database-setup)
6. [Authentication Setup](#authentication-setup)
7. [API Integration](#api-integration)
8. [Deployment](#deployment)
9. [Features](#features)

---

## 🎯 Project Overview

A full-featured Twitter/X clone built with Next.js 15, featuring:
- Real-time tweets and interactions
- Multi-method authentication (Email, Google OAuth, Magic Link)
- User profiles and follows
- Bookmarks and likes
- Hashtag support
- Direct messaging
- Notifications
- Dark mode
- Fully responsive design

---

## 💻 Tech Stack

### Frontend
- **Next.js 15.5.12** - React framework with App Router
- **React 18.3.1** - UI library
- **TypeScript 5.8.3** - Type safety
- **Tailwind CSS 3.4.17** - Styling
- **shadcn/ui** - UI component library (47+ components)
- **React Query** - Data fetching and caching
- **next-themes** - Dark mode support

### Backend & Database
- **Supabase** - PostgreSQL database
- **Supabase Auth** - Authentication
- **Row Level Security (RLS)** - Database security

### Tools & Libraries
- **Lucide React** - Icons
- **React Hook Form** - Form handling
- **Zod** - Schema validation
- **date-fns** - Date utilities

---

## 📁 Project Structure

```
thread-creator/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout with providers
│   ├── page.tsx                 # Home page
│   ├── providers.tsx            # Client-side providers
│   ├── globals.css              # Global styles
│   ├── auth/callback/page.tsx   # OAuth callback
│   ├── login/page.tsx
│   ├── register/page.tsx
│   ├── profile/[[...username]]/page.tsx
│   ├── bookmarks/page.tsx
│   ├── hashtag/[tag]/page.tsx
│   ├── explore/page.tsx
│   ├── settings/page.tsx
│   └── not-found.tsx
├── components/                   # Shared components
│   ├── layout/                  # Layout components
│   │   ├── MainLayout.tsx
│   │   ├── Sidebar.tsx
│   │   ├── RightSidebar.tsx
│   │   ├── MobileNav.tsx
│   │   ├── MoreMenu.tsx
│   │   └── UserMenu.tsx
│   ├── tweet/                   # Tweet components
│   │   ├── TweetCard.tsx
│   │   ├── TweetFeed.tsx
│   │   ├── TweetComposer.tsx
│   │   ├── ComposeModal.tsx
│   │   ├── CommentModal.tsx
│   │   └── EditTweetModal.tsx
│   ├── profile/                 # Profile components
│   │   └── EditProfileModal.tsx
│   └── ui/                      # shadcn/ui components (47+)
├── hooks/                        # Custom hooks
│   ├── useAuth.tsx              # Authentication hook
│   ├── use-mobile.tsx           # Mobile detection
│   └── use-toast.ts             # Toast notifications
├── context/                      # React contexts
│   └── TweetContext.tsx         # Tweet state management
├── integrations/                 # Third-party integrations
│   └── supabase/
│       ├── client.ts
│       └── types.ts
├── lib/                          # Utilities
│   ├── utils.ts                 # Utility functions
│   └── auth.ts                  # Auth service
├── types/                        # TypeScript types
│   └── tweet.ts
├── data/                         # Mock data
│   └── mockData.ts
├── database/                     # Database files
│   └── schema.sql               # PostgreSQL schema
├── .env.local                    # Environment variables
├── next.config.js               # Next.js config
├── tsconfig.json                # TypeScript config
├── tailwind.config.ts           # Tailwind config
├── postcss.config.js            # PostCSS config
└── package.json                 # Dependencies
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- Supabase account (free tier works)

### Installation

1. **Install dependencies**:
```bash
npm install
```

2. **Set up environment variables**:

Create `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

3. **Run development server**:
```bash
npm run dev
```

Visit `http://localhost:3000` (or the port shown in terminal)

4. **Build for production**:
```bash
npm run build
npm start
```

---

## 🗄️ Database Setup

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Wait for the database to initialize

### Step 2: Run the Schema

1. Navigate to your Supabase project dashboard
2. Go to **SQL Editor**
3. Open the `database/schema.sql` file from this project
4. Copy and paste the entire SQL content into the SQL Editor
5. Click **RUN** to execute the schema

This will create:
- All tables (profiles, tweets, follows, etc.)
- Indexes for performance
- Triggers for automated updates
- Row Level Security (RLS) policies

### Step 3: Enable Authentication Providers

1. Go to **Authentication > Providers** in Supabase dashboard
2. Enable **Email** auth (already enabled by default)
3. **Optional**: Enable **Google OAuth**:
   - Click on Google provider
   - Add your Google OAuth credentials
   - Set redirect URL: `https://your-project.supabase.co/auth/v1/callback`

### Database Tables Overview

| Table | Description |
|-------|-------------|
| `profiles` | User profiles and settings |
| `tweets` | All tweets and replies |
| `tweet_stats` | Denormalized tweet statistics |
| `tweet_interactions` | Likes, retweets, bookmarks |
| `follows` | User follow relationships |
| `hashtags` | Hashtag index |
| `tweet_hashtags` | Many-to-many tweet-hashtag relation |
| `notifications` | User notifications |
| `messages` | Direct messages |
| `user_roles` | Admin/moderator roles |

---

## 🔐 Authentication Setup

### Features Supported
- ✅ Email/Password authentication
- ✅ Magic Link (passwordless email login)
- ✅ Google OAuth
- ✅ Automatic profile creation on sign-up
- ✅ Session management
- ✅ Protected routes

### Auth Flow

1. **Sign Up** (`/register`):
   - User enters email, password, username, display name
   - Profile automatically created in `profiles` table
   - Email verification sent (optional)

2. **Sign In** (`/login`):
   - Email/password login
   - Magic link option (OTP sent to email)
   - Google OAuth button

3. **Session Management**:
   - Sessions persist across page reloads
   - Auto-refresh tokens
   - Secure logout

### Using Auth in Components

```typescript
import { useAuth } from '@/hooks/useAuth';

function MyComponent() {
  const { user, session, isLoading, signOut } = useAuth();

  if (isLoading) return <div>Loading...</div>;
  if (!user) return <div>Not logged in</div>;

  return (
    <div>
      <p>Welcome, {user.email}</p>
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
}
```

### Protected Routes

To protect a route, check authentication in the component:

```typescript
'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProtectedPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) return <div>Loading...</div>;
  if (!user) return null;

  return <div>Protected content</div>;
}
```

---

## 🔌 API Integration

### Creating API Routes

Create API routes in `app/api/` directory:

```typescript
// app/api/tweets/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/integrations/supabase/client';

export async function GET(request: NextRequest) {
  const { data, error } = await supabase
    .from('tweets')
    .select('*, profiles(*), tweet_stats(*)')
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ tweets: data });
}
```

### Using React Query for Data Fetching

```typescript
'use client';

import { useQuery } from '@tanstack/react-query';

function TweetsList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['tweets'],
    queryFn: async () => {
      const res = await fetch('/api/tweets');
      return res.json();
    },
  });

  if (isLoading) return <div>Loading tweets...</div>;
  if (error) return <div>Error loading tweets</div>;

  return (
    <div>
      {data.tweets.map(tweet => (
        <TweetCard key={tweet.id} tweet={tweet} />
      ))}
    </div>
  );
}
```

### Direct Supabase Queries

```typescript
import { supabase } from '@/integrations/supabase/client';

// Fetch tweets
async function getTweets() {
  const { data, error } = await supabase
    .from('tweets')
    .select(`
      *,
      profiles:user_id(*),
      tweet_stats(*)
    `)
    .order('created_at', { ascending: false });

  return data;
}

// Create a tweet
async function createTweet(content: string, userId: string) {
  const { data, error } = await supabase
    .from('tweets')
    .insert([{ user_id: userId, content }])
    .select()
    .single();

  return data;
}

// Like a tweet
async function likeTweet(tweetId: string, userId: string) {
  const { error } = await supabase
    .from('tweet_interactions')
    .insert([{
      user_id: userId,
      tweet_id: tweetId,
      interaction_type: 'like'
    }]);
}
```

---

## 🌍 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click **Import Project**
4. Select your repository
5. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
6. Click **Deploy**

Your app will be live at `https://your-app.vercel.app`

### Other Platforms
- **Netlify**: Similar to Vercel
- **AWS Amplify**: Enterprise option
- **Self-hosted**: Build and deploy with Docker

---

## ✨ Features

### Completed ✅
- [x] User authentication (Email, Google, Magic Link)
- [x] User profiles with edit functionality
- [x] Tweet creation and display
- [x] Like/Unlike tweets
- [x] Retweet functionality
- [x] Bookmark tweets
- [x] Comment on tweets
- [x] Hashtag support
- [x] User follow/unfollow
- [x] Dark mode
- [x] Responsive design (Mobile, Tablet, Desktop)
- [x] Image uploads for tweets
- [x] Settings page
- [x] Profile customization

### To Implement 🚧
- [ ] Real-time tweet updates (Supabase Realtime)
- [ ] Direct messaging
- [ ] Notifications system
- [ ] Search functionality
- [ ] Trending hashtags
- [ ] User mentions
- [ ] Quote tweets
- [ ] Tweet analytics
- [ ] Pro subscription features
- [ ] Media optimization
- [ ] Infinite scroll pagination
- [ ] Tweet threading

---

## 🎨 Customization

### Changing Colors

Edit `app/globals.css`:

```css
:root {
  --primary: 203 89% 53%;  /* Twitter blue */
  --background: 216 28% 7%; /* Dark background */
  /* ... more colors */
}
```

### Adding New Features

1. Create a new page in `app/your-feature/page.tsx`
2. Add navigation link in `components/layout/Sidebar.tsx`
3. Create components in `components/your-feature/`
4. Add API routes if needed in `app/api/your-feature/`

---

## 🐛 Troubleshooting

### Build Errors
- Run `npm install` to ensure all dependencies are installed
- Check `.env.local` has correct Supabase credentials
- Clear `.next` folder: `rm -rf .next`

### Authentication Issues
- Verify Supabase URL and keys in `.env.local`
- Check Supabase dashboard for authentication logs
- Ensure RLS policies are enabled

### Database Issues
- Re-run the schema.sql if tables are missing
- Check Supabase logs in dashboard
- Verify RLS policies allow your operations

---

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [React Query Documentation](https://tanstack.com/query/latest)

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

## 📝 License

MIT License - feel free to use this project for learning or commercial purposes.

---

## 🎉 You're All Set!

Your Twitter/X clone is ready for development. Start building amazing features!

**Next Steps**:
1. Run the database schema in Supabase
2. Start the dev server: `npm run dev`
3. Create your first account
4. Start tweeting!

Happy coding! 🚀
