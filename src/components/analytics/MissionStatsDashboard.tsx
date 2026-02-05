import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadialBarChart, RadialBar, Legend
} from 'recharts';
import { 
  Trophy, Target, Star, Zap, Medal, TrendingUp, 
  CheckCircle, Clock, Flame 
} from 'lucide-react';
import { motion } from 'framer-motion';

interface MissionStats {
  totalMissions: number;
  completedMissions: number;
  inProgressMissions: number;
  totalXpEarned: number;
  currentStreak: number;
  badgesEarned: number;
  leaderboardRank: number;
  missionsByCategory: { category: string; count: number }[];
  missionsByDifficulty: { difficulty: string; completed: number; total: number }[];
}

const StatCard = ({ 
  title, 
  value, 
  icon, 
  color = 'primary',
  subtitle 
}: { 
  title: string; 
  value: string | number; 
  icon: React.ReactNode; 
  color?: string;
  subtitle?: string;
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.3 }}
  >
    <Card className="hover:shadow-lg transition-all hover:-translate-y-1">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl bg-${color}/10`}>
            {icon}
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

export const MissionStatsDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<MissionStats | null>(null);

  useEffect(() => {
    const fetchMissionStats = async () => {
      if (!user) return;
      setLoading(true);

      try {
        // Fetch user missions
        const { data: userMissions } = await supabase
          .from('user_missions')
          .select('*, mission:missions(*)')
          .eq('user_id', user.id);

        // Fetch user profile for XP and badges
        const { data: profile } = await supabase
          .from('profiles')
          .select('total_xp, level, is_admin')
          .eq('user_id', user.id)
          .single();

        // Fetch leaderboard position
        const { data: leaderboard } = await supabase
          .from('profiles')
          .select('user_id, total_xp')
          .order('total_xp', { ascending: false });

        const rank = leaderboard?.findIndex(p => p.user_id === user.id) ?? -1;

        // Calculate stats
        const completed = userMissions?.filter(m => m.is_completed) || [];
        const inProgress = userMissions?.filter(m => !m.is_completed) || [];

        // Group by category
        const categoryMap: Record<string, number> = {};
        userMissions?.forEach(um => {
          const cat = (um.mission as any)?.category || 'Other';
          categoryMap[cat] = (categoryMap[cat] || 0) + 1;
        });

        // Group by difficulty
        const difficultyMap: Record<string, { completed: number; total: number }> = {};
        userMissions?.forEach(um => {
          const diff = (um.mission as any)?.difficulty || 'Medium';
          if (!difficultyMap[diff]) difficultyMap[diff] = { completed: 0, total: 0 };
          difficultyMap[diff].total += 1;
          if (um.is_completed) difficultyMap[diff].completed += 1;
        });

        setStats({
          totalMissions: userMissions?.length || 0,
          completedMissions: completed.length,
          inProgressMissions: inProgress.length,
          totalXpEarned: (profile as any)?.total_xp || 0,
          currentStreak: Math.floor(Math.random() * 7) + 1, // Placeholder
          badgesEarned: 0, // Placeholder - badges column doesn't exist yet
          leaderboardRank: rank + 1,
          missionsByCategory: Object.entries(categoryMap).map(([category, count]) => ({ category, count })),
          missionsByDifficulty: Object.entries(difficultyMap).map(([difficulty, data]) => ({ 
            difficulty, 
            ...data 
          })),
        });
      } catch (error) {
        console.error('Error fetching mission stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMissionStats();
  }, [user]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-12 w-12 rounded-xl mb-3" />
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const completionRate = stats?.totalMissions 
    ? Math.round((stats.completedMissions / stats.totalMissions) * 100) 
    : 0;

  const radialData = [
    { name: 'Completion', value: completionRate, fill: 'hsl(var(--primary))' },
  ];

  return (
    <div className="space-y-6">
      {/* Primary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total XP Earned"
          value={stats?.totalXpEarned?.toLocaleString() || 0}
          icon={<Zap className="h-6 w-6 text-warning" />}
          color="warning"
          subtitle="Keep exploring!"
        />
        <StatCard
          title="Missions Completed"
          value={`${stats?.completedMissions || 0}/${stats?.totalMissions || 0}`}
          icon={<CheckCircle className="h-6 w-6 text-success" />}
          color="success"
          subtitle={`${completionRate}% completion rate`}
        />
        <StatCard
          title="Current Streak"
          value={`${stats?.currentStreak || 0} days`}
          icon={<Flame className="h-6 w-6 text-destructive" />}
          color="destructive"
          subtitle="Stay consistent!"
        />
        <StatCard
          title="Leaderboard Rank"
          value={stats?.leaderboardRank ? `#${stats.leaderboardRank}` : 'N/A'}
          icon={<Trophy className="h-6 w-6 text-primary" />}
          color="primary"
          subtitle="Global ranking"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Badges Earned"
          value={stats?.badgesEarned || 0}
          icon={<Medal className="h-6 w-6 text-accent" />}
          color="accent"
        />
        <StatCard
          title="In Progress"
          value={stats?.inProgressMissions || 0}
          icon={<Clock className="h-6 w-6 text-muted-foreground" />}
        />
        <StatCard
          title="Categories Explored"
          value={stats?.missionsByCategory.length || 0}
          icon={<Target className="h-6 w-6 text-secondary-foreground" />}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Completion Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="h-5 w-5 text-primary" />
                Overall Completion
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={200}>
                <RadialBarChart 
                  cx="50%" 
                  cy="50%" 
                  innerRadius="60%" 
                  outerRadius="100%" 
                  data={radialData}
                  startAngle={180}
                  endAngle={0}
                >
                  <RadialBar
                    background
                    dataKey="value"
                    cornerRadius={10}
                  />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute text-center">
                <p className="text-3xl font-bold">{completionRate}%</p>
                <p className="text-sm text-muted-foreground">Complete</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Missions by Category */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Star className="h-5 w-5 text-primary" />
                Missions by Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={stats?.missionsByCategory || []}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="category" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Difficulty Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="h-5 w-5 text-primary" />
              Progress by Difficulty
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats?.missionsByDifficulty.map((item) => {
              const percent = item.total > 0 ? Math.round((item.completed / item.total) * 100) : 0;
              return (
                <div key={item.difficulty} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        item.difficulty === 'Easy' ? 'secondary' :
                        item.difficulty === 'Medium' ? 'default' : 'destructive'
                      }>
                        {item.difficulty}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {item.completed}/{item.total} completed
                      </span>
                    </div>
                    <span className="text-sm font-medium">{percent}%</span>
                  </div>
                  <Progress value={percent} className="h-2" />
                </div>
              );
            })}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
