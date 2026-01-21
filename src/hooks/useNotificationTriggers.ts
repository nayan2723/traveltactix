import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { usePushNotifications } from './usePushNotifications';

export const useNotificationTriggers = () => {
  const { user } = useAuth();
  const { sendLocalNotification, permission } = usePushNotifications();
  const previousRankRef = useRef<number | null>(null);
  const previousStreakRef = useRef<number | null>(null);

  useEffect(() => {
    if (!user) return;

    // Subscribe to mission completions
    const missionChannel = supabase
      .channel('mission-completions')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_missions',
          filter: `user_id=eq.${user.id}`,
        },
        async (payload) => {
          const newRecord = payload.new as any;
          const oldRecord = payload.old as any;
          
          // Check if mission was just completed
          if (newRecord.is_completed && !oldRecord.is_completed) {
            // Get mission details
            const { data: mission } = await supabase
              .from('missions')
              .select('title, xp_reward')
              .eq('id', newRecord.mission_id)
              .single();
            
            if (mission) {
              // Create notification in database
              await supabase.functions.invoke('send-notification', {
                body: {
                  user_id: user.id,
                  title: '🎯 Mission Complete!',
                  message: `You completed "${mission.title}" and earned ${mission.xp_reward} XP!`,
                  notification_type: 'mission',
                  metadata: { mission_id: newRecord.mission_id, xp_earned: mission.xp_reward },
                },
              });
              
              // Send push notification
              if (permission === 'granted') {
                sendLocalNotification('🎯 Mission Complete!', {
                  body: `You completed "${mission.title}" and earned ${mission.xp_reward} XP!`,
                  tag: `mission-${newRecord.mission_id}`,
                });
              }
            }
          }
        }
      )
      .subscribe();

    // Subscribe to badge unlocks
    const badgeChannel = supabase
      .channel('badge-unlocks')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_badges',
          filter: `user_id=eq.${user.id}`,
        },
        async (payload) => {
          const newBadge = payload.new as any;
          
          // Get badge details
          const { data: badge } = await supabase
            .from('badges')
            .select('name, description')
            .eq('id', newBadge.badge_id)
            .single();
          
          if (badge) {
            // Create notification
            await supabase.functions.invoke('send-notification', {
              body: {
                user_id: user.id,
                title: '🏆 New Badge Unlocked!',
                message: `You earned the "${badge.name}" badge: ${badge.description}`,
                notification_type: 'achievement',
                metadata: { badge_id: newBadge.badge_id },
              },
            });
            
            if (permission === 'granted') {
              sendLocalNotification('🏆 New Badge Unlocked!', {
                body: `You earned the "${badge.name}" badge!`,
                tag: `badge-${newBadge.badge_id}`,
              });
            }
          }
        }
      )
      .subscribe();

    // Subscribe to streak updates
    const streakChannel = supabase
      .channel('streak-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_streaks',
          filter: `user_id=eq.${user.id}`,
        },
        async (payload) => {
          const newStreak = payload.new as any;
          const currentStreak = newStreak.current_streak;
          
          // Only notify on streak milestones (every 5 days, or special milestones)
          const milestones = [3, 5, 7, 10, 14, 21, 30, 50, 100];
          if (milestones.includes(currentStreak) && currentStreak !== previousStreakRef.current) {
            previousStreakRef.current = currentStreak;
            
            await supabase.functions.invoke('send-notification', {
              body: {
                user_id: user.id,
                title: '🔥 Streak Milestone!',
                message: `Amazing! You've maintained a ${currentStreak}-day streak!`,
                notification_type: 'streak',
                metadata: { streak: currentStreak },
              },
            });
            
            if (permission === 'granted') {
              sendLocalNotification('🔥 Streak Milestone!', {
                body: `Amazing! You've maintained a ${currentStreak}-day streak!`,
                tag: `streak-${currentStreak}`,
              });
            }
          }
        }
      )
      .subscribe();

    // Check leaderboard rank changes periodically
    const checkLeaderboardRank = async () => {
      const { data } = await supabase.rpc('get_leaderboard_entry', { target_user_id: user.id });
      
      if (data && data.length > 0) {
        const currentRank = data[0].rank;
        
        if (previousRankRef.current !== null && currentRank < previousRankRef.current) {
          const rankImprovement = previousRankRef.current - currentRank;
          
          await supabase.functions.invoke('send-notification', {
            body: {
              user_id: user.id,
              title: '📈 Leaderboard Rank Up!',
              message: `You moved up ${rankImprovement} position${rankImprovement > 1 ? 's' : ''}! You're now #${currentRank}!`,
              notification_type: 'leaderboard',
              metadata: { new_rank: currentRank, previous_rank: previousRankRef.current },
            },
          });
          
          if (permission === 'granted') {
            sendLocalNotification('📈 Leaderboard Rank Up!', {
              body: `You moved up to #${currentRank}!`,
              tag: 'leaderboard-rank',
            });
          }
        }
        
        previousRankRef.current = currentRank;
      }
    };

    // Initial rank check
    checkLeaderboardRank();
    
    // Check rank every 5 minutes
    const rankInterval = setInterval(checkLeaderboardRank, 5 * 60 * 1000);

    return () => {
      supabase.removeChannel(missionChannel);
      supabase.removeChannel(badgeChannel);
      supabase.removeChannel(streakChannel);
      clearInterval(rankInterval);
    };
  }, [user, permission, sendLocalNotification]);
};
