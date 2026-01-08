import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface FlashcardProgress {
  id: string;
  flashcard_id: string;
  ease_factor: number;
  interval_days: number;
  repetitions: number;
  next_review_at: string;
  last_reviewed_at: string | null;
}

// SM-2 Algorithm implementation
// Quality: 0 = complete blackout, 1 = incorrect but remembered, 2 = incorrect easy recall
//          3 = correct with difficulty, 4 = correct, 5 = perfect
export function useSpacedRepetition() {
  const { user } = useAuth();
  const [progressMap, setProgressMap] = useState<Map<string, FlashcardProgress>>(new Map());

  const generateContentHash = (content: string): string => {
    // Simple hash for content identification
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  };

  const loadProgress = useCallback(async (flashcards: { id: string; front: string }[]) => {
    if (!user || flashcards.length === 0) return;

    const contentHash = generateContentHash(flashcards.map(f => f.front).join('|'));
    
    const { data } = await supabase
      .from('flashcard_progress')
      .select('*')
      .eq('user_id', user.id)
      .eq('content_hash', contentHash);

    const map = new Map<string, FlashcardProgress>();
    (data || []).forEach((p: any) => {
      map.set(p.flashcard_id, p);
    });
    setProgressMap(map);

    return { contentHash, progressMap: map };
  }, [user]);

  const calculateNextReview = (quality: number, progress?: FlashcardProgress) => {
    // Default values for new cards
    let easeFactor = progress?.ease_factor || 2.5;
    let interval = progress?.interval_days || 0;
    let repetitions = progress?.repetitions || 0;

    if (quality < 3) {
      // Failed review - reset
      repetitions = 0;
      interval = 0;
    } else {
      // Successful review
      if (repetitions === 0) {
        interval = 1;
      } else if (repetitions === 1) {
        interval = 6;
      } else {
        interval = Math.round(interval * easeFactor);
      }
      repetitions += 1;
    }

    // Update ease factor (minimum 1.3)
    easeFactor = Math.max(1.3, easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));

    const nextReviewAt = new Date();
    nextReviewAt.setDate(nextReviewAt.getDate() + interval);

    return {
      ease_factor: Math.round(easeFactor * 100) / 100,
      interval_days: interval,
      repetitions,
      next_review_at: nextReviewAt.toISOString()
    };
  };

  const recordReview = async (
    flashcardId: string, 
    contentHash: string, 
    quality: number // 0-5
  ) => {
    if (!user) return null;

    const existingProgress = progressMap.get(flashcardId);
    const updates = calculateNextReview(quality, existingProgress);

    try {
      if (existingProgress) {
        // Update existing progress
        const { data } = await supabase
          .from('flashcard_progress')
          .update({
            ...updates,
            last_reviewed_at: new Date().toISOString()
          })
          .eq('id', existingProgress.id)
          .select()
          .single();

        if (data) {
          setProgressMap(prev => new Map(prev).set(flashcardId, data));
        }
        return data;
      } else {
        // Insert new progress
        const { data } = await supabase
          .from('flashcard_progress')
          .insert({
            user_id: user.id,
            flashcard_id: flashcardId,
            content_hash: contentHash,
            ...updates,
            last_reviewed_at: new Date().toISOString()
          })
          .select()
          .single();

        if (data) {
          setProgressMap(prev => new Map(prev).set(flashcardId, data));
        }
        return data;
      }
    } catch (error) {
      console.error('Error recording review:', error);
      return null;
    }
  };

  const getCardsForReview = (flashcards: { id: string }[]): string[] => {
    const now = new Date();
    return flashcards
      .filter(card => {
        const progress = progressMap.get(card.id);
        if (!progress) return true; // New cards always need review
        return new Date(progress.next_review_at) <= now;
      })
      .map(card => card.id);
  };

  const getCardStatus = (flashcardId: string): 'new' | 'learning' | 'review' | 'mastered' => {
    const progress = progressMap.get(flashcardId);
    if (!progress) return 'new';
    if (progress.repetitions === 0) return 'learning';
    if (progress.interval_days >= 21) return 'mastered';
    return 'review';
  };

  const getQualityFromResponse = (responseTime: number, isCorrect: boolean): number => {
    // Convert response to quality rating
    if (!isCorrect) {
      return responseTime < 2000 ? 1 : 0; // Quick wrong vs complete blackout
    }
    if (responseTime < 1500) return 5; // Perfect
    if (responseTime < 3000) return 4; // Correct
    if (responseTime < 5000) return 3; // Correct with difficulty
    return 3;
  };

  return {
    loadProgress,
    recordReview,
    getCardsForReview,
    getCardStatus,
    getQualityFromResponse,
    progressMap,
    generateContentHash
  };
}
