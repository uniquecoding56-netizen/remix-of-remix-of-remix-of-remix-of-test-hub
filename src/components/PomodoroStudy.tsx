import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { 
  Loader2, Sparkles, Timer, Play, Pause, RotateCcw, 
  Brain, Trophy, Zap, Target, Clock
} from 'lucide-react';

interface PomodoroStudyProps {
  content: string;
}

interface StudySession {
  topic: string;
  duration: number;
  questionsToReview: string[];
  breakActivity: string;
}

export function PomodoroStudy({ content }: PomodoroStudyProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [session, setSession] = useState<StudySession | null>(null);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes
  const [isRunning, setIsRunning] = useState(false);
  const [sessionType, setSessionType] = useState<'study' | 'break'>('study');
  const [completedSessions, setCompletedSessions] = useState(0);
  const [studyDuration, setStudyDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

  const generateSession = async () => {
    setIsLoading(true);
    try {
      const { data: { session: authSession } } = await supabase.auth.getSession();
      if (!authSession) {
        toast.error('Please sign in to use Pomodoro Study');
        return;
      }

      const response = await supabase.functions.invoke('study-tools-process', {
        body: { 
          type: 'generate',
          tool: 'pomodoro',
          content,
          duration: studyDuration
        }
      });

      if (response.error) throw new Error(response.error.message);

      setSession(response.data);
      setTimeLeft(studyDuration * 60);
      setSessionType('study');
      toast.success('Study session prepared!');
    } catch (error) {
      console.error('Pomodoro generation error:', error);
      // Fallback session
      setSession({
        topic: 'Study Session',
        duration: studyDuration,
        questionsToReview: [
          'Review the main concepts from your material',
          'Try to explain the key ideas in your own words',
          'Identify any areas you need to revisit'
        ],
        breakActivity: 'Stand up, stretch, and take a few deep breaths'
      });
      setTimeLeft(studyDuration * 60);
      toast.success('Study session ready!');
    } finally {
      setIsLoading(false);
    }
  };

  const startTimer = () => {
    if (intervalId) return;
    
    setIsRunning(true);
    const id = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(id);
          setIntervalId(null);
          setIsRunning(false);
          handleSessionEnd();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    setIntervalId(id);
  };

  const pauseTimer = () => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
    setIsRunning(false);
  };

  const resetTimer = () => {
    pauseTimer();
    setTimeLeft(sessionType === 'study' ? studyDuration * 60 : breakDuration * 60);
  };

  const handleSessionEnd = () => {
    if (sessionType === 'study') {
      setCompletedSessions(prev => prev + 1);
      toast.success('Great work! Time for a break! 🎉');
      setSessionType('break');
      setTimeLeft(breakDuration * 60);
    } else {
      toast.success('Break over! Ready to study again? 📚');
      setSessionType('study');
      setTimeLeft(studyDuration * 60);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = sessionType === 'study' 
    ? ((studyDuration * 60 - timeLeft) / (studyDuration * 60)) * 100
    : ((breakDuration * 60 - timeLeft) / (breakDuration * 60)) * 100;

  if (!session) {
    return (
      <div className="text-center py-8">
        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Timer className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-lg font-medium mb-2">Pomodoro Study Timer</h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Stay focused with timed study sessions. AI generates review questions and break activities based on your content.
        </p>
        
        <div className="max-w-xs mx-auto space-y-4 mb-6">
          <div className="space-y-2">
            <Label className="text-sm">Study Duration: {studyDuration} min</Label>
            <Slider 
              value={[studyDuration]} 
              onValueChange={([v]) => setStudyDuration(v)}
              min={15} 
              max={60} 
              step={5}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Break Duration: {breakDuration} min</Label>
            <Slider 
              value={[breakDuration]} 
              onValueChange={([v]) => setBreakDuration(v)}
              min={3} 
              max={15} 
              step={1}
            />
          </div>
        </div>

        <Button onClick={generateSession} disabled={isLoading} size="lg">
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Preparing...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Start Pomodoro Session
            </>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Session Stats */}
      <div className="flex justify-center gap-4">
        <Badge variant="secondary" className="flex items-center gap-1 px-3 py-1">
          <Trophy className="h-3 w-3 text-yellow-500" />
          {completedSessions} sessions
        </Badge>
        <Badge variant={sessionType === 'study' ? 'default' : 'secondary'} className="px-3 py-1">
          {sessionType === 'study' ? '📚 Study Time' : '☕ Break Time'}
        </Badge>
      </div>

      {/* Timer Display */}
      <Card className={`p-8 text-center ${sessionType === 'break' ? 'bg-green-500/5 border-green-500/20' : ''}`}>
        <CardContent className="p-0">
          <div className="text-6xl md:text-7xl font-mono font-bold text-foreground mb-4">
            {formatTime(timeLeft)}
          </div>
          <Progress value={progress} className="h-2 mb-6" />
          
          <div className="flex justify-center gap-3">
            {!isRunning ? (
              <Button onClick={startTimer} size="lg" className="gap-2">
                <Play className="h-5 w-5" />
                Start
              </Button>
            ) : (
              <Button onClick={pauseTimer} variant="outline" size="lg" className="gap-2">
                <Pause className="h-5 w-5" />
                Pause
              </Button>
            )}
            <Button onClick={resetTimer} variant="outline" size="lg">
              <RotateCcw className="h-5 w-5" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Session Content */}
      {sessionType === 'study' ? (
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold flex items-center gap-2 mb-4">
              <Brain className="h-5 w-5 text-primary" />
              Questions to Review
            </h3>
            <ul className="space-y-3">
              {session.questionsToReview.map((q, i) => (
                <li key={i} className="flex gap-3 items-start">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm flex-shrink-0">
                    {i + 1}
                  </span>
                  <span className="text-muted-foreground">{q}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-green-500/5 border-green-500/20">
          <CardContent className="p-6 text-center">
            <h3 className="font-semibold flex items-center justify-center gap-2 mb-3">
              <Zap className="h-5 w-5 text-green-500" />
              Break Activity
            </h3>
            <p className="text-muted-foreground">{session.breakActivity}</p>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="flex justify-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => {
          setSession(null);
          pauseTimer();
          setTimeLeft(studyDuration * 60);
        }}>
          <RotateCcw className="h-4 w-4 mr-1" />
          New Session
        </Button>
      </div>
    </div>
  );
}
