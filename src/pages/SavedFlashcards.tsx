import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, BookOpen, Trash2, Share2, Copy, Check, Loader2,
  Sparkles, Calendar, FileText
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { generateShareLink } from '@/utils/shareContent';
import { FlashcardViewer } from '@/components/FlashcardViewer';

interface SavedFlashcard {
  id: string;
  flashcards: any[];
  title: string;
  created_at: string;
  updated_at: string;
  source_type?: string;
  source_url?: string;
}

export default function SavedFlashcards() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [savedFlashcards, setSavedFlashcards] = useState<SavedFlashcard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFlashcard, setSelectedFlashcard] = useState<SavedFlashcard | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      loadSavedFlashcards();
    } else if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const loadSavedFlashcards = async () => {
    try {
      const { data, error } = await supabase
        .from('saved_flashcards' as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Map the data to ensure proper typing
      const mappedData: SavedFlashcard[] = (data || []).map((item: any) => ({
        id: item.id,
        flashcards: Array.isArray(item.flashcards) ? item.flashcards : [],
        title: item.title,
        created_at: item.created_at,
        updated_at: item.updated_at,
        source_type: item.source_type,
        source_url: item.source_url
      }));
      
      setSavedFlashcards(mappedData);
    } catch (error) {
      console.error('Error loading saved flashcards:', error);
      toast.error('Failed to load saved flashcards');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteFlashcard = async (id: string) => {
    if (!confirm('Are you sure you want to delete this saved flashcard set?')) return;

    try {
      const { error } = await supabase
        .from('saved_flashcards' as any)
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Flashcard set deleted');
      loadSavedFlashcards();
      if (selectedFlashcard?.id === id) {
        setSelectedFlashcard(null);
      }
    } catch (error) {
      console.error('Error deleting flashcard:', error);
      toast.error('Failed to delete flashcard set');
    }
  };

  const handleShare = async (flashcard: SavedFlashcard) => {
    const shareUrl = await generateShareLink({
      contentType: 'flashcards',
      contentData: {
        flashcards: flashcard.flashcards,
        title: flashcard.title
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

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (selectedFlashcard) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => setSelectedFlashcard(null)}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold">{selectedFlashcard.title}</h1>
                <p className="text-sm text-muted-foreground">
                  {selectedFlashcard.flashcards.length} flashcards
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => handleShare(selectedFlashcard)}>
                <Share2 className="h-4 w-4 mr-1" />
                Share
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => deleteFlashcard(selectedFlashcard.id)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-6">
          <div className="max-w-4xl mx-auto">
            {shareUrl && (
              <Card className="mb-4">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={shareUrl}
                      readOnly
                      className="flex-1 text-sm px-3 py-2 bg-muted rounded border"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyShareUrl}
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
            <div className="space-y-4">
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold mb-4">{selectedFlashcard.title}</h2>
                  <p className="text-muted-foreground mb-4">
                    {selectedFlashcard.flashcards.length} flashcards • Created {new Date(selectedFlashcard.created_at).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
              <FlashcardViewer 
                content={selectedFlashcard.flashcards.map(c => `${c.front}\n${c.back}`).join('\n\n')} 
              />
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-primary to-purple-600 flex items-center justify-center">
                <BookOpen className="h-4 w-4 text-white" />
              </div>
              <h1 className="text-xl font-bold">Saved Flashcards</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          {savedFlashcards.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <BookOpen className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">No saved flashcards yet</h3>
                <p className="text-muted-foreground max-w-md mb-4">
                  Save flashcards from the Study Tools page to access them here anytime.
                </p>
                <Button onClick={() => navigate('/study-tools')}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Go to Study Tools
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {savedFlashcards.map((flashcard) => (
                <Card 
                  key={flashcard.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSelectedFlashcard(flashcard)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg line-clamp-2 flex-1">
                        {flashcard.title}
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteFlashcard(flashcard.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                    <CardDescription className="flex items-center gap-2">
                      <FileText className="h-3 w-3" />
                      {flashcard.flashcards.length} flashcards
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(flashcard.created_at).toLocaleDateString()}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShare(flashcard);
                        }}
                      >
                        <Share2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

