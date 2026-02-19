'use client';

import { MainLayout } from "@/components/layout/MainLayout";
import { TweetFeed } from "@/components/tweet/TweetFeed";
import { useTweets } from "@/context/TweetContext";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useBookmarks } from "@/hooks/useBookmarks";

export default function Bookmarks() {
  const { currentUser } = useTweets();
  const { data: tweets, isLoading } = useBookmarks();

  return (
    <MainLayout>
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center gap-6 p-4">
          <Link href="/" className="p-2 -m-2 rounded-full hover:bg-secondary">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold">Bookmarks</h1>
            <p className="text-sm text-muted-foreground">@{currentUser.username}</p>
          </div>
        </div>
      </header>

      <TweetFeed
        tweets={tweets ?? []}
        emptyMessage="Save posts for later. Bookmark posts to easily find them again in the future."
        isInitialLoading={isLoading}
      />
    </MainLayout>
  );
}
