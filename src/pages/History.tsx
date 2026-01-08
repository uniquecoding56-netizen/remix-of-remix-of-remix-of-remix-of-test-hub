import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, 
  Trophy, 
  Target, 
  TrendingUp, 
  Calendar,
  CheckCircle,
  XCircle,
  BarChart3
} from 'lucide-react';

interface AttemptWithTest {
  id: string;
  score: number;
  total_questions: number;
  completed_at: string;
  test_id: string;
  test_title: string;
  test_category: string;
}

interface PerformanceStats {
  totalAttempts: number;
  totalCorrect: number;
  totalQuestions: number;
  averageScore: number;
  bestScore: number;
  categoryPerformance: Record<string, { correct: number; total: number }>;
}

export default function History() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [attempts, setAttempts] = useState<AttemptWithTest[]>([]);
  const [stats, setStats] = useState<PerformanceStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchHistory();
    }
  }, [user]);

  const fetchHistory = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Fetch all attempts for the user
      const { data: attemptsData, error: attemptsError } = await supabase
        .from('test_attempts')
        .select('id, score, total_questions, completed_at, test_id')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false });

      if (attemptsError) throw attemptsError;

      // Fetch test details
      const testIds = [...new Set(attemptsData?.map(a => a.test_id) || [])];
      const { data: testsData } = await supabase
        .from('tests')
        .select('id, title, category')
        .in('id', testIds);

      const testsMap = new Map(testsData?.map(t => [t.id, t]) || []);

      // Combine data
      const attemptsWithTests: AttemptWithTest[] = (attemptsData || []).map(attempt => {
        const test = testsMap.get(attempt.test_id);
        return {
          ...attempt,
          test_title: test?.title || 'Unknown Test',
          test_category: test?.category || 'other',
        };
      });

      setAttempts(attemptsWithTests);

      // Calculate stats
      if (attemptsWithTests.length > 0) {
        const totalCorrect = attemptsWithTests.reduce((sum, a) => sum + a.score, 0);
        const totalQuestions = attemptsWithTests.reduce((sum, a) => sum + a.total_questions, 0);
        const scores = attemptsWithTests.map(a => (a.score / a.total_questions) * 100);
        
        const categoryPerformance: Record<string, { correct: number; total: number }> = {};
        attemptsWithTests.forEach(a => {
          if (!categoryPerformance[a.test_category]) {
            categoryPerformance[a.test_category] = { correct: 0, total: 0 };
          }
          categoryPerformance[a.test_category].correct += a.score;
          categoryPerformance[a.test_category].total += a.total_questions;
        });

        setStats({
          totalAttempts: attemptsWithTests.length,
          totalCorrect,
          totalQuestions,
          averageScore: totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0,
          bestScore: Math.max(...scores),
          categoryPerformance,
        });
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      math: 'Math',
      science: 'Science',
      history: 'History',
      english: 'English',
      geography: 'Geography',
      languages: 'Languages',
      computer_science: 'Computer Science',
      arts: 'Arts',
      music: 'Music',
      sports: 'Sports',
      other: 'Other',
    };
    return labels[category] || 'Other';
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container max-w-4xl mx-auto">
        <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Your Performance History</h1>
          <p className="text-muted-foreground">Track your progress and see how you're improving</p>
        </div>

        {loading ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
            <Skeleton className="h-64" />
          </div>
        ) : attempts.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium mb-2">No attempts yet</h3>
              <p className="text-muted-foreground mb-4">
                Start taking tests to see your performance history here
              </p>
              <Button onClick={() => navigate('/dashboard')}>
                Browse Tests
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-primary/10">
                      <Target className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats?.totalAttempts}</p>
                      <p className="text-xs text-muted-foreground">Tests Taken</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-green-500/10">
                      <TrendingUp className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats?.averageScore.toFixed(0)}%</p>
                      <p className="text-xs text-muted-foreground">Average Score</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-yellow-500/10">
                      <Trophy className="h-5 w-5 text-yellow-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats?.bestScore.toFixed(0)}%</p>
                      <p className="text-xs text-muted-foreground">Best Score</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-blue-500/10">
                      <CheckCircle className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats?.totalCorrect}/{stats?.totalQuestions}</p>
                      <p className="text-xs text-muted-foreground">Correct Answers</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Category Performance */}
            {stats && Object.keys(stats.categoryPerformance).length > 0 && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Performance by Category
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(stats.categoryPerformance).map(([category, perf]) => {
                    const percentage = perf.total > 0 ? (perf.correct / perf.total) * 100 : 0;
                    return (
                      <div key={category}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium">{getCategoryLabel(category)}</span>
                          <span className="text-muted-foreground">
                            {perf.correct}/{perf.total} ({percentage.toFixed(0)}%)
                          </span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            )}

            {/* Attempt History */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Recent Attempts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {attempts.map(attempt => {
                  const percentage = (attempt.score / attempt.total_questions) * 100;
                  const isPassing = percentage >= 60;
                  
                  return (
                    <div
                      key={attempt.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-full ${isPassing ? 'bg-green-500/10' : 'bg-destructive/10'}`}>
                          {isPassing ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-destructive" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{attempt.test_title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {getCategoryLabel(attempt.test_category)}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(attempt.completed_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-bold ${isPassing ? 'text-green-500' : 'text-destructive'}`}>
                          {percentage.toFixed(0)}%
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {attempt.score}/{attempt.total_questions}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
