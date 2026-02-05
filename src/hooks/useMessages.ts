import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
  sender_profile?: {
    full_name: string;
    avatar_url: string;
  };
}

interface Conversation {
  partnerId: string;
  partnerName: string;
  partnerAvatar: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

export const useMessages = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchConversations = useCallback(async () => {
    if (!user) return;

    try {
      // Fetch all messages involving user
      const { data: messages, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group by conversation partner
      const convMap = new Map<string, Message[]>();
      
      for (const msg of messages || []) {
        const partnerId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
        if (!convMap.has(partnerId)) {
          convMap.set(partnerId, []);
        }
        convMap.get(partnerId)!.push(msg);
      }

      // Get partner profiles
      const partnerIds = Array.from(convMap.keys());
      if (partnerIds.length === 0) {
        setConversations([]);
        setUnreadCount(0);
        return;
      }

      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .in('user_id', partnerIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      // Build conversations
      const convs: Conversation[] = [];
      let totalUnread = 0;

      for (const [partnerId, msgs] of convMap) {
        const profile = profileMap.get(partnerId);
        const lastMsg = msgs[0];
        const unread = msgs.filter(m => m.receiver_id === user.id && !m.is_read).length;
        totalUnread += unread;

        convs.push({
          partnerId,
          partnerName: profile?.full_name || 'Unknown',
          partnerAvatar: profile?.avatar_url || '',
          lastMessage: lastMsg.content,
          lastMessageAt: lastMsg.created_at,
          unreadCount: unread
        });
      }

      // Sort by most recent
      convs.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());

      setConversations(convs);
      setUnreadCount(totalUnread);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchConversations();

    // Subscribe to real-time messages
    if (user) {
      const channel = supabase
        .channel('messages_changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `receiver_id=eq.${user.id}`
          },
          (payload) => {
            const msg = payload.new as Message;
            toast.info('New message received!');
            fetchConversations();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, fetchConversations]);

  const sendMessage = async (receiverId: string, content: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          receiver_id: receiverId,
          content
        });

      if (error) throw error;

      fetchConversations();
      return true;
    } catch (error: any) {
      toast.error(error.message || 'Failed to send message');
      return false;
    }
  };

  const getConversation = async (partnerId: string): Promise<Message[]> => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching conversation:', error);
      return [];
    }
  };

  const markAsRead = async (partnerId: string) => {
    if (!user) return;

    try {
      await supabase
        .from('messages')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('sender_id', partnerId)
        .eq('receiver_id', user.id)
        .eq('is_read', false);

      fetchConversations();
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  return {
    conversations,
    unreadCount,
    loading,
    sendMessage,
    getConversation,
    markAsRead,
    refetch: fetchConversations
  };
};
