'use client';

import { useState } from 'react';
import { ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/MainLayout';

const faqSections = [
  {
    category: 'Getting Started',
    items: [
      {
        q: 'How do I create an account?',
        a: "Click \"Sign up\" on the login page and enter your email. You'll receive a magic link to activate your account. You can also sign in with Google.",
      },
      {
        q: 'How do I post my first tweet?',
        a: 'Click the "Post" button in the sidebar or use the compose box at the top of your feed. Free users can post up to 280 characters.',
      },
      {
        q: 'How do I follow other users?',
        a: "Visit any user's profile by clicking their name or avatar, then click \"Follow\". Their posts will appear in your Following feed.",
      },
    ],
  },
  {
    category: 'Pro Subscription',
    items: [
      {
        q: 'What do I get with Pro?',
        a: 'Pro includes: blue verification checkmark, tweet editing, posts up to 10,000 characters, 100 tweets/hour (vs 20 free), and priority in the timeline algorithm.',
      },
      {
        q: 'How do I upgrade to Pro?',
        a: 'Go to Settings → Subscription, or click More → Settings. Pro is $8/month and can be cancelled anytime from the billing portal.',
      },
      {
        q: 'How do I cancel my subscription?',
        a: "Go to Settings → Subscription → Manage subscription. You'll be taken to the Stripe billing portal. You keep Pro access until the end of your billing period.",
      },
      {
        q: 'My payment failed — what happens?',
        a: "We retry a few times automatically. After the final retry fails, your account reverts to the free plan. You can re-subscribe anytime.",
      },
    ],
  },
  {
    category: 'Account & Security',
    items: [
      {
        q: 'How do I reset my password?',
        a: 'Go to Settings → Security → Password and click "Send reset link". We\'ll email you a link to set a new password.',
      },
      {
        q: 'How do I update my profile?',
        a: 'Go to your Profile page and click "Edit profile". You can update your display name, bio, avatar, and cover image.',
      },
      {
        q: 'How do I change the app theme?',
        a: 'Go to Settings → Display. You can switch between Dark, Dim, and Light themes. Dim is a softer dark mode; Light is a full light theme.',
      },
    ],
  },
  {
    category: 'Posts & Interactions',
    items: [
      {
        q: 'Can I edit my tweets?',
        a: 'Editing is a Pro feature. Free users must delete and repost. Pro users can edit via the "..." menu on their own tweet.',
      },
      {
        q: 'How do bookmarks work?',
        a: 'Click the bookmark icon on any tweet to save it. Find all saved tweets in More → Bookmarks. Bookmarks are private.',
      },
      {
        q: 'What is the posting rate limit?',
        a: 'Free users: 20 tweets per hour. Pro users: 100 tweets per hour.',
      },
      {
        q: 'How do I view replies to a tweet?',
        a: 'Click on any tweet to open the full thread view, which shows the tweet and all its replies.',
      },
    ],
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left py-4 flex items-start justify-between gap-4 hover:text-primary transition-colors"
      >
        <span className="font-medium leading-snug">{q}</span>
        {open
          ? <ChevronUp className="w-4 h-4 flex-shrink-0 mt-0.5" />
          : <ChevronDown className="w-4 h-4 flex-shrink-0 mt-0.5" />}
      </button>
      {open && (
        <p className="pb-4 text-muted-foreground text-sm leading-relaxed">{a}</p>
      )}
    </div>
  );
}

export default function HelpCenter() {
  return (
    <MainLayout>
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center gap-4 p-4">
          <Link href="/" className="p-2 -m-2 rounded-full hover:bg-secondary">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-bold">Help Center</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-8">
        <p className="text-muted-foreground text-sm text-center">
          Find answers to common questions below.
        </p>

        {faqSections.map((section) => (
          <div key={section.category}>
            <h2 className="text-base font-bold mb-3 text-primary">{section.category}</h2>
            <div className="rounded-xl border border-border bg-card px-4">
              {section.items.map((item) => (
                <FAQItem key={item.q} q={item.q} a={item.a} />
              ))}
            </div>
          </div>
        ))}

        <div className="bg-secondary/50 rounded-xl p-6 text-center space-y-2">
          <p className="font-medium">Still need help?</p>
          <p className="text-sm text-muted-foreground">
            Go to Settings → Security or use the forgot password link on the login page for account issues.
          </p>
        </div>
      </div>
    </MainLayout>
  );
}
