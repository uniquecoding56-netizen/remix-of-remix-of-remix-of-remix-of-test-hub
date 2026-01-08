import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { RatingDialog } from '@/components/RatingDialog';
import { ArrowLeft, ArrowRight, CheckCircle, XCircle, Home, RotateCcw, Timer, AlertTriangle, Download } from 'lucide-react';
import { Question } from '@/types/test';
import { toast } from 'sonner';
import { generateTestPDF } from '@/utils/generatePDF';

interface TestData {
  id: string;
  title: string;
  description: string | null;
  questions: Question[];
  user_id: string;
  timer_seconds: number | null;
}

export default function TakeTest() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [test, setTest] = useState<TestData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isTimerActive, setIsTimerActive] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (id && user) {
      fetchTest();
    }
  }, [id, user]);

  const fetchTest = async () => {
    if (!id) return;
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('tests')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      const testData = {
        ...data,
        questions: data.questions as unknown as Question[],
        timer_seconds: data.timer_seconds,
      };
      setTest(testData);
      
      // Initialize timer if test has timer
      if (testData.timer_seconds && testData.timer_seconds > 0) {
        setTimeRemaining(testData.timer_seconds);
        setIsTimerActive(true);
      }
    } catch (error) {
      toast.error('Test not found');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  // Timer countdown effect
  useEffect(() => {
    if (!isTimerActive || timeRemaining === null || isCompleted) return;

    if (timeRemaining <= 0) {
      handleSubmit();
      toast.warning('Time is up! Test submitted automatically.');
      return;
    }

    const interval = setInterval(() => {
      setTimeRemaining(prev => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimerActive, timeRemaining, isCompleted]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswer = (questionId: string, answerIndex: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answerIndex }));
  };

  const handleNext = () => {
    if (currentQuestion < (test?.questions.length || 0) - 1) {
      setCurrentQuestion((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    }
  };

  const handleSubmit = useCallback(async () => {
    if (!test || !user) return;

    // Stop timer
    setIsTimerActive(false);

    // Calculate score
    let correctCount = 0;
    test.questions.forEach((q) => {
      if (answers[q.id] === q.correctAnswer) {
        correctCount++;
      }
    });

    setScore(correctCount);
    setIsCompleted(true);

    // Save attempt
    try {
      await supabase.from('test_attempts').insert({
        user_id: user.id,
        test_id: test.id,
        score: correctCount,
        total_questions: test.questions.length,
        answers,
      });

      // Show rating dialog if not the owner
      if (test.user_id !== user.id) {
        // Check if already rated
        const { data: existingRating } = await supabase
          .from('ratings')
          .select('id')
          .eq('user_id', user.id)
          .eq('test_id', test.id)
          .maybeSingle();

        if (!existingRating) {
          setShowRating(true);
        }
      }
    } catch (error) {
      console.error('Error saving attempt:', error);
    }
  }, [test, user, answers]);

  const handleRetry = () => {
    setAnswers({});
    setCurrentQuestion(0);
    setIsCompleted(false);
    setScore(0);
    // Reset timer
    if (test?.timer_seconds && test.timer_seconds > 0) {
      setTimeRemaining(test.timer_seconds);
      setIsTimerActive(true);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!test) return null;

  const question = test.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / test.questions.length) * 100;
  const allAnswered = test.questions.every((q) => answers[q.id] !== undefined);

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-background py-8 px-4">
        <div className="container max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Test Complete!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center py-8">
                <div className="text-6xl font-bold text-primary mb-2">
                  {score}/{test.questions.length}
                </div>
                <p className="text-muted-foreground">
                  {Math.round((score / test.questions.length) * 100)}% correct
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Review Answers</h3>
                {test.questions.map((q, index) => {
                  const userAnswer = answers[q.id];
                  const isCorrect = userAnswer === q.correctAnswer;
                  return (
                    <div
                      key={q.id}
                      className={`p-4 rounded-lg border ${
                        isCorrect ? 'border-green-500/50 bg-green-500/5' : 'border-destructive/50 bg-destructive/5'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {isCorrect ? (
                          <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <p className="font-medium mb-2">
                            {index + 1}. {q.question}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Your answer: {q.options[userAnswer] || 'Not answered'}
                          </p>
                          {!isCorrect && (
                            <p className="text-sm text-green-600 dark:text-green-400">
                              Correct answer: {q.options[q.correctAnswer]}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-col gap-3 pt-4">
                <Button 
                  onClick={() => generateTestPDF({
                    title: test.title,
                    description: test.description,
                    questions: test.questions,
                    answers,
                    score,
                    totalQuestions: test.questions.length,
                    completedAt: new Date(),
                  })}
                  className="w-full"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF Report
                </Button>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => navigate('/dashboard')} className="flex-1">
                    <Home className="h-4 w-4 mr-2" />
                    Dashboard
                  </Button>
                  <Button variant="secondary" onClick={handleRetry} className="flex-1">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Retry Test
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <RatingDialog
            testId={test.id}
            testTitle={test.title}
            open={showRating}
            onOpenChange={setShowRating}
            onSuccess={() => setShowRating(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container max-w-2xl mx-auto">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-2xl font-bold text-foreground">{test.title}</h1>
          {test.description && (
            <p className="text-muted-foreground mt-1">{test.description}</p>
          )}
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">
              Question {currentQuestion + 1} of {test.questions.length}
            </span>
            <div className="flex items-center gap-3">
              {timeRemaining !== null && (
                <Badge 
                  variant={timeRemaining <= 60 ? "destructive" : "outline"} 
                  className="gap-1 text-sm"
                >
                  <Timer className="h-3 w-3" />
                  {formatTime(timeRemaining)}
                  {timeRemaining <= 60 && <AlertTriangle className="h-3 w-3" />}
                </Badge>
              )}
              <Badge variant="outline">
                {Object.keys(answers).length}/{test.questions.length} answered
              </Badge>
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{question.question}</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={answers[question.id]?.toString() || ''}
              onValueChange={(value) => handleAnswer(question.id, parseInt(value))}
            >
              {question.options.map((option, index) => (
                <div
                  key={index}
                  className={`flex items-center space-x-3 p-4 rounded-lg border transition-colors cursor-pointer ${
                    answers[question.id] === index
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => handleAnswer(question.id, index)}
                >
                  <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          {currentQuestion === test.questions.length - 1 ? (
            <Button onClick={handleSubmit} disabled={!allAnswered}>
              Submit Test
            </Button>
          ) : (
            <Button onClick={handleNext}>
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
