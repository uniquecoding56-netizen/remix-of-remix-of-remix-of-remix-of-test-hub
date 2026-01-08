import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from './useAuth';

const INSPIRATIONAL_QUOTES = [
  { emoji: '🚀', quote: 'Every expert was once a beginner. Keep pushing forward!', thought: 'Your learning journey is unique. Every step counts.' },
  { emoji: '💪', quote: 'Success is the sum of small efforts repeated day in and day out.', thought: 'Consistency beats intensity. Study a little every day.' },
  { emoji: '🌟', quote: 'The only way to do great work is to love what you do.', thought: 'Find joy in learning, and success will follow.' },
  { emoji: '🎯', quote: 'Focus on progress, not perfection.', thought: 'Small improvements compound into remarkable results.' },
  { emoji: '📚', quote: 'The more you learn, the more you realize how much you don\'t know.', thought: 'Embrace curiosity. It\'s your superpower.' },
  { emoji: '🔥', quote: 'Your potential is limitless. Keep challenging yourself!', thought: 'Growth happens outside your comfort zone.' },
  { emoji: '✨', quote: 'Today\'s preparation determines tomorrow\'s achievement.', thought: 'Invest in yourself. It pays the best interest.' },
  { emoji: '🎓', quote: 'Education is the most powerful weapon you can use to change the world.', thought: 'Knowledge is power. Use it wisely.' },
  { emoji: '⚡', quote: 'Don\'t wait for the perfect moment. Start now!', thought: 'The best time to learn was yesterday. The second best is now.' },
  { emoji: '🌈', quote: 'Every accomplishment starts with the decision to try.', thought: 'You\'re capable of more than you know.' },
  { emoji: '🎨', quote: 'Creativity is intelligence having fun.', thought: 'Make learning fun and watch your progress soar.' },
  { emoji: '🏆', quote: 'Champions are made in the practice room, not the arena.', thought: 'Your daily habits shape your future success.' },
  { emoji: '💡', quote: 'The only person you should try to be better than is who you were yesterday.', thought: 'Compare yourself to your past self, not others.' },
  { emoji: '🌱', quote: 'Growth is never by mere chance; it is the result of forces working together.', thought: 'Every study session is planting a seed for your future.' },
  { emoji: '🎪', quote: 'Life is a journey, not a destination. Enjoy the learning process!', thought: 'The journey of learning is as important as the destination.' },
];

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      loadNotifications();
      checkAndCreateNotification();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadNotifications = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      setNotifications(data || []);
      setUnreadCount((data || []).filter((n: any) => !n.is_read).length);
    } catch (error: any) {
      // If table doesn't exist, silently fail (non-critical feature)
      if (error?.code === '42P01' || error?.message?.includes('does not exist')) {
        console.warn('Notifications table not found - skipping notifications');
        return;
      }
      console.error('Error loading notifications:', error);
    }
  };

  const checkAndCreateNotification = async () => {
    if (!user) return;

    try {
      // Check last notification
      const { data: lastNotification, error: queryError } = await supabase
        .from('user_notifications')
        .select('created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      // If table doesn't exist, silently fail (non-critical feature)
      if (queryError) {
        if (queryError.code === '42P01' || queryError.message?.includes('does not exist')) {
          return;
        }
        throw queryError;
      }

      const now = new Date();
      const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);

      // If no notification or last notification is older than 3 days
      if (!lastNotification || new Date(lastNotification.created_at) < threeDaysAgo) {
        // Get random quote
        const randomQuote = INSPIRATIONAL_QUOTES[Math.floor(Math.random() * INSPIRATIONAL_QUOTES.length)];

        // Create notification
        const { error } = await supabase
          .from('user_notifications')
          .insert({
            user_id: user.id,
            notification_type: 'inspirational_quote',
            title: `${randomQuote.emoji} Daily Inspiration`,
            message: `${randomQuote.quote}\n\n${randomQuote.thought}`,
            emoji: randomQuote.emoji
          });

        if (error) {
          // If table doesn't exist, silently fail (non-critical feature)
          if (error.code === '42P01' || error.message?.includes('does not exist')) {
            return;
          }
          console.warn('Error creating notification (non-critical):', error);
        } else {
          // Show toast notification
          toast.success(`${randomQuote.emoji} ${randomQuote.quote}`, {
            description: randomQuote.thought,
            duration: 5000,
          });
          
          // Reload notifications
          loadNotifications();
        }
      }
    } catch (error: any) {
      // Silently fail - notifications are non-critical
      if (error?.code === '42P01' || error?.message?.includes('does not exist')) {
        return;
      }
      console.warn('Error checking notifications (non-critical):', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .eq('user_id', user.id);

      if (error) throw error;
      loadNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;
      loadNotifications();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    refreshNotifications: loadNotifications
  };
}


