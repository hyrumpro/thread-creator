'use client';

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Search, Bell, User, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "@/hooks/useAuth";

const navItems = [
  { icon: Home, label: "Home", path: "/", protected: false },
  { icon: Search, label: "Explore", path: "/explore", protected: false },
  { icon: Bell, label: "Notifications", path: "/notifications", protected: true },
  { icon: User, label: "Profile", path: "/profile", protected: true },
  { icon: MoreHorizontal, label: "More", path: "/settings", protected: true },
];

export function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: authUser } = useSession();

  const handleClick = (e: React.MouseEvent, item: typeof navItems[number]) => {
    if (item.protected && !authUser) {
      e.preventDefault();
      router.push(`/login?redirect=${item.path}`);
    }
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border safe-area-pb">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;

          return (
            <Link
              key={item.path}
              href={item.path}
              onClick={(e) => handleClick(e, item)}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full transition-colors",
                isActive ? "text-foreground" : "text-muted-foreground"
              )}
            >
              <Icon className={cn("w-6 h-6", isActive && "stroke-[2.5]")} />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
