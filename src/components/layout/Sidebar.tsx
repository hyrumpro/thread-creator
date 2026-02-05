import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Search,
  Bell,
  Mail,
  Bookmark,
  User,
  MoreHorizontal,
  Feather,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTweets } from "@/context/TweetContext";
import { cn } from "@/lib/utils";
import { ComposeModal } from "@/components/tweet/ComposeModal";

const navItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: Search, label: "Explore", path: "/explore" },
  { icon: Bell, label: "Notifications", path: "/notifications" },
  { icon: Mail, label: "Messages", path: "/messages" },
  { icon: Bookmark, label: "Bookmarks", path: "/bookmarks" },
  { icon: User, label: "Profile", path: "/profile" },
  { icon: MoreHorizontal, label: "More", path: "/more" },
];

export function Sidebar() {
  const location = useLocation();
  const { currentUser } = useTweets();
  const [showComposeModal, setShowComposeModal] = useState(false);

  return (
    <>
      <aside className="fixed left-0 top-0 h-screen w-[275px] border-r border-border p-4 flex flex-col">
        {/* Logo */}
        <Link to="/" className="p-3 hover:bg-secondary rounded-full w-fit mb-2">
          <svg viewBox="0 0 24 24" className="w-7 h-7 fill-foreground">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </Link>

        {/* Navigation */}
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "nav-link",
                  isActive && "font-bold"
                )}
              >
                <Icon className={cn("w-6 h-6", isActive && "stroke-[2.5]")} />
                <span>{item.label}</span>
              </Link>
            );
          })}

          {/* Post Button */}
          <Button 
            onClick={() => setShowComposeModal(true)}
            className="w-full mt-4 py-6 text-lg font-bold rounded-full bg-primary hover:bg-primary/90"
          >
            <Feather className="w-5 h-5 mr-2 lg:hidden" />
            <span>Post</span>
          </Button>
        </nav>

        {/* User Profile */}
        <Link
          to="/profile"
          className="flex items-center gap-3 p-3 hover:bg-secondary rounded-full mt-auto"
        >
          <img
            src={currentUser.avatar}
            alt={currentUser.displayName}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm truncate">{currentUser.displayName}</p>
            <p className="text-muted-foreground text-sm truncate">@{currentUser.username}</p>
          </div>
          <MoreHorizontal className="w-5 h-5 text-muted-foreground" />
        </Link>
      </aside>

      <ComposeModal open={showComposeModal} onOpenChange={setShowComposeModal} />
    </>
  );
}
