# Thread Creator: A Twitter/X Clone Built with Next.js 15

![Next.js](https://img.shields.io/badge/-Next_JS-black?style=for-the-badge&logoColor=white&logo=nextdotjs&color=000000)
![TypeScript](https://img.shields.io/badge/-TypeScript-black?style=for-the-badge&logoColor=white&logo=typescript&color=3178C6)
![Tailwind CSS](https://img.shields.io/badge/-Tailwind_CSS-black?style=for-the-badge&logoColor=white&logo=tailwindcss&color=06B6D4)
![Supabase](https://img.shields.io/badge/-Supabase-black?style=for-the-badge&logoColor=white&logo=supabase&color=3ECF8E)
![Stripe](https://img.shields.io/badge/-Stripe-black?style=for-the-badge&logoColor=white&logo=stripe&color=635BFF)

## Demo

Check out the live demo here: [Thread Creator Demo](https://thread-creator-demo.vercel.app)

A full-featured social media platform inspired by Twitter/X, built with modern web technologies. Create threads, engage with content, and connect with other users in a seamless, responsive environment.

---

## Description

Thread Creator is a comprehensive social media platform that replicates the core functionalities of Twitter/X. This project demonstrates full-stack development skills with Next.js 15, Supabase, and modern UI/UX practices.

**Motivation:** Built to showcase modern web development practices, including authentication systems, real-time database operations, payment integration, and responsive design patterns. The project serves as a learning resource for developers interested in building scalable social media applications.

**Purpose:** Provides a fully functional social media platform where users can share thoughts in threads, interact with others through likes and retweets, follow interesting accounts, and customize their profiles. The application demonstrates enterprise-grade features like rate limiting, Row Level Security (RLS), and subscription-based premium features.

**Key Features:**

- Multi-method authentication (Email, Google OAuth, Magic Link)
- Tweet creation, editing, and deletion
- Like, retweet, bookmark, and comment functionality
- User profiles with follow/unfollow system
- Hashtag support and discovery
- Algorithmic "For You" timeline and chronological "Following" feed
- Pro subscription with Stripe integration
- Rate limiting enforced at database level
- Row Level Security (RLS) for data protection
- Dark mode support
- Fully responsive design for all devices
- Image uploads via Cloudinary

**What I Learned:** Developed advanced skills in Next.js 15 App Router, Supabase database design with RLS policies, Stripe payment integration, Cloudinary media management, and building accessible UI components with shadcn/ui. Gained experience with React Query for server state management and implementing security best practices in production applications.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Database Setup](#database-setup)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [Project Structure](#project-structure)
- [Scripts](#scripts)
- [License](#license)

---

## Features

Here are the key features of our Thread Creator platform:

### Authentication

- Secure user registration and login
- Google OAuth integration
- Magic Link passwordless authentication
- Session management with automatic token refresh

### Tweet Functionality

- Create, edit, and delete tweets
- Thread support for longer-form content
- Rich text with hashtag support
- Image uploads with Cloudinary
- Like and unlike tweets
- Retweet functionality
- Bookmark tweets for later

### Social Features

- User profiles with customizable display names and avatars
- Follow and unfollow other users
- "For You" algorithmic timeline
- "Following" chronological feed
- Hashtag discovery and trending topics
- Explore page for discovering new content

### Premium Features

- Stripe-powered Pro subscription
- Exclusive features for paid users
- Secure payment processing via webhooks

### Technical Features

- Database-enforced rate limiting
- Row Level Security (RLS) policies
- Dark mode with system preference detection
- Fully responsive design (Mobile, Tablet, Desktop)
- Optimistic updates for better UX

---

## Tech Stack

### Frontend

- **Next.js 15** - React framework with App Router
- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI component library (47+ components)
- **React Query** - Server state management
- **next-themes** - Dark mode support

### Backend & Database

- **Supabase** - PostgreSQL database
- **Supabase Auth** - Authentication
- **Row Level Security (RLS)** - Database-level security
- **Stripe** - Payment processing

### Tools & Libraries

- **Cloudinary** - Image uploads and optimization
- **Lucide React** - Icons
- **React Hook Form** - Form handling
- **Zod** - Schema validation
- **date-fns** - Date utilities

---

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Supabase account (free tier works)
- Stripe account (for payments)
- Cloudinary account (for image uploads)

### Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Add your credentials to .env.local

# Run development server
npm run dev
```

Visit `http://localhost:3000` to view the application.

---

## Database Setup

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Navigate to the SQL Editor in your Supabase dashboard
3. Run the contents of `database/schema.sql`
4. Run the contents of `database/indexes.sql`

This will create all necessary tables, indexes, triggers, and Row Level Security policies.

---

## Environment Variables

Create a `.env.local` file with the following variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Stripe
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PRO_PRICE_ID=price_xxx

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add all environment variables in the Vercel dashboard
4. Deploy

Your app will be live at `https://your-app.vercel.app`

### Stripe Webhook Setup

After deploying, configure your Stripe webhook:

```
https://your-domain.com/api/stripe/webhook
```

---

## Project Structure

```
thread-creator/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   │   ├── stripe/       # Stripe integration
│   │   └── upload/       # Image upload handler
│   ├── auth/             # Authentication pages
│   ├── profile/          # User profile pages
│   ├── notifications/    # Notifications page
│   ├── messages/         # Direct messages
│   ├── explore/          # Explore page
│   ├── bookmarks/       # Bookmarked tweets
│   ├── hashtag/          # Hashtag pages
│   └── settings/         # User settings
├── components/           # React components
│   ├── ui/              # shadcn/ui components
│   ├── layout/          # Layout components
│   └── tweet/           # Tweet-related components
├── context/              # React contexts
├── hooks/                # Custom React hooks
├── integrations/          # Third-party integrations
│   └── supabase/        # Supabase client
├── lib/                  # Utility functions
└── database/             # SQL schema files
```

---

## Scripts

```bash
npm run dev       # Start development server
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
npm run test     # Run tests
```

---

## License

MIT License - feel free to use this project for learning or commercial purposes.
