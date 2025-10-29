import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Flame, Trophy, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface StreakData {
  current_streak: number;
  longest_streak: number;
  last_login_date: string | null;
  total_logins: number;
}

export const StreakTracker = () => {
  const { user } = useAuth();
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [loading, setLoading] = useState(true);
  const [rewardEarned, setRewardEarned] = useState(false);

  useEffect(() => {
    if (!user) return;
    
    checkAndUpdateStreak();
  }, [user]);

  const checkAndUpdateStreak = async () => {
    if (!user) return;

    try {
      // Fetch or create streak record
      const { data: existingStreak, error: fetchError } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', user.id)
        .single();

      const today = new Date().toISOString().split('T')[0];
      
      if (fetchError && fetchError.code === 'PGRST116') {
        // Create new streak
        const { data: newStreak, error: insertError } = await supabase
          .from('user_streaks')
          .insert({
            user_id: user.id,
            current_streak: 1,
            longest_streak: 1,
            last_login_date: today,
            total_logins: 1,
          })
          .select()
          .single();

        if (insertError) throw insertError;
        setStreak(newStreak);
        setRewardEarned(true);
        await awardDailyXP(1);
      } else if (existingStreak) {
        const lastLogin = existingStreak.last_login_date;
        
        if (lastLogin !== today) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];
          
          let newStreak = existingStreak.current_streak;
          
          if (lastLogin === yesterdayStr) {
            // Continue streak
            newStreak += 1;
            setRewardEarned(true);
          } else {
            // Streak broken
            newStreak = 1;
            toast.error('Your streak was broken! Starting fresh today.');
          }

          const longestStreak = Math.max(newStreak, existingStreak.longest_streak);

          const { data: updatedStreak, error: updateError } = await supabase
            .from('user_streaks')
            .update({
              current_streak: newStreak,
              longest_streak: longestStreak,
              last_login_date: today,
              total_logins: existingStreak.total_logins + 1,
            })
            .eq('user_id', user.id)
            .select()
            .single();

          if (updateError) throw updateError;
          setStreak(updatedStreak);
          
          if (rewardEarned) {
            await awardDailyXP(newStreak);
          }
        } else {
          setStreak(existingStreak);
        }
      }
    } catch (error) {
      console.error('Error managing streak:', error);
    } finally {
      setLoading(false);
    }
  };

  const awardDailyXP = async (streakCount: number) => {
    if (!user) return;

    // Base reward + bonus for streak milestones
    let xpReward = 10;
    if (streakCount >= 7) xpReward += 20;
    if (streakCount >= 30) xpReward += 50;
    if (streakCount >= 100) xpReward += 100;

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('total_xp')
        .eq('user_id', user.id)
        .single();

      if (profile) {
        await supabase
          .from('profiles')
          .update({ total_xp: profile.total_xp + xpReward })
          .eq('user_id', user.id);

        toast.success(`Daily login! +${xpReward} XP`, {
          description: streakCount > 1 ? `${streakCount} day streak! 🔥` : undefined,
        });
      }
    } catch (error) {
      console.error('Error awarding daily XP:', error);
    }
  };

  if (loading || !streak) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="p-4 bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <Flame className="h-6 w-6 text-orange-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg">{streak.current_streak} Day Streak</h3>
                {rewardEarned && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-xs bg-green-500/20 text-green-500 px-2 py-1 rounded-full"
                  >
                    +XP
                  </motion.span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">Keep it going!</p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="text-center">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Trophy className="h-4 w-4" />
                <span className="text-xs">Best</span>
              </div>
              <p className="font-bold">{streak.longest_streak}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span className="text-xs">Total</span>
              </div>
              <p className="font-bold">{streak.total_logins}</p>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};