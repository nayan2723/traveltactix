import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface QueuedAction {
  action_type: string;
  action_data: any;
}

export const useOfflineSync = () => {
  const { user } = useAuth();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Back online! Syncing your data...');
      syncQueuedActions();
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.info('You are offline. Changes will sync when you reconnect.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial sync if online
    if (navigator.onLine && user) {
      syncQueuedActions();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [user]);

  const queueAction = async (actionType: string, actionData: any) => {
    if (!user) return;

    // Store in local storage for offline access
    const queue = JSON.parse(localStorage.getItem('offlineQueue') || '[]');
    const newAction = {
      id: Date.now().toString(),
      action_type: actionType,
      action_data: actionData,
      created_at: new Date().toISOString(),
    };
    queue.push(newAction);
    localStorage.setItem('offlineQueue', JSON.stringify(queue));

    // Try to save to database if online
    if (isOnline) {
      try {
        // Type casting needed until Supabase types are regenerated
        await (supabase.from as any)('offline_queue').insert({
          user_id: user.id,
          action_type: actionType,
          action_data: actionData,
        });
      } catch (error: any) {
        // Silently ignore if table doesn't exist (PGRST205 error)
        if (error?.code !== 'PGRST205') {
          console.error('Failed to queue action:', error);
        }
      }
    }
  };

  const syncQueuedActions = async () => {
    if (!user || isSyncing) return;

    setIsSyncing(true);
    try {
      // Get local queue
      const localQueue = JSON.parse(localStorage.getItem('offlineQueue') || '[]');

      // Try to get database queue, but handle if table doesn't exist
      let dbQueue: any[] = [];
      try {
        // Type casting needed until Supabase types are regenerated
        const { data, error } = await (supabase.from as any)('offline_queue')
          .select('*')
          .eq('user_id', user.id)
          .eq('synced', false);

        if (error && error.code !== 'PGRST205') {
          throw error;
        }
        dbQueue = data || [];
      } catch (error: any) {
        // If table doesn't exist (PGRST205), just use local queue
        if (error?.code !== 'PGRST205') {
          console.error('Error fetching database queue:', error);
        }
      }

      const allActions = [...localQueue, ...dbQueue];

      // Process each action
      for (const action of allActions) {
        try {
          await processAction(action);

          // Mark as synced in database if it came from database
          if (action.id && typeof action.id === 'string' && action.id.length === 36) {
            try {
              // Type casting needed until Supabase types are regenerated
              await (supabase.from as any)('offline_queue')
                .update({ synced: true, synced_at: new Date().toISOString() })
                .eq('id', action.id);
            } catch (error: any) {
              // Silently ignore if table doesn't exist
              if (error?.code !== 'PGRST205') {
                console.error('Failed to mark action as synced:', error);
              }
            }
          }
        } catch (error) {
          console.error('Failed to sync action:', error);
        }
      }

      // Clear local queue
      localStorage.setItem('offlineQueue', '[]');
      if (allActions.length > 0) {
        toast.success('All changes synced!');
      }
    } catch (error) {
      console.error('Sync failed:', error);
      toast.error('Some changes could not be synced');
    } finally {
      setIsSyncing(false);
    }
  };

  const processAction = async (action: QueuedAction) => {
    const { action_type, action_data } = action;

    switch (action_type) {
      case 'favorite':
        await supabase.from('user_favorites').insert(action_data);
        break;
      case 'unfavorite':
        await supabase
          .from('user_favorites')
          .delete()
          .eq('place_id', action_data.place_id)
          .eq('user_id', action_data.user_id);
        break;
      case 'visit':
        await supabase.from('user_place_visits').insert(action_data);
        break;
      case 'mission_start':
        await supabase.from('user_missions').insert(action_data);
        break;
      default:
        console.warn('Unknown action type:', action_type);
    }
  };

  return {
    isOnline,
    isSyncing,
    queueAction,
    syncQueuedActions,
  };
};