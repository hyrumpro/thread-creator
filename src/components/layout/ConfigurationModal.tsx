import { X, Bell, Lock, Palette, Globe, Accessibility, Shield } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

interface ConfigurationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const settingsSections = [
  {
    icon: Bell,
    title: "Notifications",
    description: "Manage your notification preferences",
    items: [
      { label: "Push notifications", defaultChecked: true },
      { label: "Email notifications", defaultChecked: false },
      { label: "SMS notifications", defaultChecked: false },
    ],
  },
  {
    icon: Lock,
    title: "Privacy & Safety",
    description: "Control who can see your content",
    items: [
      { label: "Protect your tweets", defaultChecked: false },
      { label: "Hide sensitive content", defaultChecked: true },
      { label: "Allow message requests", defaultChecked: true },
    ],
  },
  {
    icon: Palette,
    title: "Display",
    description: "Customize how the app looks",
    items: [
      { label: "Dark mode", defaultChecked: true },
      { label: "Reduce motion", defaultChecked: false },
    ],
  },
  {
    icon: Accessibility,
    title: "Accessibility",
    description: "Make the app easier to use",
    items: [
      { label: "Increase contrast", defaultChecked: false },
      { label: "Add image descriptions", defaultChecked: true },
    ],
  },
];

export function ConfigurationModal({ open, onOpenChange }: ConfigurationModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-background border-border max-h-[85vh] overflow-y-auto">
        <DialogHeader className="sticky top-0 bg-background pb-4 z-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => onOpenChange(false)}
              className="rounded-full p-2 -m-2 hover:bg-secondary transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <DialogTitle className="text-xl font-bold">Configuration</DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {settingsSections.map((section, sectionIndex) => (
            <div key={sectionIndex}>
              <div className="flex items-center gap-3 mb-3">
                <section.icon className="w-5 h-5 text-muted-foreground" />
                <div>
                  <h3 className="font-semibold">{section.title}</h3>
                  <p className="text-sm text-muted-foreground">{section.description}</p>
                </div>
              </div>
              
              <div className="space-y-3 pl-8">
                {section.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="flex items-center justify-between">
                    <span className="text-sm">{item.label}</span>
                    <Switch defaultChecked={item.defaultChecked} />
                  </div>
                ))}
              </div>

              {sectionIndex < settingsSections.length - 1 && (
                <Separator className="mt-6" />
              )}
            </div>
          ))}

          {/* Data & Security Section */}
          <Separator />
          <div>
            <div className="flex items-center gap-3 mb-3">
              <Shield className="w-5 h-5 text-muted-foreground" />
              <div>
                <h3 className="font-semibold">Security</h3>
                <p className="text-sm text-muted-foreground">Protect your account</p>
              </div>
            </div>
            
            <div className="space-y-2 pl-8">
              <button className="text-sm text-primary hover:underline block">
                Change password
              </button>
              <button className="text-sm text-primary hover:underline block">
                Two-factor authentication
              </button>
              <button className="text-sm text-primary hover:underline block">
                Download your data
              </button>
              <button className="text-sm text-destructive hover:underline block">
                Deactivate account
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
