# Thread Creator

A modern Twitter/X clone built with Next.js 15, Supabase, and shadcn/ui.

## Features

- Multi-method authentication (Email, Google OAuth, Magic Link)
- Tweet creation, editing, and deletion
- Like, retweet, and bookmark functionality
- User profiles with follow/unfollow
- Hashtag support
- Algorithmic timeline ("For You") and chronological feed ("Following")
- Pro subscription with Stripe
- Rate limiting (database-enforced)
- Row Level Security (RLS)
- Dark mode
- Fully responsive design

## Tech Stack

- **Next.js 15** - React framework with App Router
- **Supabase** - PostgreSQL database, authentication, RLS
- **Stripe** - Subscription payments
- **Cloudinary** - Image uploads
- **shadcn/ui** - UI components
- **Tailwind CSS** - Styling
- **React Query** - Data fetching
- **TypeScript** - Type safety

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase account
- Stripe account (for payments)
- Cloudinary account (for images)

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

### Database Setup

1. Create a Supabase project
2. Go to SQL Editor
3. Run `database/schema.sql`
4. Run `database/indexes.sql`

### Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx
STRIPE_SECRET_KEY=sk_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PRO_PRICE_ID=price_xxx
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Project Structure

```
app/                 # Next.js App Router pages
components/          # React components
  ui/               # shadcn/ui components
  layout/           # Layout components
  tweet/            # Tweet-related components
  profile/          # Profile components
hooks/               # Custom React hooks
lib/                 # Utilities and services
  auth.ts           # Authentication service
  tweet-service.ts  # Tweet operations
  profile-service.ts# Profile operations
  stripe.ts         # Stripe integration
  cloudinary.ts     # Image uploads
database/            # SQL schema files
integrations/        # Third-party integrations
  supabase/         # Supabase client
types/               # TypeScript types
```

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import in Vercel
3. Add environment variables
4. Deploy

### Stripe Webhook

Set up a webhook in Stripe Dashboard pointing to:
```
https://your-domain.com/api/stripe/webhook
```

## Scripts

```bash
npm run dev      # Development server
npm run build    # Production build
npm start        # Start production server
npm run lint     # Run ESLint
```

## License

MIT
