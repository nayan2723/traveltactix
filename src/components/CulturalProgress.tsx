import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { 
  BookOpen,
  Globe,
  Star,
  Trophy,
  Target,
  Sparkles,
  Languages,
  Camera
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface CulturalStats {
  totalCulturalXP: number;
  completedLessons: number;
  viewedContent: number;
  arDiscoveries: number;
  culturalLevel: number;
  nextLevelXP: number;
}

const CulturalProgress = () => {
  const [stats, setStats] = useState<CulturalStats>({
    totalCulturalXP: 0,
    completedLessons: 0,
    viewedContent: 0,
    arDiscoveries: 0,
    culturalLevel: 1,
    nextLevelXP: 100
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCulturalProgress();
  }, []);

  const fetchCulturalProgress = async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) {
        console.error('Auth error:', authError);
        setLoading(false);
        return;
      }
      
      if (!user) {
        console.log('No user found');
        setLoading(false);
        return;
      }

      console.log('Fetching cultural progress for user:', user.id);

      const { data: progress, error } = await supabase
        .from('user_cultural_progress')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      const progressData = progress || [];
      console.log('Cultural progress data:', progressData);
      
      const totalXP = progressData.reduce((sum, p) => sum + (p.cultural_xp_earned || 0), 0);
      const completedLessons = progressData.filter(p => p.progress_type === 'lesson_completed').length;
      const viewedContent = progressData.filter(p => p.progress_type === 'content_viewed').length;
      const arDiscoveries = progressData.filter(p => p.progress_type === 'challenge_completed').length;
      
      // Calculate cultural level (every 100 XP = 1 level)
      const level = Math.floor(totalXP / 100) + 1;
      const nextLevelXP = (level * 100) - totalXP;

      console.log('Calculated stats:', {
        totalXP,
        completedLessons,
        viewedContent,
        arDiscoveries,
        level,
        nextLevelXP
      });

      setStats({
        totalCulturalXP: totalXP,
        completedLessons,
        viewedContent,
        arDiscoveries,
        culturalLevel: level,
        nextLevelXP
      });
    } catch (error) {
      console.error('Error fetching cultural progress:', error);
      // Show user-friendly error without disrupting the UI
    } finally {
      setLoading(false);
    }
  };

  const getProgressPercentage = () => {
    const currentLevelXP = stats.totalCulturalXP % 100;
    return (currentLevelXP / 100) * 100;
  };

  const getCulturalTitle = (level: number) => {
    if (level >= 20) return "Cultural Master";
    if (level >= 15) return "Cultural Expert";
    if (level >= 10) return "Cultural Scholar";
    if (level >= 5) return "Cultural Explorer";
    return "Cultural Novice";
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-1/3"></div>
          <div className="h-4 bg-muted rounded w-full"></div>
          <div className="h-4 bg-muted rounded w-2/3"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 relative overflow-hidden">
      <GlowingEffect
        spread={30}
        glow={true}
        disabled={false}
        proximity={50}
        inactiveZone={0.01}
        borderWidth={2}
      />
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="heading-display text-xl mb-1">Cultural Journey</h3>
          <p className="text-muted-foreground text-sm">Your immersion progress</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-primary">{stats.totalCulturalXP}</div>
          <div className="text-xs text-muted-foreground">Cultural XP</div>
        </div>
      </div>

      {/* Level Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <Badge className="bg-primary/10 text-primary border-primary/20">
              Level {stats.culturalLevel}
            </Badge>
            <span className="ml-2 text-sm font-medium">{getCulturalTitle(stats.culturalLevel)}</span>
          </div>
          <span className="text-sm text-muted-foreground">
            {stats.nextLevelXP} XP to next level
          </span>
        </div>
        
        <div className="relative">
          <Progress value={getProgressPercentage()} className="h-3" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50 animate-shimmer"></div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-4 bg-muted/30 rounded-lg">
          <BookOpen className="h-6 w-6 text-blue-500 mx-auto mb-2" />
          <div className="text-lg font-semibold">{stats.completedLessons}</div>
          <div className="text-xs text-muted-foreground">Lessons Complete</div>
        </div>

        <div className="text-center p-4 bg-muted/30 rounded-lg">
          <Globe className="h-6 w-6 text-green-500 mx-auto mb-2" />
          <div className="text-lg font-semibold">{stats.viewedContent}</div>
          <div className="text-xs text-muted-foreground">Cultural Tips</div>
        </div>

        <div className="text-center p-4 bg-muted/30 rounded-lg">
          <Camera className="h-6 w-6 text-purple-500 mx-auto mb-2" />
          <div className="text-lg font-semibold">{stats.arDiscoveries}</div>
          <div className="text-xs text-muted-foreground">AR Discoveries</div>
        </div>

        <div className="text-center p-4 bg-muted/30 rounded-lg">
          <Trophy className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
          <div className="text-lg font-semibold">{stats.culturalLevel}</div>
          <div className="text-xs text-muted-foreground">Cultural Level</div>
        </div>
      </div>

      {/* Achievements Preview */}
      <div className="mt-6 pt-4 border-t">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium">Recent Achievements</div>
          <div className="flex space-x-1">
            {stats.completedLessons > 0 && (
              <Badge variant="outline" className="text-xs">
                <Languages className="h-3 w-3 mr-1" />
                First Lesson
              </Badge>
            )}
            {stats.arDiscoveries > 0 && (
              <Badge variant="outline" className="text-xs">
                <Sparkles className="h-3 w-3 mr-1" />
                AR Explorer
              </Badge>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export { CulturalProgress };