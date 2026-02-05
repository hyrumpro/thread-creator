import { MainLayout } from "@/components/layout/MainLayout";
import { trendingTopics } from "@/data/mockData";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";

const Explore = () => {
  return (
    <MainLayout>
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border p-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search"
            className="pl-12 py-3 bg-secondary border-none rounded-full focus-visible:ring-1 focus-visible:ring-primary"
          />
        </div>
      </header>

      {/* Trending */}
      <section>
        <h2 className="text-xl font-bold p-4">Trends for you</h2>
        {trendingTopics.map((topic) => (
          <Link
            key={topic.id}
            to={`/hashtag/${topic.topic.slice(1)}`}
            className="trending-item block"
          >
            <p className="text-xs text-muted-foreground">{topic.category} · Trending</p>
            <p className="font-bold text-lg">{topic.topic}</p>
            <p className="text-sm text-muted-foreground">{topic.tweetCount} posts</p>
          </Link>
        ))}
      </section>
    </MainLayout>
  );
};

export default Explore;
