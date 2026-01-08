import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ChevronLeft, ChevronRight, RotateCcw, Loader2, Sparkles, 
  Download, Shuffle, CheckCircle, XCircle, Star, Lightbulb,
  Brain, Zap, Clock, Save, Share2, Copy, Check
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { ShareButton } from './ShareButton';
import { useSpacedRepetition } from '@/hooks/useSpacedRepetition';
import { useGamification } from '@/hooks/useGamification';
import { generateShareLink } from '@/utils/shareContent';

interface Flashcard {
  id?: string;
  front: string;
  back: string;
  hint?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  category?: string;
}

interface FlashcardViewerProps {
  content: string;
}

type CardStatus = 'unseen' | 'known' | 'unknown';

export function FlashcardViewer({ content }: FlashcardViewerProps) {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [cardStatuses, setCardStatuses] = useState<CardStatus[]>([]);
  const [studyMode, setStudyMode] = useState(false);
  const [spacedMode, setSpacedMode] = useState(false);
  const [contentHash, setContentHash] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const flipStartTime = useRef<number>(0);

  const { 
    loadProgress, 
    recordReview, 
    getCardStatus, 
    getQualityFromResponse,
    generateContentHash,
    progressMap 
  } = useSpacedRepetition();
  
  const { recordFlashcardReview, updateStreak } = useGamification();

  const generateFlashcards = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Please sign in to generate flashcards');
        return;
      }

      const response = await supabase.functions.invoke('study-tools-process', {
        body: { 
          type: 'generate',
          tool: 'flashcards-advanced',
          content 
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const cards: Flashcard[] = (response.data.flashcards || []).map((card: any, index: number) => ({
        ...card,
        id: `card-${index}-${Date.now()}`
      }));
      
      setFlashcards(cards);
      setCardStatuses(new Array(cards.length).fill('unseen'));
      setHasGenerated(true);
      setCurrentIndex(0);
      setIsFlipped(false);
      setShowHint(false);

      // Load spaced repetition progress
      const hash = generateContentHash(cards.map(c => c.front).join('|'));
      setContentHash(hash);
      await loadProgress(cards.map(c => ({ id: c.id!, front: c.front })));

      // Update streak for activity
      await updateStreak();

      toast.success(`Generated ${cards.length} flashcards with spaced repetition!`);
    } catch (error) {
      console.error('Flashcard generation error:', error);
      toast.error('Failed to generate flashcards. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFlip = () => {
    if (!isFlipped) {
      flipStartTime.current = Date.now();
    }
    setIsFlipped(!isFlipped);
  };

  const handleSpacedReview = async (quality: number) => {
    const card = flashcards[currentIndex];
    if (!card.id || !contentHash) return;

    await recordReview(card.id, contentHash, quality);
    await recordFlashcardReview();

    const status: CardStatus = quality >= 3 ? 'known' : 'unknown';
    const newStatuses = [...cardStatuses];
    newStatuses[currentIndex] = status;
    setCardStatuses(newStatuses);

    // Show feedback
    const messages = {
      0: "Don't worry, we'll show this again soon!",
      1: "Keep practicing, you're getting there!",
      2: "Almost! A bit more practice needed.",
      3: "Good job! Keep it up!",
      4: "Great recall!",
      5: "Perfect! You've mastered this!"
    };
    toast.success(messages[quality as keyof typeof messages] || "Reviewed!");

    if (currentIndex < flashcards.length - 1) {
      nextCard();
    } else {
      toast.success("🎉 You've completed all cards! Great work!");
    }
  };

  const nextCard = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
      setShowHint(false);
    }
  };

  const prevCard = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setIsFlipped(false);
      setShowHint(false);
    }
  };

  const resetCards = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setShowHint(false);
    setCardStatuses(new Array(flashcards.length).fill('unseen'));
    setStudyMode(false);
    setSpacedMode(false);
  };

  const shuffleCards = () => {
    const shuffled = [...flashcards].sort(() => Math.random() - 0.5);
    setFlashcards(shuffled);
    setCardStatuses(new Array(shuffled.length).fill('unseen'));
    setCurrentIndex(0);
    setIsFlipped(false);
    setShowHint(false);
    toast.success('Cards shuffled!');
  };

  const markCard = async (status: 'known' | 'unknown') => {
    const newStatuses = [...cardStatuses];
    newStatuses[currentIndex] = status;
    setCardStatuses(newStatuses);

    // Record in spaced repetition
    const card = flashcards[currentIndex];
    if (card.id && contentHash) {
      const quality = status === 'known' ? 4 : 1;
      await recordReview(card.id, contentHash, quality);
      await recordFlashcardReview();
    }
    
    if (currentIndex < flashcards.length - 1) {
      nextCard();
    } else {
      toast.success('You\'ve reviewed all cards!');
    }
  };

  const exportFlashcards = () => {
    let exportText = '# Flashcards Export\n\n';
    flashcards.forEach((card, index) => {
      exportText += `## Card ${index + 1}${card.category ? ` (${card.category})` : ''}\n`;
      exportText += `**Question:** ${card.front}\n\n`;
      exportText += `**Answer:** ${card.back}\n\n`;
      if (card.hint) {
        exportText += `**Hint:** ${card.hint}\n\n`;
      }
      exportText += '---\n\n';
    });

    const blob = new Blob([exportText], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'flashcards.md';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Flashcards exported!');
  };

  const saveFlashcards = async () => {
    if (flashcards.length === 0) return;
    
    setIsSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Please sign in to save flashcards');
        return;
      }

      const response = await supabase.functions.invoke('study-tools-process', {
        body: {
          type: 'save-flashcards',
          flashcards: flashcards,
          title: `Flashcards - ${new Date().toLocaleDateString()}`,
          contentHash: contentHash || ''
        }
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to save flashcards');
      }

      // Check if response.data contains an error
      if (response.data?.error) {
        throw new Error(response.data.error);
      }

      if (!response.data?.success) {
        throw new Error('Save operation failed. Please ensure database tables are created.');
      }

      toast.success('Flashcards saved successfully!');
    } catch (error: any) {
      console.error('Save error:', error);
      const errorMessage = error?.message || error?.error?.message || 'Failed to save flashcards. Please check if database migration has been applied.';
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = async () => {
    if (flashcards.length === 0) return;
    
    const shareUrl = await generateShareLink({
      contentType: 'flashcards',
      contentData: {
        flashcards: flashcards,
        title: `Flashcards - ${new Date().toLocaleDateString()}`
      }
    });

    if (shareUrl) {
      setShareUrl(shareUrl);
    }
  };

  const copyShareUrl = async () => {
    if (!shareUrl) return;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Share link copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      toast.error('Failed to copy link');
    }
  };

  const knownCount = cardStatuses.filter(s => s === 'known').length;
  const unknownCount = cardStatuses.filter(s => s === 'unknown').length;
  const progressPercent = ((knownCount + unknownCount) / flashcards.length) * 100;

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500/10 text-green-600';
      case 'medium': return 'bg-yellow-500/10 text-yellow-600';
      case 'hard': return 'bg-red-500/10 text-red-600';
      default: return 'bg-muted';
    }
  };

  const getSpacedStatusColor = (cardId?: string) => {
    if (!cardId) return '';
    const status = getCardStatus(cardId);
    switch (status) {
      case 'new': return 'border-blue-500/50';
      case 'learning': return 'border-yellow-500/50';
      case 'review': return 'border-orange-500/50';
      case 'mastered': return 'border-green-500/50';
      default: return '';
    }
  };

  if (!hasGenerated) {
    return (
      <div className="text-center py-8">
        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Brain className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-lg font-medium mb-2">Smart Flashcards with Spaced Repetition</h3>
        <p className="text-muted-foreground mb-4 max-w-md mx-auto">
          AI creates flashcards and tracks your learning progress. Cards you struggle with appear more often!
        </p>
        <Button onClick={generateFlashcards} disabled={isLoading} size="lg">
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Smart Flashcards
            </>
          )}
        </Button>
      </div>
    );
  }

  if (flashcards.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No flashcards generated. Try with different content.</p>
        <Button variant="outline" onClick={generateFlashcards} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  const currentCard = flashcards[currentIndex];
  const cardSpacedStatus = currentCard.id ? getCardStatus(currentCard.id) : 'new';

  return (
    <div className="space-y-4">
      {/* Progress and Stats */}
      <div className="flex flex-wrap justify-between items-center gap-2">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Card {currentIndex + 1} of {flashcards.length}</span>
          {currentCard.category && (
            <Badge variant="outline">{currentCard.category}</Badge>
          )}
          {currentCard.difficulty && (
            <Badge className={getDifficultyColor(currentCard.difficulty)}>
              {currentCard.difficulty}
            </Badge>
          )}
          <Badge variant="secondary" className="capitalize flex items-center gap-1">
            {cardSpacedStatus === 'new' && <Zap className="h-3 w-3" />}
            {cardSpacedStatus === 'mastered' && <Star className="h-3 w-3 text-yellow-500" />}
            {cardSpacedStatus === 'learning' && <Clock className="h-3 w-3" />}
            {cardSpacedStatus}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3 text-green-500" /> {knownCount}
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1">
            <XCircle className="h-3 w-3 text-red-500" /> {unknownCount}
          </Badge>
        </div>
      </div>

      {/* Study Progress */}
      {(studyMode || spacedMode) && (
        <div className="space-y-1">
          <Progress value={progressPercent} className="h-2" />
          <p className="text-xs text-muted-foreground text-center">
            {Math.round(progressPercent)}% reviewed
          </p>
        </div>
      )}

      {/* Flashcard */}
      <div 
        className="perspective-1000 cursor-pointer"
        onClick={handleFlip}
      >
        <Card className={`relative min-h-[280px] transition-all duration-500 transform-style-preserve-3d ${
          isFlipped ? 'rotate-y-180' : ''
        } ${cardStatuses[currentIndex] === 'known' ? 'ring-2 ring-green-500' : ''} ${cardStatuses[currentIndex] === 'unknown' ? 'ring-2 ring-red-500' : ''} ${getSpacedStatusColor(currentCard.id)}`}>
          <CardContent className="absolute inset-0 p-6 flex flex-col items-center justify-center backface-hidden">
            <span className="text-xs text-muted-foreground mb-2 uppercase tracking-wide flex items-center gap-2">
              {isFlipped ? (
                <>
                  <Star className="h-3 w-3" /> Answer
                </>
              ) : (
                'Question'
              )}
            </span>
            <div className="text-center text-lg prose prose-sm dark:prose-invert max-w-none flex-1 flex items-center">
              <ReactMarkdown
                remarkPlugins={[remarkMath]}
                rehypePlugins={[rehypeKatex]}
              >
                {isFlipped ? currentCard.back : currentCard.front}
              </ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Click the card to flip
      </p>

      {/* Hint Section */}
      {currentCard.hint && (
        <div className="text-center">
          {showHint ? (
            <div className="bg-muted/50 rounded-lg p-3 text-sm flex items-start gap-2">
              <Lightbulb className="h-4 w-4 text-yellow-500 shrink-0 mt-0.5" />
              <span>{currentCard.hint}</span>
            </div>
          ) : (
            <Button variant="ghost" size="sm" onClick={() => setShowHint(true)}>
              <Lightbulb className="h-4 w-4 mr-1" />
              Show Hint
            </Button>
          )}
        </div>
      )}

      {/* Spaced Repetition Actions */}
      {spacedMode && isFlipped && (
        <div className="flex flex-wrap justify-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleSpacedReview(0)}
            className="border-red-300 hover:bg-red-50 text-red-600"
          >
            Again
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleSpacedReview(2)}
            className="border-orange-300 hover:bg-orange-50 text-orange-600"
          >
            Hard
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleSpacedReview(3)}
            className="border-yellow-300 hover:bg-yellow-50 text-yellow-600"
          >
            Good
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleSpacedReview(5)}
            className="border-green-300 hover:bg-green-50 text-green-600"
          >
            Easy
          </Button>
        </div>
      )}

      {/* Study Mode Actions */}
      {studyMode && !spacedMode && isFlipped && (
        <div className="flex justify-center gap-3">
          <Button 
            variant="outline" 
            onClick={() => markCard('unknown')}
            className="border-red-200 hover:bg-red-50 hover:text-red-600"
          >
            <XCircle className="h-4 w-4 mr-1" />
            Need Review
          </Button>
          <Button 
            variant="outline" 
            onClick={() => markCard('known')}
            className="border-green-200 hover:bg-green-50 hover:text-green-600"
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            Got It!
          </Button>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-center gap-4">
        <Button 
          variant="outline" 
          onClick={prevCard}
          disabled={currentIndex === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>
        <Button 
          variant="outline" 
          onClick={nextCard}
          disabled={currentIndex === flashcards.length - 1}
        >
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap justify-center gap-2 pt-4 border-t">
        <Button variant="ghost" size="sm" onClick={resetCards}>
          <RotateCcw className="h-4 w-4 mr-1" />
          Reset
        </Button>
        <Button variant="ghost" size="sm" onClick={shuffleCards}>
          <Shuffle className="h-4 w-4 mr-1" />
          Shuffle
        </Button>
        <Button 
          variant={spacedMode ? "default" : "ghost"} 
          size="sm" 
          onClick={() => { setSpacedMode(!spacedMode); setStudyMode(false); }}
        >
          <Brain className="h-4 w-4 mr-1" />
          {spacedMode ? 'Exit Spaced Mode' : 'Spaced Repetition'}
        </Button>
        <Button 
          variant={studyMode && !spacedMode ? "default" : "ghost"} 
          size="sm" 
          onClick={() => { setStudyMode(!studyMode); setSpacedMode(false); }}
        >
          <Star className="h-4 w-4 mr-1" />
          {studyMode && !spacedMode ? 'Exit Study Mode' : 'Study Mode'}
        </Button>
        <Button variant="ghost" size="sm" onClick={exportFlashcards}>
          <Download className="h-4 w-4 mr-1" />
          Export
        </Button>
        <Button variant="ghost" size="sm" onClick={saveFlashcards} disabled={isSaving}>
          {isSaving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
          Save
        </Button>
        <Button variant="ghost" size="sm" onClick={handleShare}>
          <Share2 className="h-4 w-4 mr-1" />
          Share
        </Button>
        {shareUrl && (
          <div className="flex items-center gap-2 w-full mt-2 p-2 bg-muted rounded-md">
            <input
              type="text"
              value={shareUrl}
              readOnly
              className="flex-1 text-xs px-2 py-1 bg-background rounded border"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={copyShareUrl}
              className="h-7"
            >
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            </Button>
          </div>
        )}
        <Button variant="ghost" size="sm" onClick={generateFlashcards} disabled={isLoading}>
          {isLoading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Sparkles className="h-4 w-4 mr-1" />}
          Regenerate
        </Button>
      </div>
    </div>
  );
}
