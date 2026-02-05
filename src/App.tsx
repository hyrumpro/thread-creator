import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TweetProvider } from "@/context/TweetContext";
import Index from "./pages/Index";
import Profile from "./pages/Profile";
import Bookmarks from "./pages/Bookmarks";
import Hashtag from "./pages/Hashtag";
import Explore from "./pages/Explore";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <TweetProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/:username" element={<Profile />} />
            <Route path="/bookmarks" element={<Bookmarks />} />
            <Route path="/hashtag/:tag" element={<Hashtag />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/notifications" element={<Index />} />
            <Route path="/messages" element={<Index />} />
            <Route path="/more" element={<Index />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TweetProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
