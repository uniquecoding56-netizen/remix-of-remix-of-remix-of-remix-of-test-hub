import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
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
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import {
  CLASS_STANDARDS,
  DIFFICULTY_LEVELS,
  DIFFICULTY_LABELS,
  getSubjectsForClass,
  getChaptersForSubject,
  type ClassStandard,
  type DifficultyLevel,
} from '@/data/cbseData';

export function AITestGeneratorDialog() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [classStandard, setClassStandard] = useState<ClassStandard | null>(null);
  const [subject, setSubject] = useState<string>('');
  const [selectedChapters, setSelectedChapters] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('medium');
  const [questionCount, setQuestionCount] = useState<number>(10);

  const subjects = classStandard ? getSubjectsForClass(classStandard) : [];
  const chapters = classStandard && subject ? getChaptersForSubject(classStandard, subject) : [];

  const handleClassChange = (value: string) => {
    const cls = parseInt(value) as ClassStandard;
    setClassStandard(cls);
    setSubject('');
    setSelectedChapters([]);
  };

  const handleSubjectChange = (value: string) => {
    setSubject(value);
    setSelectedChapters([]);
  };

  const handleChapterToggle = (chapter: string) => {
    setSelectedChapters(prev =>
      prev.includes(chapter)
        ? prev.filter(c => c !== chapter)
        : [...prev, chapter]
    );
  };

  const handleSelectAllChapters = () => {
    if (selectedChapters.length === chapters.length) {
      setSelectedChapters([]);
    } else {
      setSelectedChapters([...chapters]);
    }
  };

  const handleGenerate = async () => {
    if (!classStandard || !subject || !difficulty) {
      toast.error('Please select class, subject, and difficulty');
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('generate-ai-test', {
        body: {
          classStandard,
          subject,
          chapters: selectedChapters.length > 0 ? selectedChapters : undefined,
          difficulty,
          questionCount,
        },
      });

      if (error) throw error;

      if (data?.success && data?.testId) {
        toast.success('Test generated successfully!');
        setOpen(false);
        navigate(`/test/${data.testId}`);
      } else {
        throw new Error(data?.error || 'Failed to generate test');
      }
    } catch (error) {
      console.error('Generate test error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate test');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setClassStandard(null);
    setSubject('');
    setSelectedChapters([]);
    setDifficulty('medium');
    setQuestionCount(10);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) resetForm(); }}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Sparkles className="h-4 w-4" />
          AI Test Generator
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Test Generator
          </DialogTitle>
          <DialogDescription>
            Generate a custom test based on CBSE syllabus. Select your class, subject, and chapters.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 py-4">
          {/* Class Selection */}
          <div className="space-y-2">
            <Label>Class / Standard</Label>
            <Select value={classStandard?.toString() || ''} onValueChange={handleClassChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select your class" />
              </SelectTrigger>
              <SelectContent>
                {CLASS_STANDARDS.map((cls) => (
                  <SelectItem key={cls} value={cls.toString()}>
                    Class {cls}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Subject Selection */}
          <div className="space-y-2">
            <Label>Subject</Label>
            <Select value={subject} onValueChange={handleSubjectChange} disabled={!classStandard}>
              <SelectTrigger>
                <SelectValue placeholder={classStandard ? "Select subject" : "Select class first"} />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((sub) => (
                  <SelectItem key={sub} value={sub}>
                    {sub}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Chapters Selection */}
          {chapters.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Chapters (Optional)</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleSelectAllChapters}
                  className="text-xs"
                >
                  {selectedChapters.length === chapters.length ? 'Deselect All' : 'Select All'}
                </Button>
              </div>
              <ScrollArea className="h-40 border border-border rounded-lg p-3">
                <div className="space-y-2">
                  {chapters.map((chapter) => (
                    <div key={chapter} className="flex items-start gap-2">
                      <Checkbox
                        id={chapter}
                        checked={selectedChapters.includes(chapter)}
                        onCheckedChange={() => handleChapterToggle(chapter)}
                      />
                      <label
                        htmlFor={chapter}
                        className="text-sm cursor-pointer leading-tight"
                      >
                        {chapter}
                      </label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              {selectedChapters.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {selectedChapters.slice(0, 3).map((ch) => (
                    <Badge key={ch} variant="secondary" className="text-xs">
                      {ch.length > 20 ? ch.slice(0, 20) + '...' : ch}
                    </Badge>
                  ))}
                  {selectedChapters.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{selectedChapters.length - 3} more
                    </Badge>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Difficulty Selection */}
          <div className="space-y-2">
            <Label>Difficulty Level</Label>
            <Select value={difficulty} onValueChange={(v) => setDifficulty(v as DifficultyLevel)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DIFFICULTY_LEVELS.map((level) => (
                  <SelectItem key={level} value={level}>
                    {DIFFICULTY_LABELS[level]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Question Count */}
          <div className="space-y-2">
            <Label>Number of Questions</Label>
            <Select value={questionCount.toString()} onValueChange={(v) => setQuestionCount(parseInt(v))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[5, 10, 15, 20, 25, 30, 40, 50, 75, 100].map((count) => (
                  <SelectItem key={count} value={count.toString()}>
                    {count} questions
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Info Card */}
          <div className="bg-muted/50 rounded-lg p-3 flex items-start gap-3">
            <BookOpen className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium text-foreground">CBSE Curriculum Based</p>
              <p>Questions are generated following the latest CBSE syllabus patterns.</p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={isLoading || !classStandard || !subject}
            className="gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate Test
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
