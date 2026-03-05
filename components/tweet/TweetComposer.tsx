'use client';

import { useState, useRef } from "react";
import Link from "next/link";
import { Image, Smile, Calendar, MapPin, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTweets } from "@/context/TweetContext";
import { MultiImageUpload } from "@/components/ui/image-upload";
import { cn } from "@/lib/utils";

interface TweetComposerProps {
  placeholder?: string;
  onPost?: () => void;
  variant?: "default" | "modal";
}

export function TweetComposer({ 
  placeholder = "What is happening?!", 
  onPost,
  variant = "default"
}: TweetComposerProps) {
  const [content, setContent] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { currentUser, addTweet } = useTweets();
  const inputRef = useRef<HTMLInputElement>(null);
  const maxLength = currentUser.isPro ? 10000 : 280;
  const remaining = maxLength - content.length;
  const progress = (content.length / maxLength) * 100;

  // Guest: show sign-in CTA instead of composer
  if (currentUser.id === 'guest') {
    return (
      <div className="flex items-center justify-between gap-4 p-4 border-b border-border">
        <p className="text-muted-foreground text-[15px]">Sign in to post and join the conversation.</p>
        <Link href="/login">
          <Button className="rounded-full font-bold px-5 flex-shrink-0">Sign in</Button>
        </Link>
      </div>
    );
  }

  const handleSubmit = async () => {
    if ((!content.trim() && images.length === 0) || content.length > maxLength || isLoading) return;

    setIsLoading(true);
    try {
      await addTweet(content, images);
      setContent("");
      setImages([]);
      setIsFocused(false);
      onPost?.();
    } catch {
      // Error already shown via toast in context
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddImage = () => {
    if (images.length >= 4) return;
    inputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remainingSlots = 4 - images.length;
    
    files.slice(0, remainingSlots).forEach((file) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          setImages((prev) => [...prev, ev.target?.result as string]);
        };
        reader.readAsDataURL(file);
      }
    });
    e.target.value = "";
  };

  return (
    <div className={cn(
      "flex gap-3 p-4 border-b border-border",
      variant === "modal" && "border-none"
    )}>
      <img
        src={currentUser.avatar}
        alt={currentUser.displayName}
        className="w-10 h-10 rounded-full"
      />
      <div className="flex-1">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onFocus={() => setIsFocused(true)}
          placeholder={placeholder}
          className="w-full bg-transparent text-xl resize-none outline-none min-h-[60px] placeholder:text-muted-foreground"
          rows={isFocused || content ? 3 : 1}
          disabled={isLoading}
        />

        {images.length > 0 && (
          <div className="mt-3 mb-3">
            <MultiImageUpload
              values={images}
              onChange={setImages}
              maxImages={4}
            />
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageChange}
          className="hidden"
        />

        {isFocused && (
          <button className="text-primary text-sm font-bold py-1 px-3 -ml-3 rounded-full hover:bg-primary/10 transition-colors mb-3">
            Everyone can reply
          </button>
        )}

        <div className={cn(
          "flex items-center justify-between pt-3",
          (isFocused || content || images.length > 0) && "border-t border-border"
        )}>
          <div className="flex gap-1 -ml-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className={cn(
                "rounded-full text-primary hover:bg-primary/10",
                images.length >= 4 && "opacity-50 cursor-not-allowed"
              )}
              onClick={handleAddImage}
              disabled={images.length >= 4 || isLoading}
            >
              <Image className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full text-primary hover:bg-primary/10" disabled>
              <Smile className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full text-primary hover:bg-primary/10" disabled>
              <Calendar className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full text-primary hover:bg-primary/10" disabled>
              <MapPin className="w-5 h-5" />
            </Button>
          </div>

          <div className="flex items-center gap-3">
            {(content.length > 0 || images.length > 0) && (
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
              disabled={(!content.trim() && images.length === 0) || content.length > maxLength || isLoading}
              className="rounded-full font-bold px-5"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Post"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
