'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Mail, Bookmark, Settings, HelpCircle, MoreHorizontal } from "lucide-react";
import Link from "next/link";

export function MoreMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="nav-link w-full">
          <MoreHorizontal className="w-[26px] h-[26px] flex-shrink-0" />
          <span className="hidden lg:inline">More</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuItem asChild>
          <Link href="/messages" className="flex items-center gap-3 cursor-pointer">
            <Mail className="w-5 h-5" />
            <span>Messages</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/bookmarks" className="flex items-center gap-3 cursor-pointer">
            <Bookmark className="w-5 h-5" />
            <span>Bookmarks</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/settings" className="flex items-center gap-3 cursor-pointer">
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/help" className="flex items-center gap-3 cursor-pointer">
            <HelpCircle className="w-5 h-5" />
            <span>Help Center</span>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
