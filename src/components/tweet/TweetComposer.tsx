import { useState } from "react";
import { Image, Smile, Calendar, MapPin, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTweets } from "@/context/TweetContext";

interface TweetComposerProps {
  placeholder?: string;
  onPost?: () => void;
}

export function TweetComposer({ placeholder = "What is happening?!", onPost }: TweetComposerProps) {
  const [content, setContent] = useState("");
  const { currentUser, addTweet } = useTweets();
  const maxLength = 280;
  const remaining = maxLength - content.length;
  const progress = (content.length / maxLength) * 100;

  const handleSubmit = () => {
    if (content.trim() && content.length <= maxLength) {
      addTweet(content);
      setContent("");
      onPost?.();
    }
  };

  return (
    <div className="flex gap-3 p-4 border-b border-border">
      <img
        src={currentUser.avatar}
        alt={currentUser.displayName}
        className="w-10 h-10 rounded-full"
      />
      <div className="flex-1">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent text-xl resize-none outline-none min-h-[80px] placeholder:text-muted-foreground"
          rows={2}
        />

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div className="flex gap-1 -ml-2">
            <Button variant="ghost" size="icon" className="rounded-full text-primary hover:bg-primary/10">
              <Image className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full text-primary hover:bg-primary/10">
              <Smile className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full text-primary hover:bg-primary/10">
              <Calendar className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full text-primary hover:bg-primary/10">
              <MapPin className="w-5 h-5" />
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
                <div className="w-px h-6 bg-border" />
              </>
            )}
            <Button
              onClick={handleSubmit}
              disabled={!content.trim() || content.length > maxLength}
              className="rounded-full font-bold px-5"
            >
              Post
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
