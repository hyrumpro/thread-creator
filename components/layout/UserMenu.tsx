'use client';

import { useCallback, useState } from "react";
import Link from "next/link";
import { Settings, Sparkles, LogOut, Moon, HelpCircle, ExternalLink } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTweets } from "@/context/TweetContext";
import { useAuth } from "@/hooks/useAuth";
import { ProUpgradeModal } from "./ProUpgradeModal";

interface UserMenuProps {
  children: React.ReactNode;
}

export function UserMenu({ children }: UserMenuProps) {
  const { currentUser } = useTweets();
  const { signOut } = useAuth();
  const [showProModal, setShowProModal] = useState(false);
  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  }, [signOut]);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          {children}
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          side="top" 
          className="w-64 bg-background border border-border shadow-xl z-50"
          sideOffset={8}
        >
          <div className="px-3 py-2 border-b border-border">
            <p className="font-bold text-sm">{currentUser.displayName}</p>
            <p className="text-muted-foreground text-sm">@{currentUser.username}</p>
          </div>

          <DropdownMenuItem asChild className="gap-3 px-3 py-2.5 cursor-pointer">
            <Link href="/settings">
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </Link>
          </DropdownMenuItem>

          {!currentUser.isPro && (
            <DropdownMenuItem 
              onClick={() => setShowProModal(true)}
              className="gap-3 px-3 py-2.5 cursor-pointer text-primary"
            >
              <Sparkles className="w-5 h-5" />
              <span className="font-semibold">Upgrade to Pro</span>
            </DropdownMenuItem>
          )}

          {currentUser.isPro && (
            <DropdownMenuItem asChild className="gap-3 px-3 py-2.5 cursor-pointer text-primary">
              <Link href="/settings">
                <Sparkles className="w-5 h-5 fill-primary" />
                <span className="font-semibold">Pro Member</span>
              </Link>
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          <DropdownMenuItem className="gap-3 px-3 py-2.5 cursor-pointer">
            <Moon className="w-5 h-5" />
            <span>Display</span>
          </DropdownMenuItem>

          <DropdownMenuItem className="gap-3 px-3 py-2.5 cursor-pointer">
            <HelpCircle className="w-5 h-5" />
            <span>Help Center</span>
          </DropdownMenuItem>

          <DropdownMenuItem className="gap-3 px-3 py-2.5 cursor-pointer">
            <ExternalLink className="w-5 h-5" />
            <span>Keyboard shortcuts</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            className="gap-3 px-3 py-2.5 cursor-pointer text-destructive"
            onSelect={(event) => {
              event.preventDefault();
              handleSignOut();
            }}
          >
            <LogOut className="w-5 h-5" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ProUpgradeModal open={showProModal} onOpenChange={setShowProModal} />
    </>
  );
}
