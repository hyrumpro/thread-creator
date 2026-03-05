'use client';

import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/MainLayout";
import { TweetComposer } from "@/components/tweet/TweetComposer";
import { TweetFeed } from "@/components/tweet/TweetFeed";
import { useTimeline } from "@/hooks/useTimeline";
import { useSession } from "@/hooks/useAuth";
import { PaymentSuccessModal, PaymentCancelledModal } from "@/components/payment/PaymentResultModal";
import Link from "next/link";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"for-you" | "following">("for-you");
  const [paymentStatus, setPaymentStatus] = useState<'success' | 'cancelled' | null>(null);
  const { data: user } = useSession();
  const timelineQuery = useTimeline(activeTab);
  const queryClient = useQueryClient();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const payment = params.get('payment');
    if (payment === 'success') {
      setPaymentStatus('success');
      // Invalidate profile so Pro status refreshes once webhook fires
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    } else if (payment === 'cancelled') {
      setPaymentStatus('cancelled');
    }
    if (payment) {
      window.history.replaceState({}, '', '/');
    }
  }, [queryClient]);

  const tweets = useMemo(
    () => timelineQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [timelineQuery.data]
  );

  return (
    <MainLayout>
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
        <h1 className="text-xl font-bold p-4">Home</h1>
        <div className="flex">
          <button
            onClick={() => setActiveTab("for-you")}
            className={`flex-1 py-4 text-center font-medium transition-colors relative hover:bg-secondary ${
              activeTab === "for-you" ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            For you
            {activeTab === "for-you" && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-primary rounded-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("following")}
            className={`flex-1 py-4 text-center font-medium transition-colors relative hover:bg-secondary ${
              activeTab === "following" ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            Following
            {activeTab === "following" && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-primary rounded-full" />
            )}
          </button>
        </div>
      </header>

      {/* Composer — only for authenticated users */}
      {user && <TweetComposer />}

      {/* Feed — for following tab, guests see a sign-in prompt */}
      {activeTab === "following" && !user ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-center px-8">
          <p className="text-xl font-bold">Stay up to date</p>
          <p className="text-muted-foreground">Log in to see tweets from people you follow.</p>
          <Link
            href="/login"
            className="px-6 py-2 rounded-full bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
          >
            Log in
          </Link>
        </div>
      ) : (
        <TweetFeed
          tweets={tweets}
          isInitialLoading={timelineQuery.isLoading}
          isFetchingMore={timelineQuery.isFetchingNextPage}
          onLoadMore={timelineQuery.hasNextPage ? timelineQuery.fetchNextPage : undefined}
          hasMore={timelineQuery.hasNextPage}
        />
      )}

      {/* Payment result modals */}
      <PaymentSuccessModal
        open={paymentStatus === 'success'}
        onOpenChange={(open) => !open && setPaymentStatus(null)}
      />
      <PaymentCancelledModal
        open={paymentStatus === 'cancelled'}
        onOpenChange={(open) => !open && setPaymentStatus(null)}
      />
    </MainLayout>
  );
}
