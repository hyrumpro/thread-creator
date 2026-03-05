'use client';

import { Check, Sparkles, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const proFeatures = [
  'Blue verification checkmark',
  'Edit your tweets anytime',
  'Longer posts (up to 10,000 characters)',
  '100 tweets/hour (vs 20 for free)',
  'Priority in timeline algorithm',
];

interface PaymentSuccessModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PaymentSuccessModal({ open, onOpenChange }: PaymentSuccessModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-background border-border p-0 overflow-hidden">
        <DialogTitle className="sr-only">Welcome to Pro</DialogTitle>
        <div className="bg-gradient-to-br from-primary via-primary/80 to-primary/60 p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-1">Welcome to Pro!</h2>
          <p className="text-white/80 text-sm">Your subscription is now active</p>
        </div>

        <div className="p-6">
          <p className="text-center text-muted-foreground text-sm mb-5">
            You now have access to all premium features. Here's what you unlocked:
          </p>

          <div className="space-y-2 mb-6">
            {proFeatures.map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-primary-foreground" />
                </div>
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>

          <Button
            onClick={() => onOpenChange(false)}
            className="w-full rounded-full py-5 font-bold bg-foreground text-background hover:bg-foreground/90"
          >
            Start posting
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface PaymentCancelledModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PaymentCancelledModal({ open, onOpenChange }: PaymentCancelledModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-background border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="w-4 h-4 text-destructive" />
            </div>
            Payment not completed
          </DialogTitle>
        </DialogHeader>

        <div className="py-2 space-y-4">
          <p className="text-muted-foreground text-sm">
            Your payment was not completed and you have not been charged. You can try again whenever you're ready.
          </p>

          <div className="bg-secondary/50 rounded-lg p-4 text-sm text-muted-foreground space-y-1">
            <p className="font-medium text-foreground">Common reasons:</p>
            <p>· Card declined or insufficient funds</p>
            <p>· You cancelled the checkout</p>
            <p>· Session timed out</p>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 rounded-full"
            >
              Maybe later
            </Button>
            <Button
              asChild
              className="flex-1 rounded-full bg-foreground text-background hover:bg-foreground/90"
              onClick={() => onOpenChange(false)}
            >
              <Link href="/settings?tab=subscription">Try again</Link>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
