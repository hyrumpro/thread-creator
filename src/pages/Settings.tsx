import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { ArrowLeft, User, CreditCard, Bell, Lock, Palette, Shield, HelpCircle, Sparkles, Check, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useTweets } from "@/context/TweetContext";
import { cn } from "@/lib/utils";

type SettingsTab = "account" | "subscription" | "notifications" | "privacy" | "display" | "security";

const Settings = () => {
  const { currentUser, updateProfile } = useTweets();
  const [activeTab, setActiveTab] = useState<SettingsTab>("account");

  const tabs = [
    { id: "account" as const, label: "Your Account", icon: User },
    { id: "subscription" as const, label: "Subscription", icon: CreditCard },
    { id: "notifications" as const, label: "Notifications", icon: Bell },
    { id: "privacy" as const, label: "Privacy & Safety", icon: Lock },
    { id: "display" as const, label: "Display", icon: Palette },
    { id: "security" as const, label: "Security", icon: Shield },
  ];

  const handleUpgradeToPro = () => {
    updateProfile({ isPro: true, isVerified: true });
  };

  const handleCancelSubscription = () => {
    updateProfile({ isPro: false, isVerified: false });
  };

  return (
    <MainLayout>
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center gap-6 p-4">
          <Link to="/" className="p-2 -m-2 rounded-full hover:bg-secondary">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-bold">Settings</h1>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-65px)]">
        {/* Sidebar Navigation */}
        <nav className="w-64 border-r border-border p-2 flex-shrink-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors",
                  isActive ? "bg-secondary font-semibold" : "hover:bg-secondary/50"
                )}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.label}</span>
                <ChevronRight className="w-4 h-4 ml-auto text-muted-foreground" />
              </button>
            );
          })}
        </nav>

        {/* Content Area */}
        <div className="flex-1 p-6 overflow-y-auto">
          {activeTab === "account" && (
            <AccountSettings user={currentUser} />
          )}

          {activeTab === "subscription" && (
            <SubscriptionSettings 
              user={currentUser} 
              onUpgrade={handleUpgradeToPro}
              onCancel={handleCancelSubscription}
            />
          )}

          {activeTab === "notifications" && (
            <NotificationSettings />
          )}

          {activeTab === "privacy" && (
            <PrivacySettings />
          )}

          {activeTab === "display" && (
            <DisplaySettings />
          )}

          {activeTab === "security" && (
            <SecuritySettings />
          )}
        </div>
      </div>
    </MainLayout>
  );
};

