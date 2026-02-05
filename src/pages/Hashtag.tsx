import { MainLayout } from "@/components/layout/MainLayout";
import { TweetFeed } from "@/components/tweet/TweetFeed";
import { useTweets } from "@/context/TweetContext";
import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router-dom";

const Hashtag = () => {
  const { tag } = useParams();
  const { tweets } = useTweets();

  const hashtagTweets = tweets.filter((tweet) =>
    tweet.hashtags?.some((hashtag) => hashtag.toLowerCase() === tag?.toLowerCase())
  );

  return (
    <MainLayout>
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center gap-6 p-4">
          <Link to="/" className="p-2 -m-2 rounded-full hover:bg-secondary">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold">#{tag}</h1>
            <p className="text-sm text-muted-foreground">{hashtagTweets.length} posts</p>
          </div>
        </div>
      </header>

      {/* Tweets with hashtag */}
      <TweetFeed
        tweets={hashtagTweets}
        emptyMessage={`No posts found with #${tag}`}
      />
    </MainLayout>
  );
};

export default Hashtag;
