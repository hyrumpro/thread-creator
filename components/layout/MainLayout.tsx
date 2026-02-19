import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { RightSidebar } from "./RightSidebar";
import { MobileNav } from "./MobileNav";

interface MainLayoutProps {
  children: ReactNode;
  showRightSidebar?: boolean;
}

export function MainLayout({ children, showRightSidebar = true }: MainLayoutProps) {
  return (
    <div className="min-h-screen flex justify-center bg-background">
      {/* Left Sidebar - Desktop & Tablet */}
      <Sidebar />

      {/* Main Content */}
      <main className="w-full md:ml-20 lg:ml-[275px] md:mr-0 lg:mr-[350px] max-w-[600px] min-h-screen md:border-x border-border pb-16 md:pb-0">
        {children}
      </main>

      {/* Right Sidebar - Desktop only */}
      {showRightSidebar && (
        <div className="hidden lg:block">
          <RightSidebar />
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <MobileNav />
    </div>
  );
}
