import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export const usePushNotifications = () => {
  const { user } = useAuth();
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check if notifications are supported
    setIsSupported('Notification' in window && 'serviceWorker' in navigator);
    
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if (!isSupported) return false;
    
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  };

  const sendLocalNotification = (title: string, options?: NotificationOptions) => {
    if (!isSupported || permission !== 'granted') return;
    
    try {
      // Try service worker notification first (better for PWA)
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'SHOW_NOTIFICATION',
          title,
          options: {
            icon: '/logo.png',
            badge: '/logo.png',
            ...options,
          },
        });
      } else {
        // Fallback to regular notification
        new Notification(title, {
          icon: '/logo.png',
          ...options,
        });
      }
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  return {
    isSupported,
    permission,
    requestPermission,
    sendLocalNotification,
  };
};
