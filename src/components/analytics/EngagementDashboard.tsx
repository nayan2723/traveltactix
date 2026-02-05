import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAnalyticsData } from '@/hooks/useAnalytics';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import { 
  Activity, Clock, Eye, MousePointerClick, TrendingUp, 
  Calendar, Zap, Target 
} from 'lucide-react';
import { motion } from 'framer-motion';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: number;
  description?: string;
}

const StatCard = ({ title, value, icon, trend, description }: StatCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {description && (
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
            )}
          </div>
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            {icon}
          </div>
        </div>
        {trend !== undefined && (
          <div className="mt-3 flex items-center gap-1">
            <TrendingUp className={`h-4 w-4 ${trend >= 0 ? 'text-success' : 'text-destructive rotate-180'}`} />
            <span className={`text-sm font-medium ${trend >= 0 ? 'text-success' : 'text-destructive'}`}>
              {trend >= 0 ? '+' : ''}{trend}%
            </span>
            <span className="text-xs text-muted-foreground">vs last period</span>
          </div>
        )}
      </CardContent>
    </Card>
  </motion.div>
);

const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--secondary))', 'hsl(var(--muted))'];

export const EngagementDashboard = () => {
  const { fetchUserStats } = useAnalyticsData();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{
    events: any[];
    sessions: any[];
  } | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      const data = await fetchUserStats();
      setStats(data);
      setLoading(false);
    };
    loadStats();
  }, [fetchUserStats]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Calculate stats
  const totalPageViews = stats?.events.filter(e => e.event_type === 'page_view').length || 0;
  const totalSessions = stats?.sessions.length || 0;
  const avgSessionDuration = stats?.sessions.reduce((acc, s) => acc + (s.duration_seconds || 0), 0) / totalSessions || 0;
  const totalFeatureUsage = stats?.events.filter(e => e.event_type === 'feature_usage').length || 0;

  // Group events by type for pie chart
  const eventsByType = stats?.events.reduce((acc: Record<string, number>, event) => {
    acc[event.event_type] = (acc[event.event_type] || 0) + 1;
    return acc;
  }, {}) || {};

  const pieData = Object.entries(eventsByType).map(([name, value]) => ({ name, value }));

  // Group events by day for line chart
  const eventsByDay = stats?.events.reduce((acc: Record<string, number>, event) => {
    const day = new Date(event.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    acc[day] = (acc[day] || 0) + 1;
    return acc;
  }, {}) || {};

  const lineData = Object.entries(eventsByDay)
    .map(([date, count]) => ({ date, count: count as number }))
    .slice(-14); // Last 14 days

  // Group by page for bar chart
  const eventsByPage = stats?.events
    .filter(e => e.event_type === 'page_view')
    .reduce((acc: Record<string, number>, event) => {
      const page = event.page_path || '/';
      acc[page] = (acc[page] || 0) + 1;
      return acc;
    }, {}) || {};

  const barData = Object.entries(eventsByPage)
    .map(([page, views]) => ({ page: page.replace('/', '') || 'home', views }))
    .sort((a, b) => (b.views as number) - (a.views as number))
    .slice(0, 8);

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    return `${Math.round(seconds / 60)}m`;
  };

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Page Views"
          value={totalPageViews}
          icon={<Eye className="h-5 w-5" />}
          trend={12}
          description="Last 30 days"
        />
        <StatCard
          title="Sessions"
          value={totalSessions}
          icon={<Activity className="h-5 w-5" />}
          trend={8}
          description="Unique visits"
        />
        <StatCard
          title="Avg. Session Duration"
          value={formatDuration(avgSessionDuration)}
          icon={<Clock className="h-5 w-5" />}
          trend={-3}
          description="Time spent"
        />
        <StatCard
          title="Feature Interactions"
          value={totalFeatureUsage}
          icon={<MousePointerClick className="h-5 w-5" />}
          trend={15}
          description="Clicks & actions"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Over Time */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="h-5 w-5 text-primary" />
                Activity Over Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={lineData}>
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
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Event Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Zap className="h-5 w-5 text-primary" />
                Event Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Top Pages */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="h-5 w-5 text-primary" />
              Most Visited Pages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" className="text-xs" />
                <YAxis type="category" dataKey="page" className="text-xs" width={100} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="views" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
