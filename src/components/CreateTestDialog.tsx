import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Trash2, Loader2, Timer } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Question, TestCategory, CATEGORY_LABELS } from '@/types/test';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CreateTestDialogProps {
  onSuccess: () => void;
}

export function CreateTestDialog({ onSuccess }: CreateTestDialogProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TestCategory>('other');
  const [hasTimer, setHasTimer] = useState(false);
  const [timerMinutes, setTimerMinutes] = useState(10);
  const [questions, setQuestions] = useState<Omit<Question, 'id'>[]>([
    { question: '', options: ['', '', '', ''], correctAnswer: 0 },
  ]);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { question: '', options: ['', '', '', ''], correctAnswer: 0 },
    ]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const updateQuestion = (index: number, field: string, value: string | number) => {
    const updated = [...questions];
    if (field === 'question') {
      updated[index].question = value as string;
    } else if (field === 'correctAnswer') {
      updated[index].correctAnswer = value as number;
    }
    setQuestions(updated);
  };

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const updated = [...questions];
    updated[questionIndex].options[optionIndex] = value;
    setQuestions(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Validation
    if (!title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    const validQuestions = questions.every(
      (q) => q.question.trim() && q.options.every((o) => o.trim())
    );
    if (!validQuestions) {
      toast.error('Please fill in all questions and options');
      return;
    }

    setIsLoading(true);

    try {
      const questionsWithIds: Question[] = questions.map((q, index) => ({
        ...q,
        id: `q-${index}-${Date.now()}`,
      }));

      const { error } = await supabase.from('tests').insert([{
        user_id: user.id,
        title: title.trim(),
        description: description.trim() || null,
        category,
        timer_seconds: hasTimer ? timerMinutes * 60 : null,
        questions: JSON.parse(JSON.stringify(questionsWithIds)),
      }]);

      if (error) throw error;

      toast.success('Test created successfully!');
      setOpen(false);
      resetForm();
      onSuccess();
    } catch (error) {
      toast.error('Failed to create test');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory('other');
    setHasTimer(false);
    setTimerMinutes(10);
    setQuestions([{ question: '', options: ['', '', '', ''], correctAnswer: 0 }]);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Test
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Test</DialogTitle>
          <DialogDescription>
            Add questions with multiple choice answers. Mark the correct answer for each question.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1">
          <ScrollArea className="h-[60vh] pr-4">
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Test Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Biology Chapter 5 Quiz"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={category} onValueChange={(v) => setCategory(v as TestCategory)}>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.entries(CATEGORY_LABELS) as [TestCategory, string][]).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Briefly describe what this test covers..."
                  rows={2}
                />
              </div>

              <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <Timer className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <Label htmlFor="timer-switch" className="cursor-pointer">Enable Timer</Label>
                    <p className="text-xs text-muted-foreground">Auto-submit when time runs out</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {hasTimer && (
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={timerMinutes}
                        onChange={(e) => setTimerMinutes(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-20"
                        min={1}
                        max={180}
                      />
                      <span className="text-sm text-muted-foreground">min</span>
                    </div>
                  )}
                  <Switch
                    id="timer-switch"
                    checked={hasTimer}
                    onCheckedChange={setHasTimer}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Questions</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addQuestion}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Question
                  </Button>
                </div>

                {questions.map((q, qIndex) => (
                  <div
                    key={qIndex}
                    className="border border-border rounded-lg p-4 space-y-4 bg-card"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 space-y-2">
                        <Label>Question {qIndex + 1}</Label>
                        <Input
                          value={q.question}
                          onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                          placeholder="Enter your question..."
                          required
                        />
                      </div>
                      {questions.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeQuestion(qIndex)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Options (select the correct answer)</Label>
                      <RadioGroup
                        value={q.correctAnswer.toString()}
                        onValueChange={(value) =>
                          updateQuestion(qIndex, 'correctAnswer', parseInt(value))
                        }
                      >
                        {q.options.map((option, oIndex) => (
                          <div key={oIndex} className="flex items-center gap-2">
                            <RadioGroupItem value={oIndex.toString()} id={`q${qIndex}-o${oIndex}`} />
                            <Input
                              value={option}
                              onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                              placeholder={`Option ${oIndex + 1}`}
                              className="flex-1"
                              required
                            />
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Test'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
