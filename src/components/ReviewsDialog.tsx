import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, MessageSquare, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Review {
  id: string;
  rating: number;
  feedback: string | null;
  created_at: string;
  profile: {
    full_name: string;
    avatar_url: string | null;
  } | null;
}

interface ReviewsDialogProps {
  testId: string;
  testTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReviewsDialog({ testId, testTitle, open, onOpenChange }: ReviewsDialogProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (open) {
      fetchReviews();
    }
  }, [open, testId]);

  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('ratings')
        .select(`
          id,
          rating,
          feedback,
          created_at,
          user_id
        `)
        .eq('test_id', testId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch profiles for each review
      const reviewsWithProfiles = await Promise.all(
        (data || []).map(async (review) => {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('user_id', review.user_id)
            .maybeSingle();

          return {
            ...review,
            profile: profileData,
          };
        })
      );

      setReviews(reviewsWithProfiles);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? 'fill-primary text-primary'
                : 'text-muted'
            }`}
          />
        ))}
      </div>
    );
  };

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Test Reviews
          </DialogTitle>
          <DialogDescription>
            Reviews and feedback for "{testTitle}"
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No reviews yet</p>
            <p className="text-sm text-muted-foreground">Be the first to take this test and leave a review!</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Average Rating</p>
                <div className="flex items-center gap-2 mt-1">
                  {renderStars(Math.round(averageRating))}
                  <span className="font-semibold">{averageRating.toFixed(1)}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">{reviews.length}</p>
                <p className="text-sm text-muted-foreground">Reviews</p>
              </div>
            </div>

            <ScrollArea className="flex-1 max-h-[400px]">
              <div className="space-y-4 pr-4">
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="p-4 border border-border rounded-lg bg-card"
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10 border-2 border-primary/20">
                        <AvatarImage src={review.profile?.avatar_url || undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary text-sm">
                          {getInitials(review.profile?.full_name || 'Anonymous')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <p className="font-medium text-sm text-foreground">
                            {review.profile?.full_name || 'Anonymous'}
                          </p>
                          <span className="text-xs text-muted-foreground">
                            {new Date(review.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="mt-1">
                          {renderStars(review.rating)}
                        </div>
                        {review.feedback && (
                          <p className="mt-2 text-sm text-muted-foreground">
                            {review.feedback}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
