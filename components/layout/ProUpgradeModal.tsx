'use client';

import { useState } from "react";
import { Check, Sparkles, X, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTweets } from "@/context/TweetContext";
import { toast } from "sonner";

interface ProUpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const proFeatures = [
  "Edit your tweets anytime",
  "Blue verification checkmark",
  "Longer posts (up to 10,000 characters)",
  "100 tweets/hour (vs 20 for free)",
  "Priority in timeline algorithm",
  "Priority support",
];

export function ProUpgradeModal({ open, onOpenChange }: ProUpgradeModalProps) {
  const { currentUser } = useTweets();
  const [isLoading, setIsLoading] = useState(false);

  const handleUpgrade = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create checkout session');
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to start checkout");
    } finally {
      setIsLoading(false);
    }
  };

  if (currentUser.isPro) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md bg-background border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Sparkles className="w-6 h-6 text-primary fill-primary" />
              You're a Pro Member!
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-6 text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <Check className="w-10 h-10 text-primary" />
            </div>
            <p className="text-muted-foreground mb-4">
              You have access to all Pro features including tweet editing and the blue checkmark.
            </p>
            <div className="bg-secondary/50 rounded-lg p-4 text-left">
              <p className="text-sm font-medium mb-2">Your Pro benefits:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                {proFeatures.slice(0, 4).map((feature, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Check className="w-3 h-3 text-primary" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-background border-border p-0 overflow-hidden">
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 rounded-full p-1 hover:bg-secondary transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="bg-gradient-to-br from-primary via-primary/80 to-primary/60 p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Upgrade to Pro</h2>
          <p className="text-white/80">Unlock premium features and stand out</p>
        </div>

        <div className="p-6">
          <div className="space-y-3 mb-6">
            {proFeatures.map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-primary" />
                </div>
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>

          <div className="bg-secondary/50 rounded-xl p-4 mb-6">
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-3xl font-bold">$8</span>
              <span className="text-muted-foreground">/ month</span>
            </div>
            <p className="text-center text-sm text-muted-foreground mt-1">
              Cancel anytime. Secure payment via Stripe.
            </p>
          </div>

          <Button 
            onClick={handleUpgrade}
            disabled={isLoading}
            className="w-full py-6 text-lg font-bold rounded-full bg-foreground text-background hover:bg-foreground/90"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              "Subscribe & Upgrade"
            )}
          </Button>

          <p className="text-center text-xs text-muted-foreground mt-4">
            By subscribing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
