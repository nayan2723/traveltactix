import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import {
  initOfflineDB,
  cacheMissions,
  getCachedMissions,
  cachePlaces,
  getCachedPlaces,
  cacheUserProgress,
  getCachedUserProgress,
  saveToStore,
  getAllFromStore,
  clearStore
} from '@/lib/offlineStorage';

interface QueuedAction {
  id: string;
  action_type: string;
  action_data: any;
  created_at: string;
}

interface SyncStatus {
  lastSynced: Date | null;
  pendingActions: number;
  isSyncing: boolean;
}

export const useOfflineSync = () => {
  const { user } = useAuth();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    lastSynced: null,
    pendingActions: 0,
    isSyncing: false
  });

  // Initialize IndexedDB
  useEffect(() => {
    initOfflineDB().catch(console.error);
  }, []);

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

  // Update pending actions count
  useEffect(() => {
    const queue = JSON.parse(localStorage.getItem('offlineQueue') || '[]');
    setSyncStatus(prev => ({ ...prev, pendingActions: queue.length }));
  }, [isSyncing]);

  const queueAction = async (actionType: string, actionData: any) => {
    if (!user) return;

    // Store in local storage for offline access
    const queue = JSON.parse(localStorage.getItem('offlineQueue') || '[]');
    const newAction: QueuedAction = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      action_type: actionType,
      action_data: actionData,
      created_at: new Date().toISOString(),
    };
    queue.push(newAction);
    localStorage.setItem('offlineQueue', JSON.stringify(queue));

    setSyncStatus(prev => ({ ...prev, pendingActions: queue.length }));

    // Try to save to database if online
    if (isOnline) {
      try {
        await supabase.from('offline_queue').insert({
          user_id: user.id,
          action_type: actionType,
          action_data: actionData,
        });
      } catch (error: any) {
        if (error?.code !== 'PGRST205') {
          console.error('Failed to queue action:', error);
        }
      }
    }
  };

  const syncQueuedActions = async () => {
    if (!user || isSyncing) return;

    setIsSyncing(true);
    setSyncStatus(prev => ({ ...prev, isSyncing: true }));

    try {
      // Get local queue
      const localQueue: QueuedAction[] = JSON.parse(localStorage.getItem('offlineQueue') || '[]');

      // Try to get database queue
      let dbQueue: any[] = [];
      try {
        const { data, error } = await supabase
          .from('offline_queue')
          .select('*')
          .eq('user_id', user.id)
          .eq('synced', false);

        if (error && error.code !== 'PGRST205') {
          throw error;
        }
        dbQueue = data || [];
      } catch (error: any) {
        if (error?.code !== 'PGRST205') {
          console.error('Error fetching database queue:', error);
        }
      }

      // Merge and deduplicate
      const allActions = [...localQueue, ...dbQueue];
      const processedIds = new Set<string>();

      // Process each action
      for (const action of allActions) {
        const actionId = action.id || action.action_data?.id;
        if (processedIds.has(actionId)) continue;
        processedIds.add(actionId);

        try {
          await processAction(action);

          // Mark as synced in database if it has a UUID id
          if (action.id && action.id.length === 36) {
            try {
              await supabase
                .from('offline_queue')
                .update({ synced: true, synced_at: new Date().toISOString() })
                .eq('id', action.id);
            } catch (error: any) {
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
      
      setSyncStatus({
        lastSynced: new Date(),
        pendingActions: 0,
        isSyncing: false
      });

      if (allActions.length > 0) {
        toast.success('All changes synced!');
      }
    } catch (error) {
      console.error('Sync failed:', error);
      toast.error('Some changes could not be synced');
    } finally {
      setIsSyncing(false);
      setSyncStatus(prev => ({ ...prev, isSyncing: false }));
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
      case 'mission_progress':
        await supabase
          .from('user_missions')
          .update({ progress: action_data.progress })
          .eq('id', action_data.mission_id);
        break;
      case 'profile_update':
        await supabase
          .from('profiles')
          .update(action_data.updates)
          .eq('user_id', action_data.user_id);
        break;
      default:
        console.warn('Unknown action type:', action_type);
    }
  };

  // Cache missions for offline use
  const cacheMissionsOffline = useCallback(async (missions: any[], city: string, country: string) => {
    try {
      await cacheMissions(missions, city, country);
    } catch (error) {
      console.error('Failed to cache missions:', error);
    }
  }, []);

  // Get cached missions when offline
  const getOfflineMissions = useCallback(async (city: string, country: string) => {
    try {
      return await getCachedMissions(city, country);
    } catch (error) {
      console.error('Failed to get cached missions:', error);
      return null;
    }
  }, []);

  // Cache places for offline use
  const cachePlacesOffline = useCallback(async (places: any[], city: string) => {
    try {
      await cachePlaces(places, city);
    } catch (error) {
      console.error('Failed to cache places:', error);
    }
  }, []);

  // Get cached places when offline
  const getOfflinePlaces = useCallback(async (city: string) => {
    try {
      return await getCachedPlaces(city);
    } catch (error) {
      console.error('Failed to get cached places:', error);
      return null;
    }
  }, []);

  // Cache user progress
  const cacheProgressOffline = useCallback(async (progress: any[]) => {
    if (!user) return;
    try {
      await cacheUserProgress(user.id, progress);
    } catch (error) {
      console.error('Failed to cache progress:', error);
    }
  }, [user]);

  // Get cached progress
  const getOfflineProgress = useCallback(async () => {
    if (!user) return null;
    try {
      return await getCachedUserProgress(user.id);
    } catch (error) {
      console.error('Failed to get cached progress:', error);
      return null;
    }
  }, [user]);

  // Clear all offline data
  const clearOfflineData = useCallback(async () => {
    try {
      await clearStore('missions');
      await clearStore('places');
      await clearStore('userProgress');
      await clearStore('cachedData');
      localStorage.setItem('offlineQueue', '[]');
      toast.success('Offline data cleared');
    } catch (error) {
      console.error('Failed to clear offline data:', error);
    }
  }, []);

  return {
    isOnline,
    isSyncing,
    syncStatus,
    queueAction,
    syncQueuedActions,
    cacheMissionsOffline,
    getOfflineMissions,
    cachePlacesOffline,
    getOfflinePlaces,
    cacheProgressOffline,
    getOfflineProgress,
    clearOfflineData
  };
};
