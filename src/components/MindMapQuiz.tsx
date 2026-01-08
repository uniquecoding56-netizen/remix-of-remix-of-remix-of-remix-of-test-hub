import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { 
  Loader2, Sparkles, Brain, Check, X, Trophy, 
  RotateCcw, Zap, ArrowRight
} from 'lucide-react';

interface MindMapQuizProps {
  content: string;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  concept: string;
}

export function MindMapQuiz({ content }: MindMapQuizProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [streak, setStreak] = useState(0);
  const [conceptMastery, setConceptMastery] = useState<Record<string, { correct: number; total: number }>>({});

  const generateQuiz = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Please sign in to generate quiz');
        return;
      }

      const response = await supabase.functions.invoke('study-tools-process', {
        body: { 
          type: 'generate',
          tool: 'concept-quiz',
          content 
        }
      });

      if (response.error) throw new Error(response.error.message);

      setQuestions(response.data.questions || []);
      setHasGenerated(true);
      setCurrentIndex(0);
      setScore(0);
      setStreak(0);
      setConceptMastery({});
      toast.success('Concept quiz ready!');
    } catch (error) {
      console.error('Quiz generation error:', error);
      toast.error('Failed to generate quiz');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswer = (index: number) => {
    if (showResult) return;
    
    setSelectedAnswer(index);
    setShowResult(true);
    
    const question = questions[currentIndex];
    const isCorrect = index === question.correctIndex;
    
    if (isCorrect) {
      setScore(prev => prev + 1);
      setStreak(prev => prev + 1);
    } else {
      setStreak(0);
    }

    // Track concept mastery
    setConceptMastery(prev => {
      const concept = question.concept;
      const current = prev[concept] || { correct: 0, total: 0 };
      return {
        ...prev,
        [concept]: {
          correct: current.correct + (isCorrect ? 1 : 0),
          total: current.total + 1
        }
      };
    });
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    }
  };

  const resetQuiz = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setStreak(0);
    setConceptMastery({});
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500/10 text-green-600';
      case 'medium': return 'bg-yellow-500/10 text-yellow-600';
      case 'hard': return 'bg-red-500/10 text-red-600';
      default: return 'bg-muted';
    }
  };

  if (!hasGenerated) {
    return (
      <div className="text-center py-8">
        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Brain className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-lg font-medium mb-2">Concept Mastery Quiz</h3>
        <p className="text-muted-foreground mb-4 max-w-md mx-auto">
          Test your understanding with AI-generated questions. Track your mastery of each concept and build a streak!
        </p>
        <Button onClick={generateQuiz} disabled={isLoading} size="lg">
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Start Concept Quiz
            </>
          )}
        </Button>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No questions generated. Try with different content.</p>
        <Button variant="outline" onClick={generateQuiz} className="mt-4">Try Again</Button>
      </div>
    );
  }

  const isQuizComplete = currentIndex === questions.length - 1 && showResult;
  const question = questions[currentIndex];
  const progressPercent = ((currentIndex + (showResult ? 1 : 0)) / questions.length) * 100;

  if (isQuizComplete) {
    return (
      <div className="space-y-6">
        <Card className="p-8 text-center">
          <Trophy className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">Quiz Complete!</h3>
          <p className="text-4xl font-bold text-primary mb-2">
            {score} / {questions.length}
          </p>
          <p className="text-muted-foreground mb-6">
            {score === questions.length ? 'Perfect score! 🎉' : 
             score >= questions.length * 0.8 ? 'Excellent work! 🌟' :
             score >= questions.length * 0.6 ? 'Good job! Keep practicing.' :
             'Keep studying and try again!'}
          </p>
        </Card>

        {/* Concept Mastery Breakdown */}
        <Card>
          <CardContent className="p-6">
            <h4 className="font-semibold mb-4">Concept Mastery</h4>
            <div className="space-y-3">
              {Object.entries(conceptMastery).map(([concept, data]) => (
                <div key={concept} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{concept}</span>
                    <span className="text-muted-foreground">{data.correct}/{data.total}</span>
                  </div>
                  <Progress value={(data.correct / data.total) * 100} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center gap-3">
          <Button onClick={resetQuiz} variant="outline">
            <RotateCcw className="h-4 w-4 mr-2" />
            Retry Quiz
          </Button>
          <Button onClick={generateQuiz}>
            <Sparkles className="h-4 w-4 mr-2" />
            New Quiz
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats Bar */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            Question {currentIndex + 1} of {questions.length}
          </span>
          <Badge className={getDifficultyColor(question.difficulty)}>
            {question.difficulty}
          </Badge>
        </div>
        <div className="flex items-center gap-3">
          {streak >= 2 && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Zap className="h-3 w-3 text-yellow-500" />
              {streak} streak!
            </Badge>
          )}
          <Badge variant="outline">
            Score: {score}
          </Badge>
        </div>
      </div>

      <Progress value={progressPercent} className="h-2" />

      {/* Concept Tag */}
      <Badge variant="secondary" className="text-xs">
        Concept: {question.concept}
      </Badge>

      {/* Question */}
      <Card className="p-6">
        <h3 className="text-lg font-medium mb-6">{question.question}</h3>
        
        <div className="space-y-3">
          {question.options.map((option, index) => {
            const isSelected = selectedAnswer === index;
            const isCorrect = index === question.correctIndex;
            
            let buttonClass = 'w-full justify-start text-left p-4 h-auto';
            if (showResult) {
              if (isCorrect) {
                buttonClass += ' bg-green-500/10 border-green-500 text-green-700';
              } else if (isSelected && !isCorrect) {
                buttonClass += ' bg-red-500/10 border-red-500 text-red-700';
              }
            }

            return (
              <Button
                key={index}
                variant="outline"
                className={buttonClass}
                onClick={() => handleAnswer(index)}
                disabled={showResult}
              >
                <span className="flex items-center gap-3 w-full">
                  <span className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium flex-shrink-0">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className="flex-1">{option}</span>
                  {showResult && isCorrect && <Check className="h-5 w-5 text-green-500" />}
                  {showResult && isSelected && !isCorrect && <X className="h-5 w-5 text-red-500" />}
                </span>
              </Button>
            );
          })}
        </div>
      </Card>

      {/* Explanation */}
      {showResult && (
        <Card className={selectedAnswer === question.correctIndex ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/5 border-red-500/20'}>
          <CardContent className="p-4">
            <p className="font-medium mb-1">
              {selectedAnswer === question.correctIndex ? '✅ Correct!' : '❌ Incorrect'}
            </p>
            <p className="text-sm text-muted-foreground">{question.explanation}</p>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      {showResult && (
        <div className="flex justify-center">
          <Button onClick={nextQuestion}>
            Next Question
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
}
