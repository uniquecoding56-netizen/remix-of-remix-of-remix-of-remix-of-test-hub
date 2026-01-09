import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import { 
  ArrowLeft, Trash2, Share2, Eye, Loader2, 
  Layers, StickyNote, MessageSquare, Youtube, Globe, Play,
  Clock, ExternalLink, ChevronLeft, ChevronRight, RotateCcw
} from 'lucide-react';

interface SavedFlashcard {
  id: string;
  title: string;
  flashcards: any[];
  created_at: string;
  source_type?: string;
  source_url?: string;
}

interface SavedNote {
  id: string;
  title: string;
  notes: any;
  created_at: string;
  source_type?: string;
  source_url?: string;
}

interface SavedYouTubeVideo {
  id: string;
  video_title: string;
  video_url: string;
  video_id: string;
  video_thumbnail?: string;
  transcript?: string;
  generated_notes?: string;
  created_at: string;
}

interface SavedWebsite {
  id: string;
  website_title?: string;
  website_url: string;
  content?: string;
  generated_content?: string;
  created_at: string;
}

interface SavedQAConversation {
  id: string;
  title: string;
  messages: any[];
  content?: string;
  created_at: string;
}

export default function SavedContent() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  
  const [flashcards, setFlashcards] = useState<SavedFlashcard[]>([]);
  const [notes, setNotes] = useState<SavedNote[]>([]);
  const [youtubeVideos, setYoutubeVideos] = useState<SavedYouTubeVideo[]>([]);
  const [websites, setWebsites] = useState<SavedWebsite[]>([]);
  const [qaConversations, setQaConversations] = useState<SavedQAConversation[]>([]);
  
  const [selectedFlashcard, setSelectedFlashcard] = useState<SavedFlashcard | null>(null);
  const [selectedNote, setSelectedNote] = useState<SavedNote | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<SavedYouTubeVideo | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      loadAllContent();
    }
  }, [user]);

  const loadAllContent = async () => {
    setLoading(true);
    try {
      const [flashcardsRes, notesRes, youtubeRes, websitesRes, qaRes] = await Promise.all([
        supabase.from('saved_flashcards').select('*').order('created_at', { ascending: false }),
        supabase.from('saved_notes').select('*').order('created_at', { ascending: false }),
        supabase.from('saved_youtube_videos').select('*').order('created_at', { ascending: false }),
        supabase.from('saved_website_content').select('*').order('created_at', { ascending: false }),
        supabase.from('saved_qa_conversations').select('*').order('created_at', { ascending: false }),
      ]);

      if (flashcardsRes.data) {
        setFlashcards(flashcardsRes.data.map(f => ({
          ...f,
          flashcards: Array.isArray(f.flashcards) ? f.flashcards : []
        })) as SavedFlashcard[]);
      }
      if (notesRes.data) setNotes(notesRes.data as SavedNote[]);
      if (youtubeRes.data) setYoutubeVideos(youtubeRes.data as SavedYouTubeVideo[]);
      if (websitesRes.data) setWebsites(websitesRes.data as SavedWebsite[]);
      if (qaRes.data) {
        setQaConversations(qaRes.data.map(q => ({
          ...q,
          messages: Array.isArray(q.messages) ? q.messages : []
        })) as SavedQAConversation[]);
      }
    } catch (error) {
      console.error('Error loading content:', error);
      toast.error('Failed to load saved content');
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async (table: string, id: string, type: string) => {
    if (!confirm(`Are you sure you want to delete this ${type}?`)) return;
    
    try {
      const { error } = await supabase.from(table as any).delete().eq('id', id);
      if (error) throw error;
      
      toast.success(`${type} deleted successfully`);
      loadAllContent();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(`Failed to delete ${type}`);
    }
  };

  const shareContent = async (contentType: string, contentData: any, title: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Please sign in to share');
        return;
      }

      const response = await supabase.functions.invoke('study-tools-process', {
        body: {
          type: 'share-content',
          contentType,
          contentData,
          title
        }
      });

      if (response.error) throw new Error(response.error.message);
      
      const shareUrl = `${window.location.origin}/shared/${response.data.shareToken}`;
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Share link copied to clipboard!');
    } catch (error) {
      console.error('Share error:', error);
      toast.error('Failed to share content');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const totalCount = flashcards.length + notes.length + youtubeVideos.length + websites.length + qaConversations.length;

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Detail views
  if (selectedFlashcard) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar showCTA={false} />
        <main className="container mx-auto px-4 py-8">
          <Button variant="ghost" onClick={() => setSelectedFlashcard(null)} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Saved Content
          </Button>
          <h1 className="text-2xl font-bold mb-6">{selectedFlashcard.title}</h1>
          <SimpleFlashcardViewer flashcards={selectedFlashcard.flashcards} />
        </main>
      </div>
    );
  }

  if (selectedNote) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar showCTA={false} />
        <main className="container mx-auto px-4 py-8">
          <Button variant="ghost" onClick={() => setSelectedNote(null)} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Saved Content
          </Button>
          <h1 className="text-2xl font-bold mb-6">{selectedNote.title}</h1>
          <SimpleNotesViewer notes={selectedNote.notes} />
        </main>
      </div>
    );
  }

  if (selectedVideo) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar showCTA={false} />
        <main className="container mx-auto px-4 py-8">
          <Button variant="ghost" onClick={() => setSelectedVideo(null)} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Saved Content
          </Button>
          <div className="max-w-4xl mx-auto">
            <div className="aspect-video rounded-lg overflow-hidden mb-6 bg-muted">
              <iframe
                src={`https://www.youtube.com/embed/${selectedVideo.video_id}`}
                className="w-full h-full"
                allowFullScreen
              />
            </div>
            <h1 className="text-2xl font-bold mb-4">{selectedVideo.video_title}</h1>
            {selectedVideo.transcript && (
              <Card>
                <CardHeader>
                  <CardTitle>Transcript / Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none dark:prose-invert whitespace-pre-wrap">
                    {selectedVideo.generated_notes || selectedVideo.transcript}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar showCTA={false} />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mb-2">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
            </Button>
            <h1 className="text-3xl font-bold">Saved Content</h1>
            <p className="text-muted-foreground">{totalCount} items saved</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 flex-wrap">
            <TabsTrigger value="all" className="flex items-center gap-2">
              <Layers className="h-4 w-4" /> All ({totalCount})
            </TabsTrigger>
            <TabsTrigger value="flashcards" className="flex items-center gap-2">
              <Layers className="h-4 w-4" /> Flashcards ({flashcards.length})
            </TabsTrigger>
            <TabsTrigger value="notes" className="flex items-center gap-2">
              <StickyNote className="h-4 w-4" /> Notes ({notes.length})
            </TabsTrigger>
            <TabsTrigger value="youtube" className="flex items-center gap-2">
              <Youtube className="h-4 w-4" /> YouTube ({youtubeVideos.length})
            </TabsTrigger>
            <TabsTrigger value="websites" className="flex items-center gap-2">
              <Globe className="h-4 w-4" /> Websites ({websites.length})
            </TabsTrigger>
            <TabsTrigger value="qa" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" /> Q&A ({qaConversations.length})
            </TabsTrigger>
          </TabsList>

          {/* All Content */}
          <TabsContent value="all" className="space-y-6">
            {totalCount === 0 ? (
              <Card className="p-12 text-center">
                <Layers className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No saved content yet</h3>
                <p className="text-muted-foreground mb-4">Start studying to save flashcards, notes, and more!</p>
                <Button onClick={() => navigate('/study-tools')}>Go to Study Tools</Button>
              </Card>
            ) : (
              <>
                {flashcards.length > 0 && (
                  <section>
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <Layers className="h-5 w-5" /> Flashcards
                    </h2>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {flashcards.slice(0, 3).map(item => (
                        <FlashcardCard key={item.id} item={item} onView={() => setSelectedFlashcard(item)} onDelete={() => deleteItem('saved_flashcards', item.id, 'flashcard set')} onShare={() => shareContent('flashcards', item.flashcards, item.title)} formatDate={formatDate} />
                      ))}
                    </div>
                  </section>
                )}
                
                {youtubeVideos.length > 0 && (
                  <section>
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <Youtube className="h-5 w-5 text-red-500" /> YouTube Videos
                    </h2>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {youtubeVideos.slice(0, 3).map(item => (
                        <YouTubeCard key={item.id} item={item} onView={() => setSelectedVideo(item)} onDelete={() => deleteItem('saved_youtube_videos', item.id, 'YouTube video')} formatDate={formatDate} />
                      ))}
                    </div>
                  </section>
                )}

                {notes.length > 0 && (
                  <section>
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <StickyNote className="h-5 w-5" /> Notes
                    </h2>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {notes.slice(0, 3).map(item => (
                        <NoteCard key={item.id} item={item} onView={() => setSelectedNote(item)} onDelete={() => deleteItem('saved_notes', item.id, 'note')} onShare={() => shareContent('notes', item.notes, item.title)} formatDate={formatDate} />
                      ))}
                    </div>
                  </section>
                )}
              </>
            )}
          </TabsContent>

          {/* Flashcards Tab */}
          <TabsContent value="flashcards">
            {flashcards.length === 0 ? (
              <EmptyState icon={<Layers className="h-16 w-16" />} title="No flashcards saved" description="Create flashcards in Study Tools to save them here" />
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {flashcards.map(item => (
                  <FlashcardCard key={item.id} item={item} onView={() => setSelectedFlashcard(item)} onDelete={() => deleteItem('saved_flashcards', item.id, 'flashcard set')} onShare={() => shareContent('flashcards', item.flashcards, item.title)} formatDate={formatDate} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Notes Tab */}
          <TabsContent value="notes">
            {notes.length === 0 ? (
              <EmptyState icon={<StickyNote className="h-16 w-16" />} title="No notes saved" description="Create study notes in Study Tools to save them here" />
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {notes.map(item => (
                  <NoteCard key={item.id} item={item} onView={() => setSelectedNote(item)} onDelete={() => deleteItem('saved_notes', item.id, 'note')} onShare={() => shareContent('notes', item.notes, item.title)} formatDate={formatDate} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* YouTube Tab */}
          <TabsContent value="youtube">
            {youtubeVideos.length === 0 ? (
              <EmptyState icon={<Youtube className="h-16 w-16" />} title="No YouTube videos saved" description="Process YouTube videos in Study Tools to save them here" />
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {youtubeVideos.map(item => (
                  <YouTubeCard key={item.id} item={item} onView={() => setSelectedVideo(item)} onDelete={() => deleteItem('saved_youtube_videos', item.id, 'YouTube video')} formatDate={formatDate} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Websites Tab */}
          <TabsContent value="websites">
            {websites.length === 0 ? (
              <EmptyState icon={<Globe className="h-16 w-16" />} title="No websites saved" description="Process website content in Study Tools to save them here" />
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {websites.map(item => (
                  <WebsiteCard key={item.id} item={item} onDelete={() => deleteItem('saved_website_content', item.id, 'website')} formatDate={formatDate} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Q&A Tab */}
          <TabsContent value="qa">
            {qaConversations.length === 0 ? (
              <EmptyState icon={<MessageSquare className="h-16 w-16" />} title="No Q&A conversations saved" description="Save your Q&A conversations from Study Tools" />
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {qaConversations.map(item => (
                  <QACard key={item.id} item={item} onDelete={() => deleteItem('saved_qa_conversations', item.id, 'conversation')} onShare={() => shareContent('qa', item.messages, item.title)} formatDate={formatDate} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

// Component helpers
function EmptyState({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  const navigate = useNavigate();
  return (
    <Card className="p-12 text-center">
      <div className="mx-auto text-muted-foreground mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-4">{description}</p>
      <Button onClick={() => navigate('/study-tools')}>Go to Study Tools</Button>
    </Card>
  );
}

function FlashcardCard({ item, onView, onDelete, onShare, formatDate }: { item: SavedFlashcard; onView: () => void; onDelete: () => void; onShare: () => void; formatDate: (d: string) => string }) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg line-clamp-1">{item.title}</CardTitle>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-3 w-3" />
          {formatDate(item.created_at)}
          <Badge variant="secondary">{item.flashcards.length} cards</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <Button size="sm" onClick={onView}><Eye className="h-4 w-4 mr-1" /> View</Button>
          <Button size="sm" variant="outline" onClick={onShare}><Share2 className="h-4 w-4 mr-1" /> Share</Button>
          <Button size="sm" variant="destructive" onClick={onDelete}><Trash2 className="h-4 w-4" /></Button>
        </div>
      </CardContent>
    </Card>
  );
}

function NoteCard({ item, onView, onDelete, onShare, formatDate }: { item: SavedNote; onView: () => void; onDelete: () => void; onShare: () => void; formatDate: (d: string) => string }) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg line-clamp-1">{item.title}</CardTitle>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-3 w-3" />
          {formatDate(item.created_at)}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <Button size="sm" onClick={onView}><Eye className="h-4 w-4 mr-1" /> View</Button>
          <Button size="sm" variant="outline" onClick={onShare}><Share2 className="h-4 w-4 mr-1" /> Share</Button>
          <Button size="sm" variant="destructive" onClick={onDelete}><Trash2 className="h-4 w-4" /></Button>
        </div>
      </CardContent>
    </Card>
  );
}

function YouTubeCard({ item, onView, onDelete, formatDate }: { item: SavedYouTubeVideo; onView: () => void; onDelete: () => void; formatDate: (d: string) => string }) {
  return (
    <Card className="hover:shadow-lg transition-shadow overflow-hidden">
      <div className="aspect-video relative bg-muted">
        <img 
          src={item.video_thumbnail || `https://img.youtube.com/vi/${item.video_id}/maxresdefault.jpg`}
          alt={item.video_title}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${item.video_id}/hqdefault.jpg`;
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <Play className="h-12 w-12 text-white" />
        </div>
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg line-clamp-2">{item.video_title}</CardTitle>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-3 w-3" />
          {formatDate(item.created_at)}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <Button size="sm" onClick={onView}><Eye className="h-4 w-4 mr-1" /> View</Button>
          <Button size="sm" variant="outline" onClick={() => window.open(item.video_url, '_blank')}><ExternalLink className="h-4 w-4 mr-1" /> Open</Button>
          <Button size="sm" variant="destructive" onClick={onDelete}><Trash2 className="h-4 w-4" /></Button>
        </div>
      </CardContent>
    </Card>
  );
}

function WebsiteCard({ item, onDelete, formatDate }: { item: SavedWebsite; onDelete: () => void; formatDate: (d: string) => string }) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg line-clamp-1">{item.website_title || 'Website'}</CardTitle>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-3 w-3" />
          {formatDate(item.created_at)}
        </div>
        <p className="text-xs text-muted-foreground truncate">{item.website_url}</p>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => window.open(item.website_url, '_blank')}><ExternalLink className="h-4 w-4 mr-1" /> Open</Button>
          <Button size="sm" variant="destructive" onClick={onDelete}><Trash2 className="h-4 w-4" /></Button>
        </div>
      </CardContent>
    </Card>
  );
}

function QACard({ item, onDelete, onShare, formatDate }: { item: SavedQAConversation; onDelete: () => void; onShare: () => void; formatDate: (d: string) => string }) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg line-clamp-1">{item.title}</CardTitle>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-3 w-3" />
          {formatDate(item.created_at)}
          <Badge variant="secondary">{item.messages.length} messages</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={onShare}><Share2 className="h-4 w-4 mr-1" /> Share</Button>
          <Button size="sm" variant="destructive" onClick={onDelete}><Trash2 className="h-4 w-4" /></Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Simple Flashcard Viewer for saved flashcards
function SimpleFlashcardViewer({ flashcards }: { flashcards: any[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  if (!flashcards || flashcards.length === 0) {
    return <Card className="p-8 text-center text-muted-foreground">No flashcards to display</Card>;
  }

  const current = flashcards[currentIndex];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm text-muted-foreground">
          Card {currentIndex + 1} of {flashcards.length}
        </span>
        <Button variant="ghost" size="sm" onClick={() => setIsFlipped(false)}>
          <RotateCcw className="h-4 w-4 mr-1" /> Reset
        </Button>
      </div>
      
      <Card 
        className="min-h-[300px] cursor-pointer transition-all duration-300 hover:shadow-lg"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <CardContent className="flex items-center justify-center min-h-[300px] p-8">
          <div className="text-center">
            <Badge variant="outline" className="mb-4">
              {isFlipped ? 'Answer' : 'Question'}
            </Badge>
            <div className="text-xl">
              <ReactMarkdown>{isFlipped ? current.back : current.front}</ReactMarkdown>
            </div>
            {!isFlipped && current.hint && (
              <p className="text-sm text-muted-foreground mt-4 italic">Hint: {current.hint}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between mt-4">
        <Button 
          variant="outline" 
          onClick={() => { setCurrentIndex(Math.max(0, currentIndex - 1)); setIsFlipped(false); }}
          disabled={currentIndex === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-1" /> Previous
        </Button>
        <Button 
          variant="outline" 
          onClick={() => { setCurrentIndex(Math.min(flashcards.length - 1, currentIndex + 1)); setIsFlipped(false); }}
          disabled={currentIndex === flashcards.length - 1}
        >
          Next <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}

// Simple Notes Viewer for saved notes
function SimpleNotesViewer({ notes }: { notes: any }) {
  if (!notes) {
    return <Card className="p-8 text-center text-muted-foreground">No notes to display</Card>;
  }

  return (
    <div className="space-y-6">
      {notes.summary && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <StickyNote className="h-5 w-5" /> Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <ReactMarkdown>{notes.summary}</ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      )}

      {notes.keyPoints && notes.keyPoints.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Key Points</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-2">
              {notes.keyPoints.map((point: string, i: number) => (
                <li key={i}>{point}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {notes.keyConcepts && notes.keyConcepts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Key Concepts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {notes.keyConcepts.map((concept: any, i: number) => (
                <div key={i} className="border-l-4 border-primary pl-4">
                  <h4 className="font-semibold">{concept.term}</h4>
                  <p className="text-muted-foreground">{concept.definition}</p>
                  {concept.importance && (
                    <p className="text-sm text-primary mt-1">Why it matters: {concept.importance}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {notes.studyTips && notes.studyTips.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Study Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-2">
              {notes.studyTips.map((tip: string, i: number) => (
                <li key={i}>{tip}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
