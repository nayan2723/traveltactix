import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOfflineSync } from '@/hooks/useOfflineSync';

export const OfflineIndicator = () => {
  const { isOnline, isSyncing } = useOfflineSync();
  const [showIndicator, setShowIndicator] = useState(false);

  useEffect(() => {
    // Show indicator when offline or syncing
    if (!isOnline || isSyncing) {
      setShowIndicator(true);
    } else {
      // Hide after a delay when back online
      const timer = setTimeout(() => setShowIndicator(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, isSyncing]);

  return (
    <AnimatePresence>
      {showIndicator && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-20 right-4 z-50"
        >
          <Badge
            variant={isOnline ? 'default' : 'destructive'}
            className="flex items-center gap-2 px-4 py-2 shadow-lg"
          >
            {isOnline ? (
              <>
                <Wifi className="h-4 w-4" />
                {isSyncing ? 'Syncing...' : 'Online'}
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4" />
                Offline Mode
              </>
            )}
          </Badge>
        </motion.div>
      )}
    </AnimatePresence>
  );
};