import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Flame, Star, Medal } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

interface LeaderboardEntry {
  user_id: string;
  value: number;
  profile?: {
    full_name: string;
    avatar_url: string | null;
  };
  rank: number;
}

export function GlobalLeaderboard() {
  const { user } = useAuth();
  const [xpLeaders, setXpLeaders] = useState<LeaderboardEntry[]>([]);
  const [streakLeaders, setStreakLeaders] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('xp');

  useEffect(() => {
    fetchLeaderboards();
  }, []);

  const fetchLeaderboards = async () => {
    try {
      // Fetch XP leaderboard
      const { data: xpData } = await supabase
        .from('user_xp')
        .select('user_id, total_xp, level')
        .order('total_xp', { ascending: false })
        .limit(10);

      // Fetch streak leaderboard
      const { data: streakData } = await supabase
        .from('user_streaks')
        .select('user_id, current_streak, longest_streak')
        .order('current_streak', { ascending: false })
        .limit(10);

      // Get all unique user IDs
      const userIds = [...new Set([
        ...(xpData || []).map(x => x.user_id),
        ...(streakData || []).map(s => s.user_id)
      ])];

      // Fetch profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .in('user_id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      // Map XP leaders
      const xpLeadersData: LeaderboardEntry[] = (xpData || []).map((x, i) => ({
        user_id: x.user_id,
        value: x.total_xp,
        profile: profileMap.get(x.user_id),
        rank: i + 1
      }));

      // Map streak leaders
      const streakLeadersData: LeaderboardEntry[] = (streakData || []).map((s, i) => ({
        user_id: s.user_id,
        value: s.current_streak,
        profile: profileMap.get(s.user_id),
        rank: i + 1
      }));

      setXpLeaders(xpLeadersData);
      setStreakLeaders(streakLeadersData);
    } catch (error) {
      console.error('Error fetching leaderboards:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2: return <Medal className="h-5 w-5 text-gray-400" />;
      case 3: return <Medal className="h-5 w-5 text-amber-600" />;
      default: return <span className="text-sm font-medium w-5 text-center">{rank}</span>;
    }
  };

  const getRankBg = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-yellow-500/10 border-yellow-500/30';
      case 2: return 'bg-gray-500/10 border-gray-500/30';
      case 3: return 'bg-amber-500/10 border-amber-500/30';
      default: return 'bg-muted/50';
    }
  };

  const LeaderboardList = ({ entries, valueLabel }: { entries: LeaderboardEntry[], valueLabel: string }) => (
    <div className="space-y-2">
      {entries.map((entry) => (
        <div
          key={entry.user_id}
          className={cn(
            "flex items-center gap-3 p-3 rounded-lg border transition-colors",
            getRankBg(entry.rank),
            entry.user_id === user?.id && "ring-2 ring-primary"
          )}
        >
          <div className="w-6 flex justify-center">
            {getRankIcon(entry.rank)}
          </div>
          <Avatar className="h-8 w-8">
            <AvatarImage src={entry.profile?.avatar_url || undefined} />
            <AvatarFallback>
              {entry.profile?.full_name?.charAt(0) || '?'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">
              {entry.profile?.full_name || 'Anonymous'}
              {entry.user_id === user?.id && (
                <Badge variant="secondary" className="ml-2 text-xs">You</Badge>
              )}
            </p>
          </div>
          <div className="text-right">
            <p className="font-bold">
              {entry.value.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">{valueLabel}</p>
          </div>
        </div>
      ))}
      {entries.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No data yet. Start studying to appear on the leaderboard!
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map(i => (
              <Skeleton key={i} className="h-14" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Global Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="xp" className="gap-2">
              <Star className="h-4 w-4" />
              XP Leaders
            </TabsTrigger>
            <TabsTrigger value="streak" className="gap-2">
              <Flame className="h-4 w-4" />
              Streak Leaders
            </TabsTrigger>
          </TabsList>

          <TabsContent value="xp">
            <LeaderboardList entries={xpLeaders} valueLabel="XP" />
          </TabsContent>

          <TabsContent value="streak">
            <LeaderboardList entries={streakLeaders} valueLabel="days" />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
