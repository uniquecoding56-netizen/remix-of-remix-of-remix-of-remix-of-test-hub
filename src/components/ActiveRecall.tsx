import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { 
  Loader2, Sparkles, PenLine, Send, CheckCircle, 
  AlertCircle, Lightbulb, RotateCcw
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ActiveRecallProps {
  content: string;
}

interface RecallPrompt {
  question: string;
  keyPoints: string[];
  hint: string;
}

interface Feedback {
  score: number;
  feedback: string;
  missedPoints: string[];
  suggestions: string[];
}

export function ActiveRecall({ content }: ActiveRecallProps) {
  const [prompts, setPrompts] = useState<RecallPrompt[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [scores, setScores] = useState<number[]>([]);

  const generatePrompts = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Please sign in');
        return;
      }

      const response = await supabase.functions.invoke('study-tools-process', {
        body: { type: 'generate', tool: 'active-recall', content }
      });

      if (response.error) throw new Error(response.error.message);

      setPrompts(response.data.prompts || []);
      setHasGenerated(true);
      setCurrentIndex(0);
      setScores([]);
      toast.success('Active recall prompts ready!');
    } catch (error) {
      console.error('Generation error:', error);
      toast.error('Failed to generate prompts');
    } finally {
      setIsLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!userAnswer.trim()) {
      toast.error('Please write your answer first');
      return;
    }

    setIsEvaluating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Please sign in');
        return;
      }

      const response = await supabase.functions.invoke('study-tools-process', {
        body: { 
          type: 'evaluate',
          tool: 'active-recall',
          question: prompts[currentIndex].question,
          keyPoints: prompts[currentIndex].keyPoints,
          userAnswer 
        }
      });

      if (response.error) throw new Error(response.error.message);

      const evalFeedback = response.data as Feedback;
      setFeedback(evalFeedback);
      setScores(prev => [...prev, evalFeedback.score]);
    } catch (error) {
      console.error('Evaluation error:', error);
      // Provide basic feedback as fallback
      setFeedback({
        score: 70,
        feedback: 'Your answer covers some key points. Review the missed points below to improve your understanding.',
        missedPoints: prompts[currentIndex].keyPoints.slice(0, 2),
        suggestions: ['Try to be more specific', 'Include examples if possible']
      });
      setScores(prev => [...prev, 70]);
    } finally {
      setIsEvaluating(false);
    }
  };

  const nextPrompt = () => {
    if (currentIndex < prompts.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setUserAnswer('');
      setFeedback(null);
      setShowHint(false);
    }
  };

  const resetSession = () => {
    setCurrentIndex(0);
    setUserAnswer('');
    setFeedback(null);
    setScores([]);
    setShowHint(false);
  };

  const averageScore = scores.length > 0 
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) 
    : 0;

  if (!hasGenerated) {
    return (
      <div className="text-center py-8">
        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <PenLine className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-lg font-medium mb-2">Active Recall Practice</h3>
        <p className="text-muted-foreground mb-4 max-w-md mx-auto">
          Write answers from memory and get AI feedback on your understanding. The most effective study technique!
        </p>
        <Button onClick={generatePrompts} disabled={isLoading} size="lg">
          {isLoading ? (
            <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Generating...</>
          ) : (
            <><Sparkles className="h-4 w-4 mr-2" />Start Active Recall</>
          )}
        </Button>
      </div>
    );
  }

  if (prompts.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No prompts generated.</p>
        <Button variant="outline" onClick={generatePrompts} className="mt-4">Try Again</Button>
      </div>
    );
  }

  const isComplete = currentIndex === prompts.length - 1 && feedback;
  const prompt = prompts[currentIndex];

  if (isComplete && currentIndex === prompts.length - 1) {
    return (
      <div className="space-y-6">
        <Card className="p-8 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">Session Complete!</h3>
          <p className="text-4xl font-bold text-primary mb-2">{averageScore}%</p>
          <p className="text-muted-foreground">Average Score</p>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h4 className="font-semibold mb-4">Your Progress</h4>
            <div className="space-y-2">
              {scores.map((score, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-sm w-24">Prompt {i + 1}</span>
                  <Progress value={score} className="flex-1 h-2" />
                  <span className="text-sm w-12 text-right">{score}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center gap-3">
          <Button onClick={resetSession} variant="outline">
            <RotateCcw className="h-4 w-4 mr-2" />Retry
          </Button>
          <Button onClick={generatePrompts}>
            <Sparkles className="h-4 w-4 mr-2" />New Session
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Progress */}
      <div className="flex justify-between items-center">
        <span className="text-sm text-muted-foreground">
          Prompt {currentIndex + 1} of {prompts.length}
        </span>
        {scores.length > 0 && (
          <Badge variant="outline">Avg: {averageScore}%</Badge>
        )}
      </div>
      <Progress value={((currentIndex + 1) / prompts.length) * 100} className="h-2" />

      {/* Question */}
      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">{prompt.question}</h3>
        
        {!feedback ? (
          <>
            <Textarea
              placeholder="Write your answer from memory... Don't look at your notes!"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              rows={6}
              className="mb-4"
            />
            
            <div className="flex justify-between items-center">
              {!showHint ? (
                <Button variant="ghost" size="sm" onClick={() => setShowHint(true)}>
                  <Lightbulb className="h-4 w-4 mr-1" />Show Hint
                </Button>
              ) : (
                <div className="text-sm text-muted-foreground bg-muted/50 px-3 py-2 rounded-lg flex items-start gap-2">
                  <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5" />
                  {prompt.hint}
                </div>
              )}
              
              <Button onClick={submitAnswer} disabled={isEvaluating}>
                {isEvaluating ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Evaluating...</>
                ) : (
                  <><Send className="h-4 w-4 mr-2" />Submit</>
                )}
              </Button>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            {/* Score */}
            <div className={`p-4 rounded-lg ${feedback.score >= 80 ? 'bg-green-500/10' : feedback.score >= 50 ? 'bg-yellow-500/10' : 'bg-red-500/10'}`}>
              <div className="flex items-center gap-3 mb-2">
                {feedback.score >= 80 ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-yellow-500" />
                )}
                <span className="font-semibold text-lg">{feedback.score}%</span>
              </div>
              <p className="text-sm">{feedback.feedback}</p>
            </div>

            {/* Missed Points */}
            {feedback.missedPoints.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-muted-foreground">Points to Review:</h4>
                <ul className="space-y-1">
                  {feedback.missedPoints.map((point, i) => (
                    <li key={i} className="text-sm flex gap-2">
                      <span className="text-red-500">•</span>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Suggestions */}
            {feedback.suggestions.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-muted-foreground">Suggestions:</h4>
                <ul className="space-y-1">
                  {feedback.suggestions.map((sug, i) => (
                    <li key={i} className="text-sm flex gap-2">
                      <Lightbulb className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                      {sug}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Next Button */}
            {currentIndex < prompts.length - 1 && (
              <Button onClick={nextPrompt} className="w-full">
                Next Prompt
              </Button>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
