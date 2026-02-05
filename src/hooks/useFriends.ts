import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Friend {
  id: string;
  user_id: string;
  friend_id: string;
  status: 'pending' | 'accepted' | 'rejected' | 'blocked';
  created_at: string;
  profile?: {
    full_name: string;
    avatar_url: string;
    level: number;
    total_xp: number;
  };
}

export const useFriends = () => {
  const { user } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Friend[]>([]);
  const [sentRequests, setSentRequests] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFriends = useCallback(async () => {
    if (!user) return;

    try {
      // Fetch accepted friends where user is the requester
      const { data: acceptedFriends } = await supabase
        .from('friendships')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'accepted');

      // Fetch friends where current user is friend_id
      const { data: reverseFriends } = await supabase
        .from('friendships')
        .select('*')
        .eq('friend_id', user.id)
        .eq('status', 'accepted');

      // Get all friend user IDs
      const friendUserIds = [
        ...(acceptedFriends || []).map(f => f.friend_id),
        ...(reverseFriends || []).map(f => f.user_id)
      ];

      // Fetch profiles for friends
      let profileMap = new Map();
      if (friendUserIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, full_name, avatar_url, level, total_xp')
          .in('user_id', friendUserIds);
        
        profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
      }

      const allFriends: Friend[] = [
        ...(acceptedFriends || []).map(f => ({
          ...f,
          status: f.status as Friend['status'],
          profile: profileMap.get(f.friend_id)
        })),
        ...(reverseFriends || []).map(f => ({
          ...f,
          status: f.status as Friend['status'],
          profile: profileMap.get(f.user_id)
        }))
      ];
      setFriends(allFriends);

      // Fetch pending requests (received)
      const { data: pending } = await supabase
        .from('friendships')
        .select('*')
        .eq('friend_id', user.id)
        .eq('status', 'pending');

      // Get profiles for pending requests
      const pendingUserIds = (pending || []).map(p => p.user_id);
      if (pendingUserIds.length > 0) {
        const { data: pendingProfiles } = await supabase
          .from('profiles')
          .select('user_id, full_name, avatar_url, level, total_xp')
          .in('user_id', pendingUserIds);
        
        const pendingProfileMap = new Map(pendingProfiles?.map(p => [p.user_id, p]) || []);
        setPendingRequests((pending || []).map(p => ({
          ...p,
          status: p.status as Friend['status'],
          profile: pendingProfileMap.get(p.user_id)
        })));
      } else {
        setPendingRequests([]);
      }

      // Fetch sent requests
      const { data: sent } = await supabase
        .from('friendships')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'pending');

      // Get profiles for sent requests
      const sentUserIds = (sent || []).map(s => s.friend_id);
      if (sentUserIds.length > 0) {
        const { data: sentProfiles } = await supabase
          .from('profiles')
          .select('user_id, full_name, avatar_url, level, total_xp')
          .in('user_id', sentUserIds);
        
        const sentProfileMap = new Map(sentProfiles?.map(p => [p.user_id, p]) || []);
        setSentRequests((sent || []).map(s => ({
          ...s,
          status: s.status as Friend['status'],
          profile: sentProfileMap.get(s.friend_id)
        })));
      } else {
        setSentRequests([]);
      }
    } catch (error) {
      console.error('Error fetching friends:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchFriends();

    // Subscribe to real-time updates
    if (user) {
      const channel = supabase
        .channel('friendships_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'friendships',
            filter: `user_id=eq.${user.id}`
          },
          () => fetchFriends()
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'friendships',
            filter: `friend_id=eq.${user.id}`
          },
          () => fetchFriends()
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, fetchFriends]);

  const sendFriendRequest = async (friendId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('friendships')
        .insert({
          user_id: user.id,
          friend_id: friendId,
          status: 'pending'
        });

      if (error) throw error;

      toast.success('Friend request sent!');
      fetchFriends();
    } catch (error: any) {
      if (error.code === '23505') {
        toast.error('Friend request already exists');
      } else {
        toast.error('Failed to send friend request');
      }
    }
  };

  const acceptFriendRequest = async (friendshipId: string) => {
    try {
      const { error } = await supabase
        .from('friendships')
        .update({ status: 'accepted' })
        .eq('id', friendshipId);

      if (error) throw error;

      toast.success('Friend request accepted!');
      fetchFriends();
    } catch (error) {
      toast.error('Failed to accept friend request');
    }
  };

  const rejectFriendRequest = async (friendshipId: string) => {
    try {
      const { error } = await supabase
        .from('friendships')
        .update({ status: 'rejected' })
        .eq('id', friendshipId);

      if (error) throw error;

      toast.success('Friend request rejected');
      fetchFriends();
    } catch (error) {
      toast.error('Failed to reject friend request');
    }
  };

  const removeFriend = async (friendshipId: string) => {
    try {
      const { error } = await supabase
        .from('friendships')
        .delete()
        .eq('id', friendshipId);

      if (error) throw error;

      toast.success('Friend removed');
      fetchFriends();
    } catch (error) {
      toast.error('Failed to remove friend');
    }
  };

  const blockUser = async (friendshipId: string) => {
    try {
      const { error } = await supabase
        .from('friendships')
        .update({ status: 'blocked' })
        .eq('id', friendshipId);

      if (error) throw error;

      toast.success('User blocked');
      fetchFriends();
    } catch (error) {
      toast.error('Failed to block user');
    }
  };

  return {
    friends,
    pendingRequests,
    sentRequests,
    loading,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend,
    blockUser,
    refetch: fetchFriends
  };
};
