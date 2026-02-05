import { useState } from 'react';
import { MainNav } from '@/components/MainNav';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EngagementDashboard } from '@/components/analytics/EngagementDashboard';
import { MissionStatsDashboard } from '@/components/analytics/MissionStatsDashboard';
import { AdminAnalyticsDashboard } from '@/components/analytics/AdminAnalyticsDashboard';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { motion } from 'framer-motion';
import { 
  BarChart3, Trophy, Shield, Activity 
} from 'lucide-react';

const Analytics = () => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const [activeTab, setActiveTab] = useState('engagement');

  return (
    <div className="min-h-screen bg-background">
      <MainNav />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-primary/10">
                <Activity className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
            </div>
            <p className="text-muted-foreground">
              Track your journey, monitor progress, and discover insights
            </p>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="engagement" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Engagement</span>
              </TabsTrigger>
              <TabsTrigger value="missions" className="flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                <span className="hidden sm:inline">Missions</span>
              </TabsTrigger>
              {profile?.is_admin && (
                <TabsTrigger value="admin" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <span className="hidden sm:inline">Admin</span>
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="engagement" className="space-y-6">
              <EngagementDashboard />
            </TabsContent>

            <TabsContent value="missions" className="space-y-6">
              <MissionStatsDashboard />
            </TabsContent>

            {profile?.is_admin && (
              <TabsContent value="admin" className="space-y-6">
                <AdminAnalyticsDashboard />
              </TabsContent>
            )}
          </Tabs>
        </motion.div>
      </main>
    </div>
  );
};

export default Analytics;
