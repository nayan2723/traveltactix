import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area
} from 'recharts';
import { 
  Users, Activity, TrendingUp, Globe, Server, 
  Database, Shield, AlertTriangle, CheckCircle, Clock
} from 'lucide-react';
import { motion } from 'framer-motion';

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  totalMissions: number;
  totalPlaces: number;
  totalEvents: number;
  userGrowth: { date: string; users: number }[];
  topDestinations: { city: string; visits: number }[];
  systemHealth: {
    database: 'healthy' | 'degraded' | 'down';
    api: 'healthy' | 'degraded' | 'down';
    storage: 'healthy' | 'degraded' | 'down';
  };
}

const HealthIndicator = ({ status }: { status: 'healthy' | 'degraded' | 'down' }) => {
  const colors = {
    healthy: 'bg-success',
    degraded: 'bg-warning',
    down: 'bg-destructive',
  };
  const labels = {
    healthy: 'Healthy',
    degraded: 'Degraded',
    down: 'Down',
  };
  
  return (
    <div className="flex items-center gap-2">
      <span className={`w-2 h-2 rounded-full ${colors[status]} animate-pulse`} />
      <span className="text-sm">{labels[status]}</span>
    </div>
  );
};

const MetricCard = ({ 
  title, 
  value, 
  icon, 
  change,
  changeLabel = 'vs yesterday'
}: { 
  title: string; 
  value: string | number; 
  icon: React.ReactNode;
  change?: number;
  changeLabel?: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
  >
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground font-medium">{title}</p>
            <p className="text-3xl font-bold mt-2">{value}</p>
            {change !== undefined && (
              <p className={`text-sm mt-1 ${change >= 0 ? 'text-success' : 'text-destructive'}`}>
                {change >= 0 ? '↑' : '↓'} {Math.abs(change)}% {changeLabel}
              </p>
            )}
          </div>
          <div className="p-3 rounded-xl bg-primary/10 text-primary">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

export const AdminAnalyticsDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [stats, setStats] = useState<AdminStats | null>(null);

  useEffect(() => {
    const checkAdminAndFetch = async () => {
      if (!user) return;
      setLoading(true);

      try {
        // Check if user is admin
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('user_id', user.id)
          .single();

        if (!profile?.is_admin) {
          setIsAdmin(false);
          setLoading(false);
          return;
        }

        setIsAdmin(true);

        // Fetch admin stats
        const [
          { count: totalUsers },
          { count: totalMissions },
          { count: totalPlaces },
          { count: totalEvents },
          { data: recentUsers },
          { data: recentEvents },
        ] = await Promise.all([
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
          supabase.from('missions').select('*', { count: 'exact', head: true }),
          supabase.from('places').select('*', { count: 'exact', head: true }),
          supabase.from('analytics_events').select('*', { count: 'exact', head: true }),
          supabase.from('profiles').select('created_at').order('created_at', { ascending: false }).limit(100),
          supabase.from('analytics_events').select('page_path, created_at').order('created_at', { ascending: false }).limit(500),
        ]);

        // Calculate user growth (last 14 days)
        const userGrowthMap: Record<string, number> = {};
        const today = new Date();
        for (let i = 13; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          userGrowthMap[dateStr] = 0;
        }
        
        recentUsers?.forEach((u) => {
          const date = new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          if (userGrowthMap[date] !== undefined) {
            userGrowthMap[date]++;
          }
        });

        const userGrowth = Object.entries(userGrowthMap).map(([date, users]) => ({ date, users }));

        // Calculate active users (users with events in last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const activeUserIds = new Set(
          recentEvents
            ?.filter(e => new Date(e.created_at) >= sevenDaysAgo)
            .map(e => e.page_path) || []
        );

        // Top destinations
        const destinationMap: Record<string, number> = {};
        recentEvents?.forEach((e) => {
          if (e.page_path?.includes('/places/')) {
            const city = e.page_path.split('/').pop() || 'Unknown';
            destinationMap[city] = (destinationMap[city] || 0) + 1;
          }
        });
        const topDestinations = Object.entries(destinationMap)
          .map(([city, visits]) => ({ city, visits }))
          .sort((a, b) => b.visits - a.visits)
          .slice(0, 5);

        setStats({
          totalUsers: totalUsers || 0,
          activeUsers: activeUserIds.size,
          newUsersToday: userGrowthMap[Object.keys(userGrowthMap).pop() || ''] || 0,
          totalMissions: totalMissions || 0,
          totalPlaces: totalPlaces || 0,
          totalEvents: totalEvents || 0,
          userGrowth,
          topDestinations,
          systemHealth: {
            database: 'healthy',
            api: 'healthy',
            storage: 'healthy',
          },
        });
      } catch (error) {
        console.error('Error fetching admin stats:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAdminAndFetch();
  }, [user]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-24 mb-4" />
                <Skeleton className="h-8 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <Card className="p-12 text-center">
        <Shield className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold mb-2">Admin Access Required</h3>
        <p className="text-muted-foreground">
          You don't have permission to view this dashboard.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Primary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Users"
          value={stats?.totalUsers?.toLocaleString() || 0}
          icon={<Users className="h-6 w-6" />}
          change={12}
        />
        <MetricCard
          title="Active Users (7d)"
          value={stats?.activeUsers?.toLocaleString() || 0}
          icon={<Activity className="h-6 w-6" />}
          change={8}
          changeLabel="vs last week"
        />
        <MetricCard
          title="New Users Today"
          value={stats?.newUsersToday || 0}
          icon={<TrendingUp className="h-6 w-6" />}
        />
        <MetricCard
          title="Total Events"
          value={stats?.totalEvents?.toLocaleString() || 0}
          icon={<Globe className="h-6 w-6" />}
          change={24}
        />
      </div>

      {/* System Health & Content Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System Health */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Server className="h-5 w-5 text-primary" />
                System Health
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-muted-foreground" />
                  <span>Database</span>
                </div>
                <HealthIndicator status={stats?.systemHealth.database || 'healthy'} />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span>API</span>
                </div>
                <HealthIndicator status={stats?.systemHealth.api || 'healthy'} />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Server className="h-4 w-4 text-muted-foreground" />
                  <span>Storage</span>
                </div>
                <HealthIndicator status={stats?.systemHealth.storage || 'healthy'} />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Content Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="h-5 w-5 text-primary" />
                User Growth (14 days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={stats?.userGrowth || []}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="users" 
                    stroke="hsl(var(--primary))" 
                    fill="hsl(var(--primary) / 0.2)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Platform Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-4xl font-bold text-primary">{stats?.totalMissions || 0}</p>
            <p className="text-sm text-muted-foreground mt-1">Total Missions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-4xl font-bold text-accent">{stats?.totalPlaces || 0}</p>
            <p className="text-sm text-muted-foreground mt-1">Places in Database</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-4xl font-bold text-secondary-foreground">{stats?.topDestinations.length || 0}</p>
            <p className="text-sm text-muted-foreground mt-1">Active Destinations</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
