'use client';

import { useState } from "react";
import { ArrowLeft, User, CreditCard, Bell, Lock, Palette, Shield, Sparkles, Check, ChevronRight, Loader2, CheckCircle2, Mail } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useTweets } from "@/context/TweetContext";
import { useSession } from "@/hooks/useAuth";
import { useDisplayPreferences } from "@/hooks/useDisplayPreferences";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type SettingsTab = "account" | "subscription" | "notifications" | "privacy" | "display" | "security";

const tabs = [
  { id: "account" as const, label: "Account", icon: User },
  { id: "subscription" as const, label: "Subscription", icon: CreditCard },
  { id: "notifications" as const, label: "Notifications", icon: Bell },
  { id: "privacy" as const, label: "Privacy", icon: Lock },
  { id: "display" as const, label: "Display", icon: Palette },
  { id: "security" as const, label: "Security", icon: Shield },
];

export default function Settings() {
  const { currentUser } = useTweets();
  const { data: authUser } = useSession();
  const [activeTab, setActiveTab] = useState<SettingsTab>("account");
  const [isLoadingCheckout, setIsLoadingCheckout] = useState(false);
  const [isLoadingPortal, setIsLoadingPortal] = useState(false);

  const handleUpgradeToPro = async () => {
    if (!authUser) { window.location.href = '/login?redirect=/settings'; return; }
    setIsLoadingCheckout(true);
    try {
      const response = await fetch('/api/stripe/checkout', { method: 'POST' });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error?.message || 'Failed to create checkout session');
      }
      const { data } = await response.json();
      window.location.href = data.url;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to start checkout");
    } finally {
      setIsLoadingCheckout(false);
    }
  };

  const handleManageSubscription = async () => {
    setIsLoadingPortal(true);
    try {
      const response = await fetch('/api/stripe/checkout');
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error?.message || 'Failed to open billing portal');
      }
      const { data } = await response.json();
      window.location.href = data.url;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to open billing portal");
    } finally {
      setIsLoadingPortal(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center gap-4 p-4 max-w-4xl mx-auto">
          <Link href="/" className="p-2 -m-2 rounded-full hover:bg-secondary">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-bold">Settings</h1>
        </div>
      </header>

      <div className="max-w-4xl mx-auto flex flex-col md:flex-row min-h-[calc(100vh-65px)]">
        {/* Mobile: horizontal scrollable tab bar */}
        <div className="md:hidden flex overflow-x-auto border-b border-border px-2 py-2 gap-1 flex-shrink-0 scrollbar-hide">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0",
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-secondary"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Desktop: vertical sidebar */}
        <nav className="hidden md:block w-64 border-r border-border p-2 flex-shrink-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors",
                  activeTab === tab.id ? "bg-secondary font-semibold" : "hover:bg-secondary/50"
                )}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.label}</span>
                <ChevronRight className="w-4 h-4 ml-auto text-muted-foreground" />
              </button>
            );
          })}
        </nav>

        {/* Content */}
        <div className="flex-1 p-4 md:p-6 overflow-y-auto">
          {activeTab === "account" && <AccountSettings user={currentUser} />}
          {activeTab === "subscription" && (
            <SubscriptionSettings
              user={currentUser}
              onUpgrade={handleUpgradeToPro}
              onManage={handleManageSubscription}
              isLoadingCheckout={isLoadingCheckout}
              isLoadingPortal={isLoadingPortal}
            />
          )}
          {activeTab === "notifications" && <NotificationSettings />}
          {activeTab === "privacy" && <PrivacySettings />}
          {activeTab === "display" && <DisplaySettings />}
          {activeTab === "security" && <SecuritySettings email={authUser?.email} />}
        </div>
      </div>
    </div>
  );
}

