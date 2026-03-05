'use client';

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Search,
  Bell,
  User,
  Feather,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTweets } from "@/context/TweetContext";
import { cn } from "@/lib/utils";
import { ComposeModal } from "@/components/tweet/ComposeModal";
import { UserMenu } from "./UserMenu";
import { MoreMenu } from "./MoreMenu";
import { useRouter } from "next/navigation";
import { useSession } from "@/hooks/useAuth";

const navItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: Search, label: "Explore", path: "/explore" },
  { icon: Bell, label: "Notifications", path: "/notifications" },
  { icon: User, label: "Profile", path: "/profile" },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser } = useTweets();
  const { data: authUser } = useSession();
  const [showComposeModal, setShowComposeModal] = useState(false);

  const handlePost = () => {
    if (!authUser) {
      router.push('/login');
      return;
    }
    setShowComposeModal(true);
  };

  return (
    <>
      <aside className="hidden md:flex fixed left-0 top-0 h-screen md:w-20 lg:w-[275px] border-r border-border p-2 lg:p-4 flex-col">
        {/* Logo */}
        <Link href="/" className="p-3 hover:bg-secondary rounded-full w-fit mb-2 mx-auto lg:mx-0">
          <svg viewBox="0 0 24 24" className="w-7 h-7 fill-foreground">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </Link>

        {/* Navigation */}
        <nav className="flex-1 space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;

            return (
              <Link
                key={item.path}
                href={item.path}
                className={cn(
                  "flex items-center gap-4 px-3 lg:px-4 py-3 text-[17px] rounded-full transition-colors duration-200 hover:bg-secondary",
                  "justify-center lg:justify-start",
                  isActive && "font-bold"
                )}
              >
                <Icon className={cn("w-[26px] h-[26px] flex-shrink-0", isActive && "stroke-[2.5]")} />
                <span className="hidden lg:inline">{item.label}</span>
              </Link>
            );
          })}

          {/* More Menu */}
          <MoreMenu />

          {/* Post Button */}
          <Button
            onClick={handlePost}
            className="w-full mt-3 h-[52px] text-[17px] font-bold rounded-full bg-primary hover:bg-primary/90"
          >
            <Feather className="w-5 h-5 lg:hidden" />
            <span className="hidden lg:flex items-center gap-2">
              <Feather className="w-5 h-5" />
              Post
            </span>
          </Button>
        </nav>

        {/* User Profile with Menu */}
        <UserMenu>
          <button className="flex items-center gap-3 p-3 hover:bg-secondary rounded-full mt-auto w-full text-left justify-center lg:justify-start">
            <img
              src={currentUser.avatar}
              alt={currentUser.displayName}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="hidden lg:flex flex-1 min-w-0 flex-col">
              <p className="font-bold text-sm truncate flex items-center gap-1">
                {currentUser.displayName}
                {currentUser.isVerified && (
                  <svg viewBox="0 0 22 22" className="w-5 h-5 fill-primary text-primary flex-shrink-0">
                    <path d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z" />
                  </svg>
                )}
              </p>
              <p className="text-muted-foreground text-sm truncate">@{currentUser.username}</p>
            </div>
            <MoreHorizontal className="hidden lg:block w-5 h-5 text-muted-foreground" />
          </button>
        </UserMenu>
      </aside>

      <ComposeModal open={showComposeModal} onOpenChange={setShowComposeModal} />
    </>
  );
}
