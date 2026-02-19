'use client';

import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useTrendingHashtags } from "@/hooks/useTrendingHashtags";
import { useSearch, SearchResult } from "@/hooks/useSearch";
import { Search, Hash, Loader2, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function Explore() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const { data: trendingHashtags = [], isLoading } = useTrendingHashtags(10);
  const { data: searchResults = [], isLoading: isSearching } = useSearch(searchQuery, showSearchResults);

  const formatTweetCount = (count: number): string => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setShowSearchResults(false);
  };

  return (
    <MainLayout>
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border p-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearchResults(true);
            }}
            onFocus={() => setShowSearchResults(true)}
            className="pl-12 pr-10 py-3 bg-secondary border-none rounded-full focus-visible:ring-1 focus-visible:ring-primary"
          />
          {searchQuery && (
            <button
              onClick={handleClearSearch}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>

        {showSearchResults && searchQuery.trim() && (
          <div className="absolute left-0 right-0 top-full mt-2 mx-4 bg-card rounded-2xl border border-border shadow-xl z-50 max-h-[400px] overflow-y-auto">
            {isSearching ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : searchResults.length > 0 ? (
              <div className="divide-y divide-border">
                {searchResults.map((result) => (
                  <SearchResultItem key={`${result.type}-${result.id}`} result={result} />
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-muted-foreground">
                No results found for "{searchQuery}"
              </div>
            )}
          </div>
        )}
      </header>

      <section>
        <h2 className="text-xl font-bold p-4">Trends for you</h2>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : trendingHashtags.length > 0 ? (
          trendingHashtags.map((topic) => (
            <Link
              key={topic.id}
              href={`/hashtag/${topic.tag}`}
              className="trending-item block"
            >
              <p className="text-xs text-muted-foreground">Trending</p>
              <p className="font-bold text-lg">#{topic.tag}</p>
              <p className="text-sm text-muted-foreground">{formatTweetCount(topic.tweetCount)} posts</p>
            </Link>
          ))
        ) : (
          <div className="p-4 text-center text-muted-foreground">
            No trending topics yet. Be the first to post!
          </div>
        )}
      </section>
    </MainLayout>
  );
}

function SearchResultItem({ result }: { result: SearchResult }) {
  if (result.type === 'hashtag') {
    return (
      <Link
        href={`/hashtag/${result.tag}`}
        className="flex items-center gap-3 p-4 hover:bg-secondary transition-colors"
      >
        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
          <Hash className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm">#{result.tag}</p>
          {result.tweetCount !== undefined && (
            <p className="text-muted-foreground text-xs">{result.tweetCount} posts</p>
          )}
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/profile/${result.username}`}
      className="flex items-center gap-3 p-4 hover:bg-secondary transition-colors"
    >
      <img
        src={result.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${result.username}`}
        alt={result.displayName || ''}
        className="w-10 h-10 rounded-full"
      />
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm truncate flex items-center gap-1">
          {result.displayName}
          {result.isVerified && (
            <svg viewBox="0 0 22 22" className="w-4 h-4 fill-primary">
              <path d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z" />
            </svg>
          )}
        </p>
        <p className="text-muted-foreground text-sm truncate">@{result.username}</p>
      </div>
    </Link>
  );
}
