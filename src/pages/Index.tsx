import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { TweetComposer } from "@/components/tweet/TweetComposer";
import { TweetFeed } from "@/components/tweet/TweetFeed";
import { useTweets } from "@/context/TweetContext";

const Index = () => {
  const { tweets } = useTweets();
  const [activeTab, setActiveTab] = useState<"for-you" | "following">("for-you");

  return (
    <MainLayout>
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
        <h1 className="text-xl font-bold p-4">Home</h1>
        <div className="flex">
          <button
            onClick={() => setActiveTab("for-you")}
            className={`flex-1 py-4 text-center font-medium transition-colors relative hover:bg-secondary ${
              activeTab === "for-you" ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            For you
            {activeTab === "for-you" && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-primary rounded-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("following")}
            className={`flex-1 py-4 text-center font-medium transition-colors relative hover:bg-secondary ${
              activeTab === "following" ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            Following
            {activeTab === "following" && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-primary rounded-full" />
            )}
          </button>
        </div>
      </header>

      {/* Composer */}
      <TweetComposer />

      {/* Feed */}
      <TweetFeed tweets={tweets} />
    </MainLayout>
  );
};

export default Index;