function AccountSettings({ user }: { user: any }) {
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Your Account</h2>
        <p className="text-muted-foreground">
          See information about your account, download an archive of your data, or learn about your account deactivation options.
        </p>
      </div>

      <div className="space-y-4">
        <Link to="/profile" className="flex items-center gap-4 p-4 rounded-xl border border-border hover:bg-secondary/50 transition-colors">
          <img src={user.avatar} alt={user.displayName} className="w-12 h-12 rounded-full" />
          <div className="flex-1">
            <p className="font-semibold">{user.displayName}</p>
            <p className="text-sm text-muted-foreground">@{user.username}</p>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </Link>

        <div className="space-y-1">
          <SettingsRow 
            label="Username" 
            value={`@${user.username}`} 
            description="Change your username"
          />
          <SettingsRow 
            label="Email" 
            value="user@example.com" 
            description="Manage your email address"
          />
          <SettingsRow 
            label="Phone" 
            value="Add phone number" 
            description="Add a phone number for security"
          />
          <SettingsRow 
            label="Country" 
            value="United States" 
            description="Your account country"
          />
        </div>

        <Separator />

        <div className="space-y-3">
          <h3 className="font-semibold">Account data</h3>
          <button className="w-full text-left p-3 rounded-lg hover:bg-secondary/50 transition-colors flex items-center justify-between">
            <span>Download an archive of your data</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
          <button className="w-full text-left p-3 rounded-lg hover:bg-secondary/50 transition-colors flex items-center justify-between text-destructive">
            <span>Deactivate your account</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function SubscriptionSettings({ user, onUpgrade, onCancel }: { user: any; onUpgrade: () => void; onCancel: () => void }) {
  const proFeatures = [
    "Edit your tweets anytime",
    "Blue verification checkmark",
    "Longer posts (up to 4,000 characters)",
    "Undo tweet within 30 seconds",
    "Bookmark folders",
    "Custom app icons",
    "Reader mode",
    "Priority support",
  ];

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Subscription</h2>
        <p className="text-muted-foreground">
          Manage your subscription and billing preferences.
        </p>
      </div>

      {/* Current Plan */}
      <div className={cn(
        "p-6 rounded-2xl border-2",
        user.isPro ? "border-primary bg-primary/5" : "border-border"
      )}>
        <div className="flex items-center gap-3 mb-4">
          <div className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center",
            user.isPro ? "bg-primary" : "bg-secondary"
          )}>
            {user.isPro ? (
              <Sparkles className="w-6 h-6 text-primary-foreground" />
            ) : (
              <User className="w-6 h-6" />
            )}
          </div>
          <div>
            <h3 className="text-xl font-bold">{user.isPro ? "Pro" : "Free"} Plan</h3>
            <p className="text-sm text-muted-foreground">
              {user.isPro ? "You have access to all premium features" : "Upgrade to unlock premium features"}
            </p>
          </div>
        </div>

        {user.isPro && (
          <div className="flex items-center gap-2 mb-4">
            <svg viewBox="0 0 22 22" className="w-5 h-5 fill-primary">
              <path d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z" />
            </svg>
            <span className="text-sm font-medium">Verified account</span>
          </div>
        )}

        {user.isPro ? (
          <div className="space-y-3">
            <div className="flex items-baseline justify-between p-3 bg-secondary/50 rounded-lg">
              <span className="text-sm text-muted-foreground">Next billing date</span>
              <span className="font-semibold">March 5, 2026</span>
            </div>
            <div className="flex items-baseline justify-between p-3 bg-secondary/50 rounded-lg">
              <span className="text-sm text-muted-foreground">Monthly cost</span>
              <span className="font-semibold">$8.00</span>
            </div>
            <Button 
              variant="outline" 
              className="w-full rounded-full"
              onClick={onCancel}
            >
              Cancel subscription
            </Button>
          </div>
        ) : (
          <Button 
            onClick={onUpgrade}
            className="w-full py-6 text-lg font-bold rounded-full bg-foreground text-background hover:bg-foreground/90"
          >
            Upgrade to Pro — $8/month
          </Button>
        )}
      </div>

      {/* Pro Features List */}
      <div className="space-y-4">
        <h3 className="font-semibold">Pro features include:</h3>
        <div className="grid gap-3">
          {proFeatures.map((feature, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className={cn(
                "w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0",
                user.isPro ? "bg-primary" : "bg-muted"
              )}>
                <Check className={cn("w-3 h-3", user.isPro ? "text-primary-foreground" : "text-muted-foreground")} />
              </div>
              <span className={cn(!user.isPro && "text-muted-foreground")}>{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Billing History */}
      <div className="space-y-4">
        <h3 className="font-semibold">Billing history</h3>
        <div className="border border-border rounded-xl overflow-hidden">
          {user.isPro ? (
            <>
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div>
                  <p className="font-medium">Feb 5, 2026</p>
                  <p className="text-sm text-muted-foreground">Pro subscription</p>
                </div>
                <span className="font-semibold">$8.00</span>
              </div>
              <div className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium">Jan 5, 2026</p>
                  <p className="text-sm text-muted-foreground">Pro subscription</p>
                </div>
                <span className="font-semibold">$8.00</span>
              </div>
            </>
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              No billing history
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function NotificationSettings() {
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Notifications</h2>
        <p className="text-muted-foreground">
          Select the kinds of notifications you get about your activities and recommendations.
        </p>
      </div>

      <div className="space-y-6">
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
          <ToggleRow label="News about X Pro" defaultChecked={false} />
        </SettingsSection>
      </div>
    </div>
  );
}

function PrivacySettings() {
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Privacy & Safety</h2>
        <p className="text-muted-foreground">
          Manage what information you see and share.
        </p>
      </div>

      <div className="space-y-6">
        <SettingsSection title="Your tweets">
          <ToggleRow label="Protect your tweets" description="Only your followers can see your tweets" defaultChecked={false} />
        </SettingsSection>

        <SettingsSection title="Direct messages">
          <ToggleRow label="Allow message requests from everyone" defaultChecked />
          <ToggleRow label="Show read receipts" defaultChecked />
        </SettingsSection>

        <SettingsSection title="Content you see">
          <ToggleRow label="Display media that may contain sensitive content" defaultChecked={false} />
          <ToggleRow label="Remove blocked and muted accounts" defaultChecked />
        </SettingsSection>
      </div>
    </div>
  );
}

function DisplaySettings() {
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Display</h2>
        <p className="text-muted-foreground">
          Manage your font size, color, and background.
        </p>
      </div>

      <div className="space-y-6">
        <SettingsSection title="Accessibility">
          <ToggleRow label="Reduce motion" description="Reduce animations and movement" defaultChecked={false} />
          <ToggleRow label="Increase color contrast" defaultChecked={false} />
        </SettingsSection>

        <SettingsSection title="Theme">
          <div className="flex gap-4 p-3">
            <button className="flex-1 p-4 rounded-xl border-2 border-primary bg-background text-center">
              <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-foreground" />
              <span className="text-sm font-medium">Dark</span>
            </button>
            <button className="flex-1 p-4 rounded-xl border-2 border-border bg-[#15202b] text-center opacity-50">
              <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-white" />
              <span className="text-sm font-medium">Dim</span>
            </button>
            <button className="flex-1 p-4 rounded-xl border-2 border-border bg-white text-center opacity-50">
              <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-black" />
              <span className="text-sm font-medium text-black">Light</span>
            </button>
          </div>
        </SettingsSection>
      </div>
    </div>
  );
}

function SecuritySettings() {
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Security</h2>
        <p className="text-muted-foreground">
          Manage your account's security settings.
        </p>
      </div>

      <div className="space-y-4">
        <button className="w-full text-left p-4 rounded-xl border border-border hover:bg-secondary/50 transition-colors flex items-center justify-between">
          <div>
            <p className="font-medium">Password</p>
            <p className="text-sm text-muted-foreground">Change your password</p>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </button>

        <button className="w-full text-left p-4 rounded-xl border border-border hover:bg-secondary/50 transition-colors flex items-center justify-between">
          <div>
            <p className="font-medium">Two-factor authentication</p>
            <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </button>

        <button className="w-full text-left p-4 rounded-xl border border-border hover:bg-secondary/50 transition-colors flex items-center justify-between">
          <div>
            <p className="font-medium">Apps and sessions</p>
            <p className="text-sm text-muted-foreground">See apps connected to your account</p>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </button>

        <button className="w-full text-left p-4 rounded-xl border border-border hover:bg-secondary/50 transition-colors flex items-center justify-between">
          <div>
            <p className="font-medium">Login history</p>
            <p className="text-sm text-muted-foreground">See when your account was accessed</p>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
}

// Reusable components
function SettingsRow({ label, value, description }: { label: string; value: string; description?: string }) {
  return (
    <button className="w-full text-left p-3 rounded-lg hover:bg-secondary/50 transition-colors flex items-center justify-between">
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="font-medium">{value}</p>
      </div>
      <ChevronRight className="w-4 h-4 text-muted-foreground" />
    </button>
  );
}

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-lg">{title}</h3>
      <div className="space-y-1">
        {children}
      </div>
    </div>
  );
}

function ToggleRow({ label, description, defaultChecked = false }: { label: string; description?: string; defaultChecked?: boolean }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/30">
      <div className="flex-1">
        <p className="font-medium">{label}</p>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      <Switch defaultChecked={defaultChecked} />
    </div>
  );
}

export default Settings;
