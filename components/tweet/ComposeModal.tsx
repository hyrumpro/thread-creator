'use client';

import { useState } from "react";
import { X, Image as ImageIcon, Smile, Calendar, MapPin, Globe } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTweets } from "@/context/TweetContext";
import { MultiImageUpload } from "@/components/ui/image-upload";

interface ComposeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ComposeModal({ open, onOpenChange }: ComposeModalProps) {
  const [content, setContent] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const { currentUser, addTweet } = useTweets();
  const maxLength = currentUser.isPro ? 10000 : 280;
  const remaining = maxLength - content.length;
  const progress = (content.length / maxLength) * 100;

  const handleSubmit = () => {
    if ((content.trim() || images.length > 0) && content.length <= maxLength) {
      addTweet(content, images);
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

  const handleClose = () => {
    setContent("");
    setImages([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden bg-background border-border">
        {/* Header */}
        <DialogHeader className="flex flex-row items-center p-4 border-b border-border">
          <button
            onClick={handleClose}
            className="p-2 -m-2 rounded-full hover:bg-secondary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <DialogTitle className="sr-only">Compose new post</DialogTitle>
          <button className="ml-auto text-primary text-sm font-bold hover:underline">
            Drafts
          </button>
        </DialogHeader>

        {/* Content */}
        <div className="p-4">
          <div className="flex gap-3">
            <img
              src={currentUser.avatar}
              alt={currentUser.displayName}
              className="w-10 h-10 rounded-full"
            />
            <div className="flex-1">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What is happening?!"
                className="w-full bg-transparent text-xl resize-none outline-none min-h-[120px] placeholder:text-muted-foreground"
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

              {/* Audience selector */}
              <button className="flex items-center gap-1 text-primary text-sm font-bold py-2 px-3 -ml-3 rounded-full hover:bg-primary/10 transition-colors border border-primary/30 mt-3">
                <Globe className="w-4 h-4" />
                Everyone can reply
              </button>
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
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full text-primary hover:bg-primary/10"
            >
              <Calendar className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full text-primary hover:bg-primary/10"
            >
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
              disabled={(!content.trim() && images.length === 0) || content.length > maxLength}
              className="rounded-full font-bold px-5"
            >
              Post
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
