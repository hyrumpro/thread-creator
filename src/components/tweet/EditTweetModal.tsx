import { useState } from "react";
import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tweet } from "@/types/tweet";
import { useTweets } from "@/context/TweetContext";

interface EditTweetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tweet: Tweet;
}

export function EditTweetModal({ open, onOpenChange, tweet }: EditTweetModalProps) {
  const [content, setContent] = useState(tweet.content);
  const { editTweet, currentUser } = useTweets();
  const maxLength = currentUser.isPro ? 4000 : 280;
  const remaining = maxLength - content.length;
  const progress = (content.length / maxLength) * 100;

  const handleSave = () => {
    if (content.trim() && content.length <= maxLength) {
      editTweet(tweet.id, content);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl bg-background border-border">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <button
              onClick={() => onOpenChange(false)}
              className="rounded-full p-2 -m-2 hover:bg-secondary transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <DialogTitle className="text-lg font-bold">Edit Tweet</DialogTitle>
            <div className="w-8" />
          </div>
        </DialogHeader>

        <div className="flex gap-3 mt-4">
          <img
            src={tweet.author.avatar}
            alt={tweet.author.displayName}
            className="w-10 h-10 rounded-full"
          />
          <div className="flex-1">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-transparent text-xl resize-none outline-none min-h-[120px] placeholder:text-muted-foreground"
              autoFocus
            />

            {/* Character counter */}
            <div className="flex items-center justify-between pt-3 border-t border-border">
              <div className="flex items-center gap-3">
                <div className="relative w-6 h-6">
                  <svg className="w-6 h-6 -rotate-90">
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      fill="none"
                      stroke="hsl(var(--muted))"
                      strokeWidth="2"
                    />
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      fill="none"
                      stroke={remaining < 0 ? "hsl(var(--destructive))" : remaining < 20 ? "hsl(45, 100%, 50%)" : "hsl(var(--primary))"}
                      strokeWidth="2"
                      strokeDasharray={`${Math.min(progress, 100) * 0.628} 100`}
                    />
                  </svg>
                  {remaining <= 20 && (
                    <span className={`absolute inset-0 flex items-center justify-center text-xs ${remaining < 0 ? "text-destructive" : "text-muted-foreground"}`}>
                      {remaining}
                    </span>
                  )}
                </div>
                {currentUser.isPro && (
                  <span className="text-xs text-muted-foreground">
                    Pro: {maxLength.toLocaleString()} char limit
                  </span>
                )}
              </div>

              <Button
                onClick={handleSave}
                disabled={!content.trim() || content.length > maxLength}
                className="rounded-full font-bold px-5"
              >
                Save
              </Button>
            </div>
          </div>
        </div>

        <p className="text-xs text-muted-foreground text-center mt-2">
          Edited tweets show an "Edited" label visible to everyone.
        </p>
      </DialogContent>
    </Dialog>
  );
}
