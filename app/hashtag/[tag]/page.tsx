'use client';

import { MainLayout } from "@/components/layout/MainLayout";
import { TweetFeed } from "@/components/tweet/TweetFeed";
import { useHashtagTweets } from "@/hooks/useHashtagTweets";
import { ArrowLeft, Hash } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo } from "react";

export default function Hashtag() {
  const params = useParams();
  const tag = params.tag as string;
  const hashtagQuery = useHashtagTweets(tag);

  const tweets = useMemo(
    () => hashtagQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [hashtagQuery.data]
  );

  const totalCount = tweets.length;

  return (
    <MainLayout>
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center gap-6 p-4">
          <Link href="/" className="p-2 -m-2 rounded-full hover:bg-secondary">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <Hash className="w-5 h-5 text-primary" />
              <h1 className="text-xl font-bold">{tag}</h1>
            </div>
            <p className="text-sm text-muted-foreground">{totalCount} posts</p>
          </div>
        </div>
      </header>

      <TweetFeed
        tweets={tweets}
        emptyMessage={`No posts found with #${tag}`}
        isInitialLoading={hashtagQuery.isLoading}
        isFetchingMore={hashtagQuery.isFetchingNextPage}
        onLoadMore={hashtagQuery.hasNextPage ? hashtagQuery.fetchNextPage : undefined}
        hasMore={hashtagQuery.hasNextPage}
      />
    </MainLayout>
  );
}
