'use client';

import { useState } from "react";
import Link from "next/link";
import { Heart, MessageCircle, Repeat2, Bookmark, Share, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Tweet } from "@/types/tweet";
import { useTweets } from "@/context/TweetContext";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { CommentModal } from "./CommentModal";
import { EditTweetModal } from "./EditTweetModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface TweetCardProps {
  tweet: Tweet;
}

export function TweetCard({ tweet }: TweetCardProps) {
  const { toggleLike, toggleRetweet, toggleBookmark, currentUser, deleteTweet } = useTweets();
  const [isAnimatingLike, setIsAnimatingLike] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const isOwnTweet = tweet.author.id === currentUser.id;
  const canEdit = isOwnTweet && currentUser.isPro;

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAnimatingLike(true);
    await toggleLike(tweet.id, tweet.isLiked);
    setTimeout(() => setIsAnimatingLike(false), 300);
  };

  const handleRetweet = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await toggleRetweet(tweet.id, tweet.isRetweeted);
  };

  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await toggleBookmark(tweet.id, tweet.isBookmarked);
  };

  const handleComment = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowCommentModal(true);
  };

  const handleDelete = async () => {
    await deleteTweet(tweet.id);
    setShowDeleteDialog(false);
  };

  const formatContent = (content: string) => {
    const parts = content.split(/(#\w+|@\w+|https?:\/\/[^\s]+)/g);
    return parts.map((part, index) => {
      if (part.startsWith("#")) {
        return (
          <Link
            key={index}
            href={`/hashtag/${part.slice(1)}`}
            className="hashtag"
            onClick={(e) => e.stopPropagation()}
          >
            {part}
          </Link>
        );
      }
      if (part.startsWith("@")) {
        return (
          <Link
            key={index}
            href={`/profile/${part.slice(1)}`}
            className="mention"
            onClick={(e) => e.stopPropagation()}
          >
            {part}
          </Link>
        );
      }
      if (/^https?:\/\//.test(part)) {
        let displayUrl = part;
        try {
          const url = new URL(part);
          displayUrl = url.hostname + (url.pathname.length > 1 ? url.pathname.slice(0, 20) + (url.pathname.length > 21 ? '...' : '') : '');
        } catch {}
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="text-primary hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {displayUrl}
          </a>
        );
      }
      return part;
    });
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const imageGridClass = (count: number) => {
    if (count === 1) return "grid-cols-1";
    if (count === 2) return "grid-cols-2";
    if (count === 3) return "grid-cols-2";
    return "grid-cols-2";
  };

  return (
    <>
      <article className="tweet-card flex gap-3 cursor-pointer animate-fade-in">
        <Link href={`/profile/${tweet.author.username}`} onClick={(e) => e.stopPropagation()}>
          <img
            src={tweet.author.avatar}
            alt={tweet.author.displayName}
            className="w-10 h-10 rounded-full hover:opacity-90 transition-opacity"
          />
        </Link>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 text-sm">
            <Link
              href={`/profile/${tweet.author.username}`}
              className="font-bold hover:underline truncate flex items-center gap-1"
              onClick={(e) => e.stopPropagation()}
            >
              {tweet.author.displayName}
              {tweet.author.isVerified && (
                <svg viewBox="0 0 22 22" className="w-4 h-4 fill-primary flex-shrink-0">
                  <path d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z" />
                </svg>
              )}
            </Link>
            <span className="text-muted-foreground">@{tweet.author.username}</span>
            <span className="text-muted-foreground">·</span>
            <span className="text-muted-foreground hover:underline">
              {formatDistanceToNow(tweet.createdAt, { addSuffix: false })}
            </span>
            {tweet.isEdited && (
              <>
                <span className="text-muted-foreground">·</span>
                <span className="text-muted-foreground text-xs">Edited</span>
              </>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <button className="ml-auto p-2 -m-2 rounded-full hover:bg-primary/10 text-muted-foreground hover:text-primary">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="w-56 bg-background border-border shadow-xl z-50"
                onClick={(e) => e.stopPropagation()}
              >
                {canEdit && (
                  <DropdownMenuItem 
                    onClick={() => setShowEditModal(true)}
                    className="gap-3 cursor-pointer"
                  >
                    <Pencil className="w-4 h-4" />
                    <span>Edit tweet</span>
                  </DropdownMenuItem>
                )}
                {isOwnTweet && !currentUser.isPro && (
                  <DropdownMenuItem className="gap-3 cursor-pointer text-muted-foreground" disabled>
                    <Pencil className="w-4 h-4" />
                    <span>Edit (Pro only)</span>
                  </DropdownMenuItem>
                )}
                {isOwnTweet && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => setShowDeleteDialog(true)}
                      className="gap-3 cursor-pointer text-destructive focus:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete tweet</span>
                    </DropdownMenuItem>
                  </>
                )}
                {!isOwnTweet && (
                  <>
                    <DropdownMenuItem className="gap-3 cursor-pointer">
                      Not interested in this post
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-3 cursor-pointer">
                      Follow @{tweet.author.username}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="gap-3 cursor-pointer text-destructive focus:text-destructive">
                      Block @{tweet.author.username}
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-3 cursor-pointer text-destructive focus:text-destructive">
                      Report post
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <p className="mt-1 whitespace-pre-wrap break-words">{formatContent(tweet.content)}</p>

          {tweet.images && tweet.images.length > 0 && (
            <div className={cn(
              "mt-3 grid gap-0.5 rounded-2xl overflow-hidden",
              imageGridClass(tweet.images.length)
            )}>
              {tweet.images.map((image, index) => (
                <div
                  key={index}
                  className={cn(
                    "relative aspect-video bg-secondary",
                    tweet.images!.length === 3 && index === 0 && "row-span-2 aspect-auto"
                  )}
                >
                  <img
                    src={image}
                    alt={`Tweet image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between mt-3 max-w-md">
            <button onClick={handleComment} className="action-button group">
              <MessageCircle className="w-5 h-5 group-hover:text-primary" />
              <span className="text-sm group-hover:text-primary">{formatNumber(tweet.comments)}</span>
            </button>

            <button
              onClick={handleRetweet}
              className={cn("action-button retweet group", tweet.isRetweeted && "text-retweet")}
            >
              <Repeat2 className={cn("w-5 h-5", tweet.isRetweeted && "text-retweet")} />
              <span className="text-sm">{formatNumber(tweet.retweets)}</span>
            </button>

            <button
              onClick={handleLike}
              className={cn("action-button like group", tweet.isLiked && "text-like")}
            >
              <Heart
                className={cn(
                  "w-5 h-5 transition-transform",
                  tweet.isLiked && "fill-current text-like",
                  isAnimatingLike && "animate-heart"
                )}
              />
              <span className="text-sm">{formatNumber(tweet.likes)}</span>
            </button>

            <button
              onClick={handleBookmark}
              className={cn("action-button bookmark group", tweet.isBookmarked && "text-bookmark")}
            >
              <Bookmark
                className={cn(
                  "w-5 h-5",
                  tweet.isBookmarked && "fill-current text-bookmark"
                )}
              />
            </button>

            <button className="action-button group">
              <Share className="w-5 h-5 group-hover:text-primary" />
            </button>
          </div>
        </div>
      </article>

      <CommentModal
        open={showCommentModal}
        onOpenChange={setShowCommentModal}
        tweet={tweet}
      />

      {canEdit && (
        <EditTweetModal
          open={showEditModal}
          onOpenChange={setShowEditModal}
          tweet={tweet}
        />
      )}

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-background border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Tweet?</AlertDialogTitle>
            <AlertDialogDescription>
              This can't be undone and it will be removed from your profile, the timeline of any accounts that follow you, and from search results.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
