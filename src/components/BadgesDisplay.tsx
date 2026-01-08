import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger 
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Medal, Lock, Check, ChevronRight } from 'lucide-react';
import { useGamification } from '@/hooks/useGamification';
import { cn } from '@/lib/utils';

export function BadgesDisplay() {
  const { badges, earnedBadges, loading } = useGamification();
  const [isOpen, setIsOpen] = useState(false);

  if (loading) {
    return <Skeleton className="h-48" />;
  }

  const categories = [...new Set(badges.map(b => b.category))];
  const earnedIds = new Set(earnedBadges.map(b => b.id));

  const getBadgesByCategory = (category: string) => {
    return badges.filter(b => b.category === category);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Medal className="h-5 w-5 text-yellow-500" />
          Achievements
        </CardTitle>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm">
              View All <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Medal className="h-5 w-5 text-yellow-500" />
                All Badges ({earnedBadges.length}/{badges.length})
              </DialogTitle>
            </DialogHeader>
            
            <Tabs defaultValue={categories[0]} className="mt-4">
              <TabsList className="flex flex-wrap h-auto gap-1">
                {categories.map(cat => (
                  <TabsTrigger key={cat} value={cat} className="capitalize">
                    {cat}
                  </TabsTrigger>
                ))}
              </TabsList>

              {categories.map(cat => (
                <TabsContent key={cat} value={cat} className="mt-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {getBadgesByCategory(cat).map(badge => {
                      const isEarned = earnedIds.has(badge.id);
                      return (
                        <div
                          key={badge.id}
                          className={cn(
                            "p-4 rounded-lg border transition-all",
                            isEarned 
                              ? "bg-primary/5 border-primary/20" 
                              : "bg-muted/30 border-muted opacity-60"
                          )}
                        >
                          <div className="flex items-start gap-3">
                            <div className={cn(
                              "text-3xl",
                              !isEarned && "grayscale"
                            )}>
                              {badge.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium truncate">{badge.name}</h4>
                                {isEarned ? (
                                  <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                                ) : (
                                  <Lock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {badge.description}
                              </p>
                              <Badge variant="outline" className="mt-2 text-xs">
                                +{badge.xp_reward} XP
                              </Badge>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
          {earnedBadges.slice(0, 6).map(badge => (
            <div
              key={badge.id}
              className="flex flex-col items-center gap-1 p-2 rounded-lg bg-primary/5 border border-primary/10"
              title={badge.name}
            >
              <span className="text-2xl">{badge.icon}</span>
              <span className="text-xs text-center truncate w-full">{badge.name}</span>
            </div>
          ))}
          {earnedBadges.length === 0 && (
            <div className="col-span-full text-center py-4 text-muted-foreground">
              Complete activities to earn badges!
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
