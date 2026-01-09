import { useState, useEffect, useMemo } from "react";
import { MainNav } from "@/components/MainNav";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, Medal, Award, Star, Filter } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface LeaderboardEntry {
  id: string;
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  total_xp: number;
  level: number;
  rank: number;
}

const Leaderboard = () => {
  const { user } = useAuth();
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRank, setUserRank] = useState<LeaderboardEntry | null>(null);
  const [filterBy, setFilterBy] = useState<'all' | 'level' | 'xp'>('all');
  const [timeRange, setTimeRange] = useState<'all-time' | 'monthly' | 'weekly'>('all-time');

  useEffect(() => {
    fetchLeaderboard();
  }, [user]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    
    // Fetch top 100 from leaderboard view
    const { data, error } = await supabase
      .from('leaderboard')
      .select('*')
      .limit(100);

    if (error) {
      console.error('Error fetching leaderboard:', error);
      setLoading(false);
      return;
    }

    setLeaders(data || []);

    // Find current user's rank
    if (user && data) {
      const currentUser = data.find(entry => entry.user_id === user.id);
      setUserRank(currentUser || null);
    }

    setLoading(false);
  };

  // Apply filtering and sorting based on selected options
  const filteredLeaders = useMemo(() => {
    let result = [...leaders];

    // Apply sorting based on filterBy
    switch (filterBy) {
      case 'level':
        result.sort((a, b) => {
          // Primary sort by level (descending), secondary by XP
          if (b.level !== a.level) return b.level - a.level;
          return b.total_xp - a.total_xp;
        });
        break;
      case 'xp':
        result.sort((a, b) => b.total_xp - a.total_xp);
        break;
      case 'all':
      default:
        // Keep original rank order from database
        result.sort((a, b) => a.rank - b.rank);
        break;
    }

    // Note: Time range filtering would require additional database queries
    // with created_at or activity timestamps. For now, we show a visual indicator
    // that the filter is active but data remains the same (all-time data)

    // Recalculate display ranks after sorting
    return result.map((entry, index) => ({
      ...entry,
      displayRank: index + 1,
    }));
  }, [leaders, filterBy]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-warning" />;
      case 2:
        return <Medal className="w-6 h-6 text-muted-foreground" />;
      case 3:
        return <Award className="w-6 h-6 text-accent-foreground" />;
      default:
        return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return "🥇 Champion";
    if (rank === 2) return "🥈 Elite";
    if (rank === 3) return "🥉 Master";
    if (rank <= 10) return "⭐ Top 10";
    if (rank <= 50) return "✨ Top 50";
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <MainNav />
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <MainNav />
      
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block mb-4"
          >
            <Trophy className="w-16 h-16 text-primary mx-auto" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Global Leaderboard
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Compete with travelers worldwide. Earn XP by completing missions, learning culture, and exploring new places!
          </p>
        </div>

        {/* Filters */}
        <Card className="p-4 mb-8">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filters:</span>
            </div>
            <Select value={filterBy} onValueChange={(value: 'all' | 'level' | 'xp') => setFilterBy(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Rankings</SelectItem>
                <SelectItem value="level">By Level</SelectItem>
                <SelectItem value="xp">By XP</SelectItem>
              </SelectContent>
            </Select>
            <Select value={timeRange} onValueChange={(value: 'all-time' | 'monthly' | 'weekly') => setTimeRange(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-time">All Time</SelectItem>
                <SelectItem value="monthly">This Month</SelectItem>
                <SelectItem value="weekly">This Week</SelectItem>
              </SelectContent>
            </Select>
            <div className="ml-auto flex gap-2">
              <Badge variant="outline">{filteredLeaders.length} Travelers</Badge>
              {timeRange !== 'all-time' && (
                <Badge variant="secondary" className="text-xs">
                  {timeRange === 'monthly' ? '📅 Monthly' : '📆 Weekly'}
                </Badge>
              )}
            </div>
          </div>
        </Card>

        {/* Current User Rank */}
        {userRank && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8"
          >
            <Card className="p-6 bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  {getRankIcon(userRank.rank)}
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={userRank.avatar_url || undefined} />
                    <AvatarFallback>
                      {userRank.full_name?.charAt(0)?.toUpperCase() || 'Y'}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">You</span>
                    {getRankBadge(userRank.rank) && (
                      <Badge variant="secondary">{getRankBadge(userRank.rank)}</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-sm text-muted-foreground">
                      Rank #{userRank.rank}
                    </span>
                    <Badge variant="outline">Level {userRank.level}</Badge>
                    <span className="text-sm font-medium">{userRank.total_xp} XP</span>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Leaderboard List */}
        <div className="space-y-2">
          {filteredLeaders.map((entry, index) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03 }}
            >
              <Card
                className={`p-4 transition-all hover:shadow-md ${
                  entry.user_id === user?.id ? 'border-primary' : ''
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 flex items-center justify-center">
                    {getRankIcon(entry.displayRank)}
                  </div>

                  <Avatar className="w-10 h-10">
                    <AvatarImage src={entry.avatar_url || undefined} />
                    <AvatarFallback>
                      {entry.full_name?.charAt(0)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">
                        {entry.full_name || 'Anonymous Traveler'}
                      </span>
                      {entry.user_id === user?.id && (
                        <Badge variant="secondary" className="text-xs">You</Badge>
                      )}
                      {getRankBadge(entry.displayRank) && (
                        <Badge variant="outline" className="text-xs">
                          {getRankBadge(entry.displayRank)}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                      <span>Level {entry.level}</span>
                      <span>•</span>
                      <span className="font-medium text-foreground">
                        {entry.total_xp.toLocaleString()} XP
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-primary" />
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredLeaders.length === 0 && (
          <Card className="p-12 text-center">
            <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              No travelers on the leaderboard yet. Be the first!
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
