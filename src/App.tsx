import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import { BeamsBackground } from "@/components/BeamsBackground";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Missions from "./pages/Missions";
import CulturalFeed from "./pages/CulturalFeed";
import CulturalLessons from "./pages/CulturalLessons";
import ARScan from "./pages/ARScan";
import Discovery from "./pages/Discovery";
import PlaceDetail from "./pages/PlaceDetail";
import Favorites from "./pages/Favorites";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        {/* Beams background temporarily disabled while we fix R3F crash */}
        {/* <BeamsBackground /> */}
        <div className="fixed top-4 right-4 z-50">
          <ThemeToggle />
        </div>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/missions" element={<Missions />} />
          <Route path="/cultural-feed" element={<CulturalFeed />} />
          <Route path="/cultural-lessons" element={<CulturalLessons />} />
          <Route path="/ar-scan" element={<ARScan />} />
          <Route path="/discovery" element={<Discovery />} />
          <Route path="/places/:id" element={<PlaceDetail />} />
          <Route path="/favorites" element={<Favorites />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
