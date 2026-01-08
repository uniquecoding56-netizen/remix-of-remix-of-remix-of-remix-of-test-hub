// NotificationSystem - Temporarily simplified to prevent app crashes
// Will be fully enabled after database migration
export function NotificationSystem() {
  // Temporarily disabled to prevent crashes if database tables don't exist
  // Uncomment after running the migration: supabase/migrations/20260102000000_add_save_share_system.sql
  
  // try {
  //   const { useNotifications } = await import('@/hooks/useNotifications');
  //   useNotifications();
  // } catch (error) {
  //   console.warn('Notifications disabled (non-critical):', error);
  // }
  
  return null;
}


