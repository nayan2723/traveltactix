import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import { BeamsBackground } from "@/components/BeamsBackground";

import { ProtectedRoute } from "./components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Missions from "./pages/Missions";
import MissionTracker from "./pages/MissionTracker";
import CulturalFeed from "./pages/CulturalFeed";
import CulturalLessons from "./pages/CulturalLessons";
import ARScan from "./pages/ARScan";
import Discovery from "./pages/Discovery";
import PlaceDetail from "./pages/PlaceDetail";
import Favorites from "./pages/Favorites";
import CrowdMonitor from "./pages/CrowdMonitor";
import Profile from "./pages/Profile";
import Leaderboard from "./pages/Leaderboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    
      <TooltipProvider>
        {/* Beams background temporarily disabled while we fix R3F crash */}
        {/* <BeamsBackground /> */}
        <Toaster />
        <Sonner />
        <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/missions" element={<ProtectedRoute><Missions /></ProtectedRoute>} />
          <Route path="/missions/:id" element={<ProtectedRoute><MissionTracker /></ProtectedRoute>} />
        <Route path="/cultural-feed" element={<ProtectedRoute><CulturalFeed /></ProtectedRoute>} />
        <Route path="/cultural-lessons" element={<ProtectedRoute><CulturalLessons /></ProtectedRoute>} />
        <Route path="/ar-scan" element={<ProtectedRoute><ARScan /></ProtectedRoute>} />
        <Route path="/discovery" element={<Discovery />} />
        <Route path="/places/:id" element={<PlaceDetail />} />
        <Route path="/favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
        <Route path="/crowd-monitor" element={<CrowdMonitor />} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/leaderboard" element={<Leaderboard />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        </BrowserRouter>
      </TooltipProvider>
    
  </QueryClientProvider>
);

export default App;
