import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { RightSidebar } from "./RightSidebar";

interface MainLayoutProps {
  children: ReactNode;
  showRightSidebar?: boolean;
}

export function MainLayout({ children, showRightSidebar = true }: MainLayoutProps) {
  return (
    <div className="min-h-screen flex justify-center">
      {/* Left Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="ml-[275px] mr-[350px] w-full max-w-[600px] min-h-screen border-x border-border">
        {children}
      </main>

      {/* Right Sidebar */}
      {showRightSidebar && <RightSidebar />}
    </div>
  );
}
