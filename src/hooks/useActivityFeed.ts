import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Activity {
  id: string;
  user_id: string;
  activity_type: string;
  title: string;
  description: string | null;
  metadata: any;
  is_public: boolean;
  created_at: string;
  profile?: {
    full_name: string;
    avatar_url: string;
    level: number;
  };
}

export const useActivityFeed = (feedType: 'personal' | 'friends' | 'global' = 'friends') => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);

  const fetchActivities = useCallback(async (offset = 0, limit = 20) => {
    try {
      let query = supabase
        .from('activity_feed')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (feedType === 'personal' && user) {
        query = query.eq('user_id', user.id);
      } else if (feedType === 'global') {
        query = query.eq('is_public', true);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Fetch profiles for all activities
      const userIds = [...new Set((data || []).map(a => a.user_id))];
      let profileMap = new Map();
      
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, full_name, avatar_url, level')
          .in('user_id', userIds);
        
        profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
      }

      const activitiesWithProfiles: Activity[] = (data || []).map(a => ({
        ...a,
        profile: profileMap.get(a.user_id)
      }));

      if (offset === 0) {
        setActivities(activitiesWithProfiles);
      } else {
        setActivities(prev => [...prev, ...activitiesWithProfiles]);
      }

      setHasMore((data?.length || 0) === limit);
    } catch (error) {
      console.error('Error fetching activity feed:', error);
    } finally {
      setLoading(false);
    }
  }, [user, feedType]);

  useEffect(() => {
    fetchActivities();

    // Subscribe to new activities
    const channel = supabase
      .channel('activity_feed_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'activity_feed'
        },
        () => {
          // Refresh feed on new activity
          fetchActivities();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchActivities]);

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchActivities(activities.length);
    }
  };

  const postActivity = async (
    activityType: string,
    title: string,
    description?: string,
    metadata?: any,
    isPublic = true
  ) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('activity_feed')
        .insert({
          user_id: user.id,
          activity_type: activityType,
          title,
          description,
          metadata,
          is_public: isPublic
        });

      if (error) throw error;

      // Refresh feed
      fetchActivities();
    } catch (error) {
      console.error('Error posting activity:', error);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'mission_completed': return '🎯';
      case 'badge_earned': return '🏆';
      case 'level_up': return '⬆️';
      case 'place_visited': return '📍';
      case 'friend_added': return '👋';
      case 'team_joined': return '👥';
      case 'achievement_unlocked': return '🏅';
      case 'streak_milestone': return '🔥';
      default: return '📣';
    }
  };

  return {
    activities,
    loading,
    hasMore,
    loadMore,
    postActivity,
    getActivityIcon,
    refetch: () => fetchActivities()
  };
};
