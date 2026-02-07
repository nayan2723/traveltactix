import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { BeamsBackground } from "@/components/BeamsBackground";
import { QuickStatsWidget } from "@/components/QuickStatsWidget";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { useNotificationTriggers } from "@/hooks/useNotificationTriggers";
import { AuthProvider } from "@/contexts/AuthContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { SuspenseFallback, ARFallback } from "@/components/SuspenseFallback";
import { SkipLink } from "@/components/accessibility/AccessibilityHelpers";

import { ProtectedRoute } from "./components/ProtectedRoute";

// Eagerly load critical pages
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

// Lazy load all other pages for code splitting
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Missions = lazy(() => import("./pages/Missions"));
const MissionTracker = lazy(() => import("./pages/MissionTracker"));
const CulturalFeed = lazy(() => import("./pages/CulturalFeed"));
const CulturalLessons = lazy(() => import("./pages/CulturalLessons"));
const ARScan = lazy(() => import("./pages/ARScan"));
const Discovery = lazy(() => import("./pages/Discovery"));
const PlaceDetail = lazy(() => import("./pages/PlaceDetail"));
const Favorites = lazy(() => import("./pages/Favorites"));
const CrowdMonitor = lazy(() => import("./pages/CrowdMonitor"));
const Profile = lazy(() => import("./pages/Profile"));
const Leaderboard = lazy(() => import("./pages/Leaderboard"));
const Shop = lazy(() => import("./pages/Shop"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const PhotoGallery = lazy(() => import("./pages/PhotoGallery"));
const TravelResume = lazy(() => import("./pages/TravelResume"));
const Analytics = lazy(() => import("./pages/Analytics"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

// Component to initialize notification triggers within AuthProvider context
const NotificationInitializer = ({ children }: { children: React.ReactNode }) => {
  useNotificationTriggers();
  return <>{children}</>;
};

// Wrapper for lazy-loaded pages with suspense
const LazyPage = ({ 
  children, 
  fallback = <SuspenseFallback /> 
}: { 
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) => (
  <ErrorBoundary>
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  </ErrorBoundary>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ErrorBoundary>
        <SkipLink />
        <BeamsBackground />
        <Toaster />
        <Sonner />
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <AuthProvider>
            <NotificationInitializer>
              <main id="main-content" className="relative z-10">
                <QuickStatsWidget />
                <OfflineIndicator />
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <LazyPage>
                          <Dashboard />
                        </LazyPage>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/missions"
                    element={
                      <ProtectedRoute>
                        <LazyPage>
                          <Missions />
                        </LazyPage>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/missions/:id"
                    element={
                      <ProtectedRoute>
                        <LazyPage>
                          <MissionTracker />
                        </LazyPage>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/cultural-feed"
                    element={
                      <ProtectedRoute>
                        <LazyPage>
                          <CulturalFeed />
                        </LazyPage>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/cultural-lessons"
                    element={
                      <ProtectedRoute>
                        <LazyPage>
                          <CulturalLessons />
                        </LazyPage>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/ar-scan"
                    element={
                      <ProtectedRoute>
                        <LazyPage fallback={<ARFallback />}>
                          <ARScan />
                        </LazyPage>
                      </ProtectedRoute>
                    }
                  />
                  <Route 
                    path="/discovery" 
                    element={
                      <LazyPage>
                        <Discovery />
                      </LazyPage>
                    } 
                  />
                  <Route 
                    path="/places/:id" 
                    element={
                      <LazyPage>
                        <PlaceDetail />
                      </LazyPage>
                    } 
                  />
                  <Route
                    path="/favorites"
                    element={
                      <ProtectedRoute>
                        <LazyPage>
                          <Favorites />
                        </LazyPage>
                      </ProtectedRoute>
                    }
                  />
                  <Route 
                    path="/crowd-monitor" 
                    element={
                      <LazyPage>
                        <CrowdMonitor />
                      </LazyPage>
                    } 
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <LazyPage>
                          <Profile />
                        </LazyPage>
                      </ProtectedRoute>
                    }
                  />
                  <Route 
                    path="/leaderboard" 
                    element={
                      <LazyPage>
                        <Leaderboard />
                      </LazyPage>
                    } 
                  />
                  <Route
                    path="/shop"
                    element={
                      <ProtectedRoute>
                        <LazyPage>
                          <Shop />
                        </LazyPage>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/product/:handle"
                    element={
                      <ProtectedRoute>
                        <LazyPage>
                          <ProductDetail />
                        </LazyPage>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/gallery"
                    element={
                      <ProtectedRoute>
                        <LazyPage>
                          <PhotoGallery />
                        </LazyPage>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/travel-resume"
                    element={
                      <ProtectedRoute>
                        <LazyPage>
                          <TravelResume />
                        </LazyPage>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/resume"
                    element={
                      <ProtectedRoute>
                        <LazyPage>
                          <TravelResume />
                        </LazyPage>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/analytics"
                    element={
                      <ProtectedRoute>
                        <LazyPage>
                          <Analytics />
                        </LazyPage>
                      </ProtectedRoute>
                    }
                  />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
            </NotificationInitializer>
          </AuthProvider>
        </BrowserRouter>
      </ErrorBoundary>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
