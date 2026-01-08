import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Target, CheckCircle, TrendingUp, BarChart3 } from 'lucide-react';

interface TestAnalytics {
  testId: string;
  title: string;
  totalAttempts: number;
  averageScore: number;
  completionRate: number;
}

interface OverallStats {
  totalTests: number;
  totalAttempts: number;
  overallAverageScore: number;
  overallCompletionRate: number;
}

export function CreatorAnalytics() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [testAnalytics, setTestAnalytics] = useState<TestAnalytics[]>([]);
  const [overallStats, setOverallStats] = useState<OverallStats>({
    totalTests: 0,
    totalAttempts: 0,
    overallAverageScore: 0,
    overallCompletionRate: 0,
  });

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user]);

  const fetchAnalytics = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Fetch user's tests
      const { data: testsData, error: testsError } = await supabase
        .from('tests')
        .select('id, title, questions')
        .eq('user_id', user.id);

      if (testsError) throw testsError;

      if (!testsData || testsData.length === 0) {
        setLoading(false);
        return;
      }

      const testIds = testsData.map(t => t.id);

      // Fetch all attempts for user's tests
      const { data: attemptsData, error: attemptsError } = await supabase
        .from('test_attempts')
        .select('test_id, score, total_questions')
        .in('test_id', testIds);

      if (attemptsError) throw attemptsError;

      // Calculate analytics per test
      const analytics: TestAnalytics[] = testsData.map(test => {
        const testAttempts = attemptsData?.filter(a => a.test_id === test.id) || [];
        const totalAttempts = testAttempts.length;
        
        if (totalAttempts === 0) {
          return {
            testId: test.id,
            title: test.title,
            totalAttempts: 0,
            averageScore: 0,
            completionRate: 0,
          };
        }

        const totalScore = testAttempts.reduce((sum, a) => sum + a.score, 0);
        const totalQuestions = testAttempts.reduce((sum, a) => sum + a.total_questions, 0);
        const averageScore = totalQuestions > 0 ? (totalScore / totalQuestions) * 100 : 0;
        
        // Completion rate is based on how many users got more than 50%
        const completedAttempts = testAttempts.filter(a => 
          a.total_questions > 0 && (a.score / a.total_questions) >= 0.5
        ).length;
        const completionRate = (completedAttempts / totalAttempts) * 100;

        return {
          testId: test.id,
          title: test.title,
          totalAttempts,
          averageScore,
          completionRate,
        };
      });

      setTestAnalytics(analytics);

      // Calculate overall stats
      const totalTests = testsData.length;
      const totalAttempts = attemptsData?.length || 0;
      
      let overallAverageScore = 0;
      let overallCompletionRate = 0;
      
      if (totalAttempts > 0) {
        const totalScore = attemptsData!.reduce((sum, a) => sum + a.score, 0);
        const totalQuestions = attemptsData!.reduce((sum, a) => sum + a.total_questions, 0);
        overallAverageScore = totalQuestions > 0 ? (totalScore / totalQuestions) * 100 : 0;
        
        const completedAttempts = attemptsData!.filter(a => 
          a.total_questions > 0 && (a.score / a.total_questions) >= 0.5
        ).length;
        overallCompletionRate = (completedAttempts / totalAttempts) * 100;
      }

      setOverallStats({
        totalTests,
        totalAttempts,
        overallAverageScore,
        overallCompletionRate,
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-28 rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-lg" />
      </div>
    );
  }

  if (overallStats.totalTests === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No analytics available. Create some tests first!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Tests
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallStats.totalTests}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Attempts
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallStats.totalAttempts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg. Score
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overallStats.overallAverageScore.toFixed(1)}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pass Rate
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overallStats.overallCompletionRate.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Per-Test Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Test Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {testAnalytics.map(test => (
              <div
                key={test.testId}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border border-border bg-muted/30 gap-4"
              >
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium truncate">{test.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {test.totalAttempts} {test.totalAttempts === 1 ? 'attempt' : 'attempts'}
                  </p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-lg font-semibold">{test.averageScore.toFixed(0)}%</p>
                    <p className="text-xs text-muted-foreground">Avg Score</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold">{test.completionRate.toFixed(0)}%</p>
                    <p className="text-xs text-muted-foreground">Pass Rate</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
