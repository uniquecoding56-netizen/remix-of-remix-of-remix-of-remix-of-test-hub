import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { GlowingEffect } from '@/components/ui/glowing-effect';
import { Sparkles, Play, Calendar, BookOpen, GraduationCap, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface DailyTest {
  id: string;
  title: string;
  description: string | null;
  class_standard: number | null;
  subject: string | null;
  topic: string | null;
  difficulty: string | null;
  questions: any[];
}

export function DailyAITestCard() {
  const navigate = useNavigate();
  const [dailyTest, setDailyTest] = useState<DailyTest | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchDailyTest();
  }, []);

  const fetchDailyTest = async () => {
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Check if daily test exists
      const { data: dailyData } = await supabase
        .from('daily_ai_tests')
        .select('test_id')
        .eq('generated_date', today)
        .maybeSingle();

      if (dailyData?.test_id) {
        // Fetch the test details
        const { data: testData } = await supabase
          .from('tests')
          .select('*')
          .eq('id', dailyData.test_id)
          .single();

        if (testData) {
          setDailyTest({
            ...testData,
            questions: testData.questions as any[],
          });
        }
      } else {
        // No daily test yet - trigger generation
        await generateDailyTest();
      }
    } catch (error) {
      console.error('Error fetching daily test:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateDailyTest = async () => {
    setGenerating(true);
    try {
      // Random class and subject for variety
      const classes = [6, 7, 8, 9, 10];
      const subjects = ['Mathematics', 'Science', 'English', 'Social Science'];
      const difficulties = ['easy', 'medium', 'hard'];
      
      const randomClass = classes[Math.floor(Math.random() * classes.length)];
      const randomSubject = subjects[Math.floor(Math.random() * subjects.length)];
      const randomDifficulty = difficulties[Math.floor(Math.random() * difficulties.length)];

      const { data, error } = await supabase.functions.invoke('generate-ai-test', {
        body: {
          classStandard: randomClass,
          subject: randomSubject,
          difficulty: randomDifficulty,
          questionCount: 10,
          isDaily: true,
        },
      });

      if (error) throw error;

      if (data?.testId) {
        // Fetch the generated test
        const { data: testData } = await supabase
          .from('tests')
          .select('*')
          .eq('id', data.testId)
          .single();

        if (testData) {
          setDailyTest({
            ...testData,
            questions: testData.questions as any[],
          });
        }
      }
    } catch (error) {
      console.error('Error generating daily test:', error);
      toast.error('Failed to generate daily test');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-primary/5 via-purple-500/5 to-pink-500/5 border-primary/20">
        <CardHeader className="pb-3">
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (generating) {
    return (
      <Card className="bg-gradient-to-br from-primary/5 via-purple-500/5 to-pink-500/5 border-primary/20">
        <CardContent className="py-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3 text-primary" />
          <p className="text-muted-foreground">Generating today's AI test...</p>
        </CardContent>
      </Card>
    );
  }

  if (!dailyTest) {
    return (
      <Card className="bg-gradient-to-br from-primary/5 via-purple-500/5 to-pink-500/5 border-primary/20">
        <CardContent className="py-8 text-center">
          <Sparkles className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground mb-3">No daily test available</p>
          <Button onClick={generateDailyTest} variant="outline" size="sm">
            Generate Now
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="relative">
      <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} />
      <Card className="relative bg-gradient-to-br from-primary/5 via-purple-500/5 to-pink-500/5 border-primary/20 overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-primary to-purple-600 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">by Artificial Intelligence</p>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </div>
            </div>
            <Badge className="bg-gradient-to-r from-primary to-purple-600 text-white border-0">
              🤖 Auto Generated Daily
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg text-foreground mb-1">{dailyTest.title}</h3>
            {dailyTest.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">{dailyTest.description}</p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {dailyTest.class_standard && (
              <Badge variant="outline" className="gap-1">
                <GraduationCap className="h-3 w-3" />
                Class {dailyTest.class_standard}
              </Badge>
            )}
            {dailyTest.subject && (
              <Badge variant="outline" className="gap-1">
                <BookOpen className="h-3 w-3" />
                {dailyTest.subject}
              </Badge>
            )}
            {dailyTest.difficulty && (
              <Badge variant="secondary" className="capitalize">
                {dailyTest.difficulty}
              </Badge>
            )}
            <Badge variant="outline">
              {dailyTest.questions?.length || 0} Questions
            </Badge>
          </div>

          <Button 
            onClick={() => navigate(`/test/${dailyTest.id}`)}
            className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
          >
            <Play className="h-4 w-4 mr-2" />
            Take Today's Challenge
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
