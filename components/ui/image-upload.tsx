'use client';

import { useCallback, useState, useRef } from "react";
import { X, Upload, Image as ImageIcon, Camera, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ImageUploadProps {
  value?: string;
  onChange: (value: string | undefined) => void;
  variant?: "avatar" | "cover" | "post";
  className?: string;
  disabled?: boolean;
  folder?: string;
}

async function uploadToCloudinary(file: File, folder: string): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Upload failed');
  }

  const data = await response.json();
  return data.url;
}

export function ImageUpload({
  value,
  onChange,
  variant = "post",
  className,
  disabled = false,
  folder = "thread-creator",
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (disabled) return;

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleFile(files[0]);
      }
    },
    [disabled, folder]
  );

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be less than 10MB");
      return;
    }

    setIsUploading(true);

    try {
      const url = await uploadToCloudinary(file, folder);
      onChange(url);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(undefined);
  };

  const variantStyles = {
    avatar: "w-28 h-28 rounded-full",
    cover: "w-full h-48 rounded-xl",
    post: "w-full h-40 rounded-xl",
  };

  const placeholderContent = {
    avatar: (
      <div className="flex flex-col items-center justify-center gap-2">
        <Camera className="w-8 h-8 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">Add photo</span>
      </div>
    ),
    cover: (
      <div className="flex flex-col items-center justify-center gap-2">
        <ImageIcon className="w-10 h-10 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Add cover image</span>
        <span className="text-xs text-muted-foreground/60">Drag & drop or click to upload</span>
      </div>
    ),
    post: (
      <div className="flex flex-col items-center justify-center gap-2">
        <Upload className="w-8 h-8 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Add image</span>
      </div>
    ),
  };

  return (
    <div
      onClick={() => !disabled && !isUploading && inputRef.current?.click()}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "relative cursor-pointer overflow-hidden transition-all duration-200 group",
        variantStyles[variant],
        isDragging
          ? "border-2 border-dashed border-primary bg-primary/10"
          : "border-2 border-dashed border-border bg-secondary/50 hover:bg-secondary hover:border-muted-foreground/50",
        (disabled || isUploading) && "cursor-not-allowed opacity-50",
        className
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled || isUploading}
      />

      {isUploading ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : value ? (
        <>
          <img
            src={value}
            alt="Upload preview"
            className={cn(
              "w-full h-full object-cover",
              variant === "avatar" && "rounded-full"
            )}
          />
          <div
            className={cn(
              "absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center",
              variant === "avatar" && "rounded-full"
            )}
          >
            <button
              onClick={handleRemove}
              className="p-2 bg-destructive rounded-full hover:bg-destructive/90 transition-colors"
            >
              <X className="w-5 h-5 text-destructive-foreground" />
            </button>
          </div>
        </>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          {placeholderContent[variant]}
        </div>
      )}
    </div>
  );
}

interface MultiImageUploadProps {
  values: string[];
  onChange: (values: string[]) => void;
  maxImages?: number;
  className?: string;
  disabled?: boolean;
}

export function MultiImageUpload({
  values,
  onChange,
  maxImages = 4,
  className,
  disabled = false,
}: MultiImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled && values.length < maxImages) setIsDragging(true);
  }, [disabled, values.length, maxImages]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      if (disabled) return;

      const files = Array.from(e.dataTransfer.files).filter((f) =>
        f.type.startsWith("image/")
      );
      handleFiles(files);
    },
    [disabled, values, maxImages]
  );

  const handleFiles = async (files: File[]) => {
    const remaining = maxImages - values.length;
    const filesToProcess = files.slice(0, remaining);

    setIsUploading(true);

    try {
      const uploadPromises = filesToProcess.map((file) =>
        uploadToCloudinary(file, "thread-creator/posts")
      );

      const urls = await Promise.all(uploadPromises);
      onChange([...values, ...urls]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to upload images");
    } finally {
      setIsUploading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
    e.target.value = "";
  };

  const handleRemove = (index: number) => {
    onChange(values.filter((_, i) => i !== index));
  };

  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-2",
    3: "grid-cols-2",
    4: "grid-cols-2",
  };

  if (values.length === 0 && !isUploading) {
    return null;
  }

  return (
    <div
      className={cn(
        "relative rounded-xl overflow-hidden",
        className
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled || isUploading}
      />

      <div
        className={cn(
          "grid gap-0.5",
          gridCols[Math.min(values.length, 4) as 1 | 2 | 3 | 4]
        )}
      >
        {values.map((src, index) => (
          <div
            key={index}
            className={cn(
              "relative group aspect-video",
              values.length === 3 && index === 0 && "row-span-2 aspect-auto"
            )}
          >
            <img
              src={src}
              alt={`Upload ${index + 1}`}
              className="w-full h-full object-cover"
            />
            <button
              onClick={() => handleRemove(index)}
              className="absolute top-2 right-2 p-1.5 bg-black/70 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/90"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        ))}

        {isUploading && (
          <div className="aspect-video flex items-center justify-center bg-secondary">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>

      {isDragging && (
        <div className="absolute inset-0 bg-primary/20 border-2 border-dashed border-primary flex items-center justify-center">
          <p className="text-primary font-medium">Drop to add</p>
        </div>
      )}

      {values.length < maxImages && !isUploading && (
        <button
          onClick={() => inputRef.current?.click()}
          className="absolute bottom-2 right-2 p-2 bg-black/70 rounded-full hover:bg-black/90 transition-colors"
        >
          <Upload className="w-4 h-4 text-white" />
        </button>
      )}
    </div>
  );
}
