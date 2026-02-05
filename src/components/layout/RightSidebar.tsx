import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { trendingTopics, suggestedUsers } from "@/data/mockData";
import { Link } from "react-router-dom";

export function RightSidebar() {
  return (
    <aside className="fixed right-0 top-0 h-screen w-[350px] p-4 space-y-4 overflow-y-auto">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Search"
          className="pl-12 py-3 bg-secondary border-none rounded-full focus-visible:ring-1 focus-visible:ring-primary"
        />
      </div>

      {/* Trending */}
      <div className="bg-card rounded-2xl overflow-hidden">
        <h2 className="text-xl font-bold p-4">What's happening</h2>
        {trendingTopics.map((topic) => (
          <Link
            key={topic.id}
            to={`/hashtag/${topic.topic.slice(1)}`}
            className="trending-item block"
          >
            <p className="text-xs text-muted-foreground">{topic.category}</p>
            <p className="font-bold">{topic.topic}</p>
            <p className="text-xs text-muted-foreground">{topic.tweetCount} posts</p>
          </Link>
        ))}
        <Link to="/explore" className="block p-4 text-primary hover:bg-secondary">
          Show more
        </Link>
      </div>

      {/* Who to follow */}
      <div className="bg-card rounded-2xl overflow-hidden">
        <h2 className="text-xl font-bold p-4">Who to follow</h2>
        {suggestedUsers.map((user) => (
          <Link
            key={user.id}
            to={`/profile/${user.username}`}
            className="flex items-center gap-3 p-4 hover:bg-secondary transition-colors"
          >
            <img
              src={user.avatar}
              alt={user.displayName}
              className="w-10 h-10 rounded-full"
            />
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm truncate flex items-center gap-1">
                {user.displayName}
                {user.isVerified && (
                  <svg viewBox="0 0 22 22" className="w-4 h-4 fill-primary">
                    <path d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z" />
                  </svg>
                )}
              </p>
              <p className="text-muted-foreground text-sm truncate">@{user.username}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full font-bold hover:bg-foreground hover:text-background"
            >
              Follow
            </Button>
          </Link>
        ))}
        <Link to="/explore" className="block p-4 text-primary hover:bg-secondary">
          Show more
        </Link>
      </div>

      {/* Footer */}
      <div className="text-xs text-muted-foreground px-4 flex flex-wrap gap-x-3 gap-y-1">
        <a href="#" className="hover:underline">Terms of Service</a>
        <a href="#" className="hover:underline">Privacy Policy</a>
        <a href="#" className="hover:underline">Cookie Policy</a>
        <a href="#" className="hover:underline">Accessibility</a>
        <span>© 2024 X Clone</span>
      </div>
    </aside>
  );
}
