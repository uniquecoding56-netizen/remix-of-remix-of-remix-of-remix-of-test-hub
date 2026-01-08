import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy, Medal, Award, Users, Target } from 'lucide-react';

interface CreatorStats {
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  total_tests: number;
  total_attempts: number;
  avg_rating: number;
}

interface StudentStats {
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  total_attempts: number;
  total_correct: number;
  total_questions: number;
  avg_score: number;
}

export function Leaderboard() {
  const [creators, setCreators] = useState<CreatorStats[]>([]);
  const [students, setStudents] = useState<StudentStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboardData();
  }, []);

  const fetchLeaderboardData = async () => {
    setLoading(true);
    try {
      // Fetch all tests with their user_ids
      const { data: tests } = await supabase
        .from('tests')
        .select('id, user_id');

      // Fetch all test attempts
      const { data: attempts } = await supabase
        .from('test_attempts')
        .select('user_id, test_id, score, total_questions');

      // Fetch all ratings
      const { data: ratings } = await supabase
        .from('ratings')
        .select('test_id, rating');

      // Fetch all profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url');

      const profilesMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      // Calculate creator stats
      const creatorStatsMap = new Map<string, CreatorStats>();
      tests?.forEach(test => {
        const existing = creatorStatsMap.get(test.user_id) || {
          user_id: test.user_id,
          full_name: profilesMap.get(test.user_id)?.full_name || 'Unknown',
          avatar_url: profilesMap.get(test.user_id)?.avatar_url || null,
          total_tests: 0,
          total_attempts: 0,
          avg_rating: 0,
        };
        existing.total_tests++;
        creatorStatsMap.set(test.user_id, existing);
      });

      // Add attempts count to creators
      attempts?.forEach(attempt => {
        const test = tests?.find(t => t.id === attempt.test_id);
        if (test) {
          const creator = creatorStatsMap.get(test.user_id);
          if (creator) {
            creator.total_attempts++;
          }
        }
      });

      // Add ratings to creators
      const ratingsByTest = new Map<string, { total: number; count: number }>();
      ratings?.forEach(r => {
        const existing = ratingsByTest.get(r.test_id) || { total: 0, count: 0 };
        existing.total += r.rating;
        existing.count++;
        ratingsByTest.set(r.test_id, existing);
      });

      tests?.forEach(test => {
        const testRating = ratingsByTest.get(test.id);
        if (testRating) {
          const creator = creatorStatsMap.get(test.user_id);
          if (creator && creator.total_tests > 0) {
            const currentTotal = creator.avg_rating * (creator.total_tests - 1);
            creator.avg_rating = (currentTotal + (testRating.total / testRating.count)) / creator.total_tests;
          }
        }
      });

      // Calculate student stats
      const studentStatsMap = new Map<string, StudentStats>();
      attempts?.forEach(attempt => {
        const existing = studentStatsMap.get(attempt.user_id) || {
          user_id: attempt.user_id,
          full_name: profilesMap.get(attempt.user_id)?.full_name || 'Unknown',
          avatar_url: profilesMap.get(attempt.user_id)?.avatar_url || null,
          total_attempts: 0,
          total_correct: 0,
          total_questions: 0,
          avg_score: 0,
        };
        existing.total_attempts++;
        existing.total_correct += attempt.score;
        existing.total_questions += attempt.total_questions;
        studentStatsMap.set(attempt.user_id, existing);
      });

      // Calculate average scores
      studentStatsMap.forEach(student => {
        if (student.total_questions > 0) {
          student.avg_score = (student.total_correct / student.total_questions) * 100;
        }
      });

      // Sort and set data
      const sortedCreators = Array.from(creatorStatsMap.values())
        .sort((a, b) => b.total_attempts - a.total_attempts)
        .slice(0, 10);

      const sortedStudents = Array.from(studentStatsMap.values())
        .sort((a, b) => b.avg_score - a.avg_score)
        .slice(0, 10);

      setCreators(sortedCreators);
      setStudents(sortedStudents);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (index === 1) return <Medal className="h-5 w-5 text-gray-400" />;
    if (index === 2) return <Award className="h-5 w-5 text-amber-600" />;
    return <span className="text-muted-foreground font-medium w-5 text-center">{index + 1}</span>;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <Skeleton key={i} className="h-14 w-full" />
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
          <Trophy className="h-5 w-5 text-primary" />
          Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="creators" className="w-full">
          <TabsList className="w-full mb-4">
            <TabsTrigger value="creators" className="flex-1 gap-2">
              <Users className="h-4 w-4" />
              Top Creators
            </TabsTrigger>
            <TabsTrigger value="students" className="flex-1 gap-2">
              <Target className="h-4 w-4" />
              Top Scorers
            </TabsTrigger>
          </TabsList>

          <TabsContent value="creators" className="space-y-2">
            {creators.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No data yet</p>
            ) : (
              creators.map((creator, index) => (
                <div
                  key={creator.user_id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="w-6 flex justify-center">{getRankIcon(index)}</div>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={creator.avatar_url || undefined} />
                    <AvatarFallback className="text-xs">
                      {getInitials(creator.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{creator.full_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {creator.total_tests} tests • {creator.total_attempts} attempts
                    </p>
                  </div>
                  {creator.avg_rating > 0 && (
                    <div className="text-right">
                      <p className="font-medium text-primary">{creator.avg_rating.toFixed(1)}★</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </TabsContent>

          <TabsContent value="students" className="space-y-2">
            {students.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No data yet</p>
            ) : (
              students.map((student, index) => (
                <div
                  key={student.user_id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="w-6 flex justify-center">{getRankIcon(index)}</div>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={student.avatar_url || undefined} />
                    <AvatarFallback className="text-xs">
                      {getInitials(student.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{student.full_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {student.total_attempts} tests taken
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-primary">{student.avg_score.toFixed(0)}%</p>
                    <p className="text-xs text-muted-foreground">
                      {student.total_correct}/{student.total_questions}
                    </p>
                  </div>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
