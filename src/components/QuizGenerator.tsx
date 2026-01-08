import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, Loader2, Sparkles, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

interface QuizGeneratorProps {
  content: string;
}

export function QuizGenerator({ content }: QuizGeneratorProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);

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
          tool: 'quiz',
          content 
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      setQuestions(response.data.questions);
      setHasGenerated(true);
      setCurrentIndex(0);
      setScore(0);
      setIsComplete(false);
      setSelectedAnswer(null);
      setShowResult(false);
      toast.success(`Generated ${response.data.questions.length} questions!`);
    } catch (error) {
      console.error('Quiz generation error:', error);
      toast.error('Failed to generate quiz. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;
    
    setShowResult(true);
    if (selectedAnswer === questions[currentIndex].correctIndex) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setIsComplete(true);
    }
  };

  const resetQuiz = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setIsComplete(false);
  };

  if (!hasGenerated) {
    return (
      <div className="text-center py-8">
        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Sparkles className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-lg font-medium mb-2">Generate Quiz</h3>
        <p className="text-muted-foreground mb-4">
          Create a multiple-choice quiz from your content to test your knowledge.
        </p>
        <Button onClick={generateQuiz} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Quiz
            </>
          )}
        </Button>
      </div>
    );
  }

  if (isComplete) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <div className="text-center py-8">
        <div className={`h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
          percentage >= 70 ? 'bg-green-100 dark:bg-green-900/30' : 'bg-yellow-100 dark:bg-yellow-900/30'
        }`}>
          {percentage >= 70 ? (
            <CheckCircle className="h-10 w-10 text-green-600" />
          ) : (
            <span className="text-3xl">📚</span>
          )}
        </div>
        <h3 className="text-2xl font-bold mb-2">Quiz Complete!</h3>
        <p className="text-lg mb-4">
          You scored <span className="font-bold text-primary">{score}</span> out of {questions.length} ({percentage}%)
        </p>
        <p className="text-muted-foreground mb-6">
          {percentage >= 90 ? "Excellent! You've mastered this content! 🌟" :
           percentage >= 70 ? "Great job! Keep up the good work! 👏" :
           percentage >= 50 ? "Good effort! Review the content and try again! 💪" :
           "Don't give up! Review the material and give it another shot! 📖"}
        </p>
        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={resetQuiz}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Retry Quiz
          </Button>
          <Button onClick={generateQuiz} disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
            New Quiz
          </Button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <div className="space-y-4">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Question {currentIndex + 1} of {questions.length}</span>
          <span>Score: {score}</span>
        </div>
        <Progress value={(currentIndex / questions.length) * 100} />
      </div>

      {/* Question */}
      <Card>
        <CardContent className="p-6">
          <p className="text-lg font-medium mb-4">{currentQuestion.question}</p>
          
          <RadioGroup
            value={selectedAnswer?.toString()}
            onValueChange={(val) => !showResult && setSelectedAnswer(parseInt(val))}
            className="space-y-3"
          >
            {currentQuestion.options.map((option, index) => (
              <div
                key={index}
                className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
                  showResult
                    ? index === currentQuestion.correctIndex
                      ? 'bg-green-50 border-green-500 dark:bg-green-900/20'
                      : selectedAnswer === index
                      ? 'bg-red-50 border-red-500 dark:bg-red-900/20'
                      : ''
                    : selectedAnswer === index
                    ? 'border-primary bg-primary/5'
                    : 'hover:border-primary/50'
                }`}
              >
                <RadioGroupItem 
                  value={index.toString()} 
                  id={`option-${index}`}
                  disabled={showResult}
                />
                <Label 
                  htmlFor={`option-${index}`} 
                  className="flex-1 cursor-pointer"
                >
                  {option}
                </Label>
                {showResult && index === currentQuestion.correctIndex && (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                )}
                {showResult && selectedAnswer === index && index !== currentQuestion.correctIndex && (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
              </div>
            ))}
          </RadioGroup>

          {showResult && currentQuestion.explanation && (
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <p className="text-sm">
                <strong>Explanation:</strong> {currentQuestion.explanation}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        {!showResult ? (
          <Button onClick={handleSubmitAnswer} disabled={selectedAnswer === null}>
            Submit Answer
          </Button>
        ) : (
          <Button onClick={handleNext}>
            {currentIndex < questions.length - 1 ? 'Next Question' : 'See Results'}
          </Button>
        )}
      </div>
    </div>
  );
}