/* ── Account ── */
function AccountSettings({ user }: { user: any }) {
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-1">Your Account</h2>
        <p className="text-muted-foreground text-sm">
          See information about your account or update your profile details.
        </p>
      </div>

      <Link href="/profile" className="flex items-center gap-4 p-4 rounded-xl border border-border hover:bg-secondary/50 transition-colors">
        <img src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} alt={user.displayName} className="w-12 h-12 rounded-full object-cover" onError={(e) => { e.currentTarget.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`; e.currentTarget.onerror = null; }} />
        <div className="flex-1 min-w-0">
          <p className="font-semibold truncate">{user.displayName}</p>
          <p className="text-sm text-muted-foreground truncate">@{user.username}</p>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
      </Link>

      <Separator />

      <div className="space-y-1">
        <SettingsRow label="Username" value={`@${user.username}`} />
        <SettingsRow label="Plan" value={user.isPro ? "Pro" : "Free"} />
      </div>

      <Separator />

      <button className="w-full text-left p-3 rounded-lg hover:bg-secondary/50 transition-colors flex items-center justify-between text-destructive">
        <span>Deactivate your account</span>
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

/* ── Subscription ── */
function SubscriptionSettings({ user, onUpgrade, onManage, isLoadingCheckout, isLoadingPortal }: {
  user: any;
  onUpgrade: () => void;
  onManage: () => void;
  isLoadingCheckout: boolean;
  isLoadingPortal: boolean;
}) {
  const proFeatures = [
    "Edit your tweets anytime",
    "Blue verification checkmark",
    "Longer posts (up to 10,000 characters)",
    "100 tweets/hour (vs 20 for free)",
    "Priority in timeline algorithm",
    "Priority support",
  ];

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-1">Subscription</h2>
        <p className="text-muted-foreground text-sm">Manage your subscription and billing.</p>
      </div>

      <div className={cn("p-6 rounded-2xl border-2", user.isPro ? "border-primary bg-primary/5" : "border-border")}>
        <div className="flex items-center gap-3 mb-4">
          <div className={cn("w-12 h-12 rounded-full flex items-center justify-center", user.isPro ? "bg-primary" : "bg-secondary")}>
            {user.isPro ? <Sparkles className="w-6 h-6 text-primary-foreground" /> : <User className="w-6 h-6" />}
          </div>
          <div>
            <h3 className="text-xl font-bold">{user.isPro ? "Pro" : "Free"} Plan</h3>
            <p className="text-sm text-muted-foreground">
              {user.isPro ? "You have access to all premium features" : "Upgrade to unlock premium features"}
            </p>
          </div>
        </div>

        {user.isPro ? (
          <div className="space-y-3">
            <Button variant="outline" className="w-full rounded-full" onClick={onManage} disabled={isLoadingPortal}>
              {isLoadingPortal ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Loading...</> : "Manage subscription"}
            </Button>
            <p className="text-xs text-muted-foreground text-center">Manage billing, payment methods, or cancel</p>
          </div>
        ) : (
          <Button onClick={onUpgrade} disabled={isLoadingCheckout} className="w-full py-6 text-lg font-bold rounded-full bg-foreground text-background hover:bg-foreground/90">
            {isLoadingCheckout ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Loading...</> : "Upgrade to Pro — $8/month"}
          </Button>
        )}
      </div>

      <div className="space-y-3">
        <h3 className="font-semibold">Pro features include:</h3>
        <div className="grid gap-3">
          {proFeatures.map((feature, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className={cn("w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0", user.isPro ? "bg-primary" : "bg-muted")}>
                <Check className={cn("w-3 h-3", user.isPro ? "text-primary-foreground" : "text-muted-foreground")} />
              </div>
              <span className={cn(!user.isPro && "text-muted-foreground")}>{feature}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Notifications ── */
function NotificationSettings() {
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-1">Notifications</h2>
        <p className="text-muted-foreground text-sm">Choose what notifications you receive.</p>
      </div>
      <SettingsSection title="Push notifications">
        <ToggleRow label="Mentions and replies" defaultChecked />
        <ToggleRow label="Likes" defaultChecked />
        <ToggleRow label="Retweets" defaultChecked />
        <ToggleRow label="New followers" defaultChecked />
        <ToggleRow label="Direct messages" defaultChecked />
      </SettingsSection>
      <SettingsSection title="Email notifications">
        <ToggleRow label="Product updates and tips" defaultChecked={false} />
        <ToggleRow label="Things you missed" defaultChecked />
      </SettingsSection>
    </div>
  );
}

/* ── Privacy ── */
function PrivacySettings() {
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-1">Privacy & Safety</h2>
        <p className="text-muted-foreground text-sm">Manage what information you see and share.</p>
      </div>
      <SettingsSection title="Your tweets">
        <ToggleRow label="Protect your tweets" description="Only your followers can see your tweets" defaultChecked={false} />
      </SettingsSection>
      <SettingsSection title="Direct messages">
        <ToggleRow label="Allow message requests from everyone" defaultChecked />
        <ToggleRow label="Show read receipts" defaultChecked />
      </SettingsSection>
      <SettingsSection title="Content">
        <ToggleRow label="Display sensitive content" defaultChecked={false} />
      </SettingsSection>
    </div>
  );
}

/* ── Display ── */
function DisplaySettings() {
  const { theme, setTheme, reduceMotion, highContrast, setReduceMotion, setHighContrast } = useDisplayPreferences();

  const themes = [
    { id: 'dark', label: 'Dark', bg: 'bg-[hsl(216,28%,7%)]', ring: 'border-primary' },
    { id: 'dim', label: 'Dim', bg: 'bg-[hsl(212,35%,18%)]', ring: 'border-primary' },
    { id: 'light', label: 'Light', bg: 'bg-white', ring: 'border-primary' },
  ] as const;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-1">Display</h2>
        <p className="text-muted-foreground text-sm">Manage your theme and accessibility preferences.</p>
      </div>

      <SettingsSection title="Theme">
        <div className="flex gap-3 p-3">
          {themes.map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={cn(
                "flex-1 flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-colors",
                theme === t.id ? "border-primary" : "border-border hover:border-muted-foreground"
              )}
            >
              <div className={cn("w-8 h-8 rounded-full border border-border", t.bg)} />
              <span className="text-sm font-medium">{t.label}</span>
              {theme === t.id && <Check className="w-4 h-4 text-primary" />}
            </button>
          ))}
        </div>
      </SettingsSection>

      <SettingsSection title="Accessibility">
        <div className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/30">
          <div>
            <p className="font-medium">Reduce motion</p>
            <p className="text-sm text-muted-foreground">Disable animations and transitions</p>
          </div>
          <Switch
            checked={reduceMotion}
            onCheckedChange={setReduceMotion}
          />
        </div>
        <div className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/30">
          <div>
            <p className="font-medium">Increase color contrast</p>
            <p className="text-sm text-muted-foreground">Makes text and borders more visible</p>
          </div>
          <Switch
            checked={highContrast}
            onCheckedChange={setHighContrast}
          />
        </div>
      </SettingsSection>
    </div>
  );
}

/* ── Security ── */
function SecuritySettings({ email }: { email?: string }) {
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handlePasswordReset = async () => {
    if (!email) return;
    setIsSending(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setSent(true);
      toast.success("Password reset email sent! Check your inbox.");
    } catch (error: any) {
      toast.error(error.message || "Failed to send reset email");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-1">Security</h2>
        <p className="text-muted-foreground text-sm">Manage your account security settings.</p>
      </div>

      <div className="rounded-xl border border-border overflow-hidden">
        <div className="p-4 flex items-start justify-between gap-4">
          <div className="flex-1">
            <p className="font-medium">Password</p>
            <p className="text-sm text-muted-foreground mt-0.5">
              {email ? `Send a reset link to ${email}` : 'Change your account password'}
            </p>
            {sent && (
              <div className="flex items-center gap-1.5 mt-2 text-sm text-green-500">
                <CheckCircle2 className="w-4 h-4" />
                <span>Reset link sent — check your email</span>
              </div>
            )}
          </div>
          <Button
            variant="outline"
            className="rounded-full flex-shrink-0"
            onClick={handlePasswordReset}
            disabled={isSending || sent || !email}
          >
            {isSending ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Sending...</>
            ) : sent ? (
              <><Mail className="w-4 h-4 mr-2" />Sent</>
            ) : (
              'Send reset link'
            )}
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-border overflow-hidden divide-y divide-border">
        <button className="w-full text-left p-4 hover:bg-secondary/50 transition-colors flex items-center justify-between">
          <div>
            <p className="font-medium">Two-factor authentication</p>
            <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </button>
        <button className="w-full text-left p-4 hover:bg-secondary/50 transition-colors flex items-center justify-between">
          <div>
            <p className="font-medium">Connected apps</p>
            <p className="text-sm text-muted-foreground">Apps with access to your account</p>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
}

/* ── Shared helpers ── */
function SettingsRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50 transition-colors">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-medium text-sm">{value}</p>
    </div>
  );
}

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h3 className="font-semibold">{title}</h3>
      <div className="rounded-xl border border-border overflow-hidden">{children}</div>
    </div>
  );
}

function ToggleRow({ label, description, defaultChecked = false }: { label: string; description?: string; defaultChecked?: boolean }) {
  const [checked, setChecked] = useState(defaultChecked);
  return (
    <div className="flex items-center justify-between p-3 hover:bg-secondary/30">
      <div className="flex-1 min-w-0 pr-4">
        <p className="font-medium">{label}</p>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      <Switch checked={checked} onCheckedChange={setChecked} />
    </div>
  );
}
