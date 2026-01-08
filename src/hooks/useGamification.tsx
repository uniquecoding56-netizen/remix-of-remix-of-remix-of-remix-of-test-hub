import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface UserXP {
  total_xp: number;
  level: number;
}

interface UserStreak {
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  requirement_type: string;
  requirement_value: number;
  xp_reward: number;
}

interface EarnedBadge extends Badge {
  earned_at: string;
}

// XP required for each level (exponential growth)
const getXPForLevel = (level: number): number => {
  return Math.floor(100 * Math.pow(1.5, level - 1));
};

const getLevelFromXP = (xp: number): number => {
  let level = 1;
  let xpNeeded = 100;
  while (xp >= xpNeeded) {
    level++;
    xpNeeded += getXPForLevel(level);
  }
  return level;
};

export function useGamification() {
  const { user } = useAuth();
  const [xpData, setXpData] = useState<UserXP | null>(null);
  const [streakData, setStreakData] = useState<UserStreak | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [earnedBadges, setEarnedBadges] = useState<EarnedBadge[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGamificationData = useCallback(async () => {
    if (!user) return;

    try {
      // Fetch or create XP record
      let { data: xp } = await supabase
        .from('user_xp')
        .select('total_xp, level')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!xp) {
        const { data: newXp } = await supabase
          .from('user_xp')
          .insert({ user_id: user.id })
          .select('total_xp, level')
          .single();
        xp = newXp;
      }
      setXpData(xp);

      // Fetch or create streak record
      let { data: streak } = await supabase
        .from('user_streaks')
        .select('current_streak, longest_streak, last_activity_date')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!streak) {
        const { data: newStreak } = await supabase
          .from('user_streaks')
          .insert({ user_id: user.id })
          .select('current_streak, longest_streak, last_activity_date')
          .single();
        streak = newStreak;
      }
      setStreakData(streak);

      // Fetch all badges
      const { data: allBadges } = await supabase
        .from('badges')
        .select('*')
        .order('requirement_value');
      setBadges(allBadges || []);

      // Fetch earned badges
      const { data: earned } = await supabase
        .from('user_badges')
        .select('earned_at, badge_id, badges(*)')
        .eq('user_id', user.id);

      const earnedWithDetails = (earned || []).map((e: any) => ({
        ...e.badges,
        earned_at: e.earned_at
      }));
      setEarnedBadges(earnedWithDetails);

    } catch (error) {
      console.error('Error fetching gamification data:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchGamificationData();
  }, [fetchGamificationData]);

  const addXP = async (amount: number, source: string, description?: string) => {
    if (!user || !xpData) return;

    try {
      const newTotalXP = xpData.total_xp + amount;
      const newLevel = getLevelFromXP(newTotalXP);
      const leveledUp = newLevel > xpData.level;

      // Update XP
      await supabase
        .from('user_xp')
        .update({ total_xp: newTotalXP, level: newLevel })
        .eq('user_id', user.id);

      // Log transaction
      await supabase
        .from('xp_transactions')
        .insert({ user_id: user.id, amount, source, description });

      setXpData({ total_xp: newTotalXP, level: newLevel });

      // Show toast
      toast.success(`+${amount} XP!`, { description: description || source });

      if (leveledUp) {
        toast.success(`🎉 Level Up!`, { description: `You reached Level ${newLevel}!` });
        // Check for level badges
        await checkAndAwardBadges('level', newLevel);
      }

      return { newTotalXP, newLevel, leveledUp };
    } catch (error) {
      console.error('Error adding XP:', error);
    }
  };

  const updateStreak = async () => {
    if (!user || !streakData) return;

    const today = new Date().toISOString().split('T')[0];
    const lastActivity = streakData.last_activity_date;

    if (lastActivity === today) {
      return streakData; // Already counted today
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    let newStreak = 1;
    if (lastActivity === yesterdayStr) {
      newStreak = streakData.current_streak + 1;
    }

    const longestStreak = Math.max(streakData.longest_streak, newStreak);

    try {
      await supabase
        .from('user_streaks')
        .update({
          current_streak: newStreak,
          longest_streak: longestStreak,
          last_activity_date: today
        })
        .eq('user_id', user.id);

      const newStreakData = {
        current_streak: newStreak,
        longest_streak: longestStreak,
        last_activity_date: today
      };
      setStreakData(newStreakData);

      // Award XP for streak
      if (newStreak > 1) {
        await addXP(5 * newStreak, 'streak', `${newStreak}-day streak bonus!`);
      }

      // Check for streak badges
      await checkAndAwardBadges('streak_days', newStreak);

      return newStreakData;
    } catch (error) {
      console.error('Error updating streak:', error);
    }
  };

  const checkAndAwardBadges = async (requirementType: string, value: number) => {
    if (!user) return;

    const eligibleBadges = badges.filter(
      b => b.requirement_type === requirementType && 
           b.requirement_value <= value &&
           !earnedBadges.some(eb => eb.id === b.id)
    );

    for (const badge of eligibleBadges) {
      try {
        await supabase
          .from('user_badges')
          .insert({ user_id: user.id, badge_id: badge.id });

        // Award XP for badge
        if (badge.xp_reward > 0) {
          await addXP(badge.xp_reward, 'badge', `Earned "${badge.name}" badge!`);
        }

        toast.success(`🏅 Badge Earned!`, { 
          description: `${badge.icon} ${badge.name}` 
        });

        setEarnedBadges(prev => [...prev, { ...badge, earned_at: new Date().toISOString() }]);
      } catch (error) {
        // Badge might already exist
      }
    }
  };

  const recordFlashcardReview = async () => {
    if (!user) return;
    
    await updateStreak();
    await addXP(2, 'flashcard_review', 'Reviewed a flashcard');
    
    // Get total flashcard reviews count
    const { count } = await supabase
      .from('flashcard_progress')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);
    
    await checkAndAwardBadges('flashcards_reviewed', count || 0);
  };

  const getXPProgress = () => {
    if (!xpData) return { current: 0, needed: 100, percentage: 0 };
    
    let xpForCurrentLevel = 0;
    for (let i = 1; i < xpData.level; i++) {
      xpForCurrentLevel += getXPForLevel(i);
    }
    
    const xpInCurrentLevel = xpData.total_xp - xpForCurrentLevel;
    const xpNeededForNextLevel = getXPForLevel(xpData.level);
    const percentage = (xpInCurrentLevel / xpNeededForNextLevel) * 100;

    return {
      current: xpInCurrentLevel,
      needed: xpNeededForNextLevel,
      percentage: Math.min(percentage, 100)
    };
  };

  return {
    xpData,
    streakData,
    badges,
    earnedBadges,
    loading,
    addXP,
    updateStreak,
    recordFlashcardReview,
    checkAndAwardBadges,
    getXPProgress,
    refetch: fetchGamificationData
  };
}
