'use client';

import { useState } from "react";
import { X, Camera, ImageIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ImageUpload } from "@/components/ui/image-upload";
import { User } from "@/types/tweet";

interface EditProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
  onSave: (updates: Partial<User>) => void;
}

export function EditProfileModal({
  open,
  onOpenChange,
  user,
  onSave,
}: EditProfileModalProps) {
  const [formData, setFormData] = useState({
    displayName: user.displayName,
    bio: user.bio || "",
    avatar: user.avatar,
    coverImage: user.coverImage || "",
  });

  const handleSave = () => {
    onSave({
      displayName: formData.displayName,
      bio: formData.bio,
      avatar: formData.avatar,
      coverImage: formData.coverImage,
    });
    onOpenChange(false);
  };

  const handleReset = () => {
    setFormData({
      displayName: user.displayName,
      bio: user.bio || "",
      avatar: user.avatar,
      coverImage: user.coverImage || "",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-background border-border">
        {/* Header */}
        <DialogHeader className="flex flex-row items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-8">
            <button
              onClick={() => onOpenChange(false)}
              className="p-2 -m-2 rounded-full hover:bg-secondary transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <DialogTitle className="text-xl font-bold">Edit profile</DialogTitle>
          </div>
          <Button
            onClick={handleSave}
            className="rounded-full font-bold px-4"
            disabled={!formData.displayName.trim()}
          >
            Save
          </Button>
        </DialogHeader>

        {/* Content */}
        <div className="max-h-[70vh] overflow-y-auto">
          {/* Cover Image */}
          <div className="relative">
            <div className="h-48 bg-secondary relative">
              {formData.coverImage ? (
                <img
                  src={formData.coverImage}
                  alt="Cover"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5" />
              )}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-4">
                <label className="p-3 bg-black/60 rounded-full cursor-pointer hover:bg-black/70 transition-colors">
                  <Camera className="w-6 h-6 text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (ev) =>
                          setFormData((prev) => ({
                            ...prev,
                            coverImage: ev.target?.result as string,
                          }));
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>
                {formData.coverImage && (
                  <button
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, coverImage: "" }))
                    }
                    className="p-3 bg-black/60 rounded-full hover:bg-black/70 transition-colors"
                  >
                    <X className="w-6 h-6 text-white" />
                  </button>
                )}
              </div>
            </div>

            {/* Avatar */}
            <div className="absolute -bottom-16 left-4">
              <div className="relative">
                <div className="w-28 h-28 rounded-full border-4 border-background overflow-hidden bg-secondary">
                  <img
                    src={formData.avatar}
                    alt={formData.displayName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full cursor-pointer hover:bg-black/50 transition-colors">
                  <Camera className="w-8 h-8 text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (ev) =>
                          setFormData((prev) => ({
                            ...prev,
                            avatar: ev.target?.result as string,
                          }));
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="pt-20 px-4 pb-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="displayName" className="text-muted-foreground">
                Name
              </Label>
              <Input
                id="displayName"
                value={formData.displayName}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, displayName: e.target.value }))
                }
                maxLength={50}
                className="bg-transparent border-border focus-visible:ring-primary"
              />
              <p className="text-xs text-muted-foreground text-right">
                {formData.displayName.length}/50
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio" className="text-muted-foreground">
                Bio
              </Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, bio: e.target.value }))
                }
                maxLength={160}
                rows={3}
                className="bg-transparent border-border focus-visible:ring-primary resize-none"
                placeholder="Tell the world about yourself..."
              />
              <p className="text-xs text-muted-foreground text-right">
                {formData.bio.length}/160
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
