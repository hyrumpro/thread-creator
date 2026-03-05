'use client';

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, Code2 } from "lucide-react";

const TECH_STACK = [
  "Next.js 16", "React 19", "TypeScript",
  "Supabase", "PostgreSQL", "React Query",
  "Stripe", "Cloudinary", "Tailwind CSS",
  "Radix UI", "Zod", "Node.js",
];

const FEATURES = [
  "Google OAuth & Magic Link authentication",
  "Custom feed ranking algorithm with time decay",
  "Stripe subscription + idempotent webhook processing",
  "Infinite scroll with React Query pagination",
  "Rate-limited API routes",
  "Row Level Security (Supabase RLS)",
  "Cloudinary image upload pipeline",
  "Real-time tweet interactions & cache invalidation",
  "Pro / Verified subscription tiers",
  "PostgreSQL custom functions & triggers",
];

interface PortfolioModalProps {
  open: boolean;
  onClose: () => void;
}

export function PortfolioModal({ open, onClose }: PortfolioModalProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto p-0 gap-0">

        {/* Header */}
        <div className="p-6 pb-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Code2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                Portfolio Project
              </p>
              <h2 className="text-xl font-bold leading-tight">Thread Creator</h2>
            </div>
          </div>

          <div className="space-y-0.5">
            <p className="font-semibold">Hyrum David Perez Abanto</p>
            <p className="text-sm text-muted-foreground">
              Full Stack Developer &middot; 2 years of experience
            </p>
            <p className="text-xs text-muted-foreground">
              MERN &middot; Next.js &middot; Web3 &amp; AI &middot; BYU&#8209;Idaho
            </p>
          </div>
        </div>

        <Separator />

        {/* About */}
        <div className="p-6 pb-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            I build full-stack apps with the MERN stack, Next.js, and Supabase. I also have
            hands-on Web3 experience from the{" "}
            <span className="text-foreground font-medium">Zoolander</span> project, where I
            wrote blockchain integrations — Smart Contract interactions, custom RPCs, and
            on-chain data pipelines — on top of a React/Next.js frontend.
          </p>
        </div>

        <Separator />

        {/* Tech stack */}
        <div className="p-6 pb-4 space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Stack used in this project
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {TECH_STACK.map((tech) => (
              <span
                key={tech}
                className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        <Separator />

        {/* Features */}
        <div className="p-6 pb-4 space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            What makes this non-trivial
          </h3>
          <ul className="space-y-2">
            {FEATURES.map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <Separator />

        {/* Footer */}
        <div className="p-6">
          <Button onClick={onClose} className="w-full rounded-full font-semibold">
            Explore the project
          </Button>
        </div>

      </DialogContent>
    </Dialog>
  );
}
