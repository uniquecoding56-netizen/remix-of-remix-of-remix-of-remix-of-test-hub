import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Flame, Trophy, Star, Zap, Medal, Target
} from 'lucide-react';
import { useGamification } from '@/hooks/useGamification';

export function GamificationStats() {
  const { xpData, streakData, earnedBadges, loading, getXPProgress } = useGamification();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
    );
  }

  const xpProgress = getXPProgress();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* XP & Level Card */}
      <Card className="bg-gradient-to-br from-primary/5 to-purple-500/5 border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
              <Star className="h-4 w-4 text-primary" />
            </div>
            Level {xpData?.level || 1}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">XP Progress</span>
              <span className="font-medium">{xpProgress.current} / {xpProgress.needed}</span>
            </div>
            <Progress value={xpProgress.percentage} className="h-2" />
            <p className="text-xs text-muted-foreground">
              Total: {xpData?.total_xp || 0} XP
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Streak Card */}
      <Card className="bg-gradient-to-br from-orange-500/5 to-red-500/5 border-orange-500/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-orange-500/20 flex items-center justify-center">
              <Flame className="h-4 w-4 text-orange-500" />
            </div>
            Daily Streak
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-orange-500">
              {streakData?.current_streak || 0}
            </span>
            <span className="text-muted-foreground">days</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Best: {streakData?.longest_streak || 0} days
          </p>
        </CardContent>
      </Card>

      {/* Badges Card */}
      <Card className="bg-gradient-to-br from-yellow-500/5 to-amber-500/5 border-yellow-500/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-yellow-500/20 flex items-center justify-center">
              <Medal className="h-4 w-4 text-yellow-500" />
            </div>
            Badges Earned
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-bold text-yellow-500">
              {earnedBadges.length}
            </span>
            <span className="text-muted-foreground">badges</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {earnedBadges.slice(0, 5).map((badge) => (
              <span key={badge.id} className="text-lg" title={badge.name}>
                {badge.icon}
              </span>
            ))}
            {earnedBadges.length > 5 && (
              <Badge variant="secondary" className="text-xs">
                +{earnedBadges.length - 5}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
