import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

// The entire app is auth-driven and user-specific — no page should be statically prerendered.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Thread Creator - Twitter Clone',
  description: 'A modern Twitter/X clone built with Next.js 15',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
