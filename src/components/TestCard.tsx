import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { GlowingEffect } from '@/components/ui/glowing-effect';
import { Bookmark, BookmarkCheck, Star, Play, Trash2, Share2, MessageSquare, Sparkles, GraduationCap, BookOpen } from 'lucide-react';
import { TestWithProfile, CATEGORY_LABELS, CATEGORY_COLORS } from '@/types/test';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { ReviewsDialog } from './ReviewsDialog';

interface TestCardProps {
  test: TestWithProfile;
  onUpdate: () => void;
}

const AI_USER_ID = '00000000-0000-0000-0000-000000000001';

export function TestCard({ test, onUpdate }: TestCardProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [showReviews, setShowReviews] = useState(false);
  const isOwner = user?.id === test.user_id;
  const isAIGenerated = test.is_ai_generated || test.user_id === AI_USER_ID;

  const handleToggleSave = async () => {
    if (!user) return;
    setIsSaving(true);

    try {
      if (test.isSaved) {
        await supabase
          .from('saved_tests')
          .delete()
          .eq('user_id', user.id)
          .eq('test_id', test.id);
        toast.success('Test removed from saved');
      } else {
        await supabase
          .from('saved_tests')
          .insert({ user_id: user.id, test_id: test.id });
        toast.success('Test saved!');
      }
      onUpdate();
    } catch (error) {
      toast.error('Failed to update saved status');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from('tests')
        .delete()
        .eq('id', test.id);
      
      if (error) throw error;
      toast.success('Test deleted successfully');
      onUpdate();
    } catch (error) {
      toast.error('Failed to delete test');
    }
  };

  const handleStartTest = () => {
    navigate(`/test/${test.id}`);
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/test/${test.id}`;
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: test.title,
          text: `Check out this test: ${test.title}`,
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Link copied to clipboard!');
      }
    } catch (error) {
      // User cancelled share or fallback to clipboard
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Link copied to clipboard!');
      } catch {
        toast.error('Failed to copy link');
      }
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
              star <= Math.round(rating)
                ? 'fill-primary text-primary'
                : 'text-muted'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="relative h-full">
      <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} />
      <Card className={`relative group hover:shadow-lg transition-all duration-300 overflow-hidden h-full ${isAIGenerated ? 'border-primary/30 bg-gradient-to-br from-primary/5 to-transparent' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {isAIGenerated ? (
              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-primary to-purple-600 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
            ) : (
              <Avatar className="h-10 w-10 border-2 border-primary/20">
                <AvatarImage src={test.profile?.avatar_url || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary font-medium">
                  {getInitials(test.profile?.full_name || 'Anonymous')}
                </AvatarFallback>
              </Avatar>
            )}
            <div>
              <p className="font-medium text-sm text-foreground">
                {isAIGenerated ? 'by Artificial Intelligence' : (test.profile?.full_name || 'Anonymous')}
              </p>
              <p className="text-xs text-muted-foreground">
                {new Date(test.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-1 items-end">
            {isAIGenerated && (
              <Badge className="bg-gradient-to-r from-primary to-purple-600 text-white border-0 text-xs">
                🤖 AI Generated
              </Badge>
            )}
            {isOwner && !isAIGenerated && (
              <Badge variant="secondary" className="text-xs">
                Your Test
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        <div className="mb-2 flex flex-wrap gap-1">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${CATEGORY_COLORS[test.category] || CATEGORY_COLORS.other}`}>
            {CATEGORY_LABELS[test.category] || 'Other'}
          </span>
          {test.class_standard && (
            <Badge variant="outline" className="gap-1 text-xs">
              <GraduationCap className="h-3 w-3" />
              Class {test.class_standard}
            </Badge>
          )}
          {test.subject && (
            <Badge variant="outline" className="gap-1 text-xs">
              <BookOpen className="h-3 w-3" />
              {test.subject}
            </Badge>
          )}
        </div>
        <h3 className="font-semibold text-lg mb-2 text-foreground line-clamp-1">
          {test.title}
        </h3>
        {test.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {test.description}
          </p>
        )}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="text-xs">
            {test.questions.length} Questions
          </Badge>
          {test.difficulty && (
            <Badge variant="secondary" className="text-xs capitalize">
              {test.difficulty}
            </Badge>
          )}
          {test.totalRatings > 0 && (
            <div className="flex items-center gap-1">
              {renderStars(test.averageRating)}
              <span className="text-xs text-muted-foreground">
                ({test.totalRatings})
              </span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-3 border-t border-border gap-2">
        <Button 
          onClick={handleStartTest} 
          className="flex-1"
          size="sm"
        >
          <Play className="h-4 w-4 mr-1" />
          Start Test
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleShare}
          className="shrink-0"
          title="Share test"
        >
          <Share2 className="h-4 w-4" />
        </Button>

        {test.totalRatings > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowReviews(true)}
            className="shrink-0"
            title="View reviews"
          >
            <MessageSquare className="h-4 w-4" />
          </Button>
        )}
        
        {!isOwner && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleSave}
            disabled={isSaving}
            className="shrink-0"
          >
            {test.isSaved ? (
              <BookmarkCheck className="h-4 w-4 text-primary" />
            ) : (
              <Bookmark className="h-4 w-4" />
            )}
          </Button>
        )}

        {isOwner && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="shrink-0">
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Test</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this test? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </CardFooter>

      <ReviewsDialog
        testId={test.id}
        testTitle={test.title}
        open={showReviews}
        onOpenChange={setShowReviews}
      />
      </Card>
    </div>
  );
}
