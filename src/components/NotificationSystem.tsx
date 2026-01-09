import { useNotifications } from '@/hooks/useNotifications';

export function NotificationSystem() {
  // Initialize the notifications hook to check for and create notifications
  useNotifications();
  return null;
}
