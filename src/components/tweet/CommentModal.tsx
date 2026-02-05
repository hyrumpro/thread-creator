import { useState } from "react";
import { X, Image as ImageIcon, Smile, Calendar, MapPin } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tweet } from "@/types/tweet";
import { useTweets } from "@/context/TweetContext";
import { formatDistanceToNow } from "date-fns";
import { MultiImageUpload } from "@/components/ui/image-upload";

interface CommentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tweet: Tweet;
}

export function CommentModal({ open, onOpenChange, tweet }: CommentModalProps) {
  const [content, setContent] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const { currentUser, addComment } = useTweets();
  const maxLength = 280;
  const remaining = maxLength - content.length;
  const progress = (content.length / maxLength) * 100;

  const handleSubmit = () => {
    if (content.trim() && content.length <= maxLength) {
      addComment(tweet.id, content);
      setContent("");
      setImages([]);
      onOpenChange(false);
    }
  };

  const handleAddImage = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.multiple = true;
    input.onchange = (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || []);
      files.slice(0, 4 - images.length).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (ev) => {
          setImages((prev) => [...prev, ev.target?.result as string]);
        };
        reader.readAsDataURL(file);
      });
    };
    input.click();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden bg-background border-border">
        {/* Header */}
        <DialogHeader className="flex flex-row items-center p-4 border-b border-border">
          <button
            onClick={() => onOpenChange(false)}
            className="p-2 -m-2 rounded-full hover:bg-secondary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <DialogTitle className="sr-only">Reply to tweet</DialogTitle>
        </DialogHeader>

        {/* Content */}
        <div className="p-4 max-h-[70vh] overflow-y-auto">
          {/* Original Tweet */}
          <div className="flex gap-3">
            <div className="flex flex-col items-center">
              <img
                src={tweet.author.avatar}
                alt={tweet.author.displayName}
                className="w-10 h-10 rounded-full"
              />
              <div className="w-0.5 flex-1 bg-border mt-2" />
            </div>
            <div className="flex-1 pb-4">
              <div className="flex items-center gap-1 text-sm">
                <span className="font-bold">{tweet.author.displayName}</span>
                {tweet.author.isVerified && (
                  <svg viewBox="0 0 22 22" className="w-4 h-4 fill-primary">
                    <path d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z" />
                  </svg>
                )}
                <span className="text-muted-foreground">@{tweet.author.username}</span>
                <span className="text-muted-foreground">·</span>
                <span className="text-muted-foreground">
                  {formatDistanceToNow(tweet.createdAt, { addSuffix: false })}
                </span>
              </div>
              <p className="mt-1 text-foreground">{tweet.content}</p>
              <p className="mt-3 text-sm text-muted-foreground">
                Replying to{" "}
                <span className="text-primary">@{tweet.author.username}</span>
              </p>
            </div>
          </div>

          {/* Reply Composer */}
          <div className="flex gap-3 mt-2">
            <img
              src={currentUser.avatar}
              alt={currentUser.displayName}
              className="w-10 h-10 rounded-full"
            />
            <div className="flex-1">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Post your reply"
                className="w-full bg-transparent text-xl resize-none outline-none min-h-[100px] placeholder:text-muted-foreground"
                autoFocus
              />

              {/* Image Preview */}
              {images.length > 0 && (
                <div className="mt-3">
                  <MultiImageUpload
                    values={images}
                    onChange={setImages}
                    maxImages={4}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between p-4 border-t border-border">
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full text-primary hover:bg-primary/10"
              onClick={handleAddImage}
              disabled={images.length >= 4}
            >
              <ImageIcon className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full text-primary hover:bg-primary/10"
            >
              <Smile className="w-5 h-5" />
            </Button>
          </div>

          <div className="flex items-center gap-3">
            {content.length > 0 && (
              <>
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
                      stroke={
                        remaining < 0
                          ? "hsl(var(--destructive))"
                          : remaining < 20
                          ? "hsl(45, 100%, 50%)"
                          : "hsl(var(--primary))"
                      }
                      strokeWidth="2"
                      strokeDasharray={`${Math.min(progress, 100) * 0.628} 100`}
                    />
                  </svg>
                  {remaining <= 20 && (
                    <span
                      className={`absolute inset-0 flex items-center justify-center text-xs ${
                        remaining < 0 ? "text-destructive" : "text-muted-foreground"
                      }`}
                    >
                      {remaining}
                    </span>
                  )}
                </div>
                <div className="w-px h-6 bg-border" />
              </>
            )}
            <Button
              onClick={handleSubmit}
              disabled={!content.trim() || content.length > maxLength}
              className="rounded-full font-bold px-5"
            >
              Reply
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
