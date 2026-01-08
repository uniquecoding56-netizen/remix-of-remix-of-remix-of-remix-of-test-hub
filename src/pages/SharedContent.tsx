import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, ArrowLeft, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { FlashcardViewer } from '@/components/FlashcardViewer';
import { SummaryViewer } from '@/components/SummaryViewer';
import { ContentQA } from '@/components/ContentQA';
import { SEOHead } from '@/components/SEOHead';

export default function SharedContent() {
  const { shareToken } = useParams<{ shareToken: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [sharedContent, setSharedContent] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (shareToken) {
      loadSharedContent();
    }
  }, [shareToken]);

  const loadSharedContent = async () => {
    if (!shareToken) return;

    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      // Check if user is logged in
      if (!session) {
        // Store the share token to redirect after login
        sessionStorage.setItem('pendingShareToken', shareToken);
        navigate('/auth');
        return;
      }

      const response = await supabase.functions.invoke('study-tools-process', {
        body: {
          type: 'get-shared-content',
          shareToken: shareToken
        }
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to load shared content');
      }

      // Check if response.data contains an error
      if (response.data?.error) {
        throw new Error(response.data.error);
      }

      if (!response.data) {
        throw new Error('No data received from server');
      }

      setSharedContent(response.data);
    } catch (error: any) {
      console.error('Error loading shared content:', error);
      setError(error.message || 'Failed to load shared content');
      toast.error(error.message || 'Failed to load shared content');
    } finally {
      setIsLoading(false);
    }
  };

  // Check for pending share token after login
  useEffect(() => {
    if (!authLoading && user) {
      const pendingToken = sessionStorage.getItem('pendingShareToken');
      if (pendingToken && pendingToken !== shareToken) {
        sessionStorage.removeItem('pendingShareToken');
        navigate(`/shared/${pendingToken}`, { replace: true });
      }
    }
  }, [authLoading, user, shareToken, navigate]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <SEOHead
          title="Shared Content - PDFStudy.online"
          description="View shared study content from PDFStudy.online"
        />
        <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-3 flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold">Shared Content</h1>
          </div>
        </header>
        <main className="container mx-auto px-4 py-6">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Lock className="h-12 w-12 text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">Content Not Found</h2>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={() => navigate('/')}>Go to Home</Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (!sharedContent) {
    return null;
  }

  const renderContent = () => {
    if (!sharedContent?.contentData) {
      return (
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">Invalid content data</p>
          </CardContent>
        </Card>
      );
    }

    switch (sharedContent.contentType) {
      case 'flashcards':
        if (!Array.isArray(sharedContent.contentData.flashcards)) {
          return (
            <Card>
              <CardContent className="p-6">
                <p className="text-muted-foreground">Invalid flashcards data</p>
              </CardContent>
            </Card>
          );
        }
        return (
          <FlashcardViewer 
            content={sharedContent.contentData.flashcards.map((c: any) => `${c?.front || ''}\n${c?.back || ''}`).join('\n\n')} 
          />
        );
      case 'notes':
        // Reconstruct content from notes for SummaryViewer
        const notesContent = sharedContent.contentData.notes;
        if (!notesContent) {
          return (
            <Card>
              <CardContent className="p-6">
                <p className="text-muted-foreground">Invalid notes data</p>
              </CardContent>
            </Card>
          );
        }
        const notesText = (notesContent.summary || '') + '\n\n' + 
          (notesContent.keyPoints || []).join('\n') + '\n\n' +
          (notesContent.keyConcepts || []).map((c: any) => `${c?.term || ''}: ${c?.definition || ''}`).join('\n');
        return (
          <SummaryViewer 
            content={notesText} 
          />
        );
      case 'qa':
        return (
          <ContentQA 
            content={sharedContent.contentData.content || ''} 
          />
        );
      case 'youtube':
        return (
          <div className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4">{sharedContent.contentData.videoTitle || 'YouTube Video'}</h2>
                {sharedContent.contentData.videoThumbnail && (
                  <div className="aspect-video mb-4 rounded-lg overflow-hidden">
                    <img
                      src={sharedContent.contentData.videoThumbnail}
                      alt={sharedContent.contentData.videoTitle || 'Video thumbnail'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="prose dark:prose-invert">
                  <p className="whitespace-pre-wrap">{sharedContent.contentData.transcript || 'No transcript available'}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      default:
        return (
          <Card>
            <CardContent className="p-6">
              <p className="text-muted-foreground">Unsupported content type: {sharedContent.contentType}</p>
            </CardContent>
          </Card>
        );
    }
  };

  const getTitle = () => {
    if (!sharedContent?.contentData) return 'Shared Content';
    
    switch (sharedContent.contentType) {
      case 'flashcards':
        return sharedContent.contentData?.title || 'Shared Flashcards';
      case 'notes':
        return sharedContent.contentData?.title || 'Shared Study Notes';
      case 'qa':
        return sharedContent.contentData?.title || 'Shared Q&A Conversation';
      case 'youtube':
        return sharedContent.contentData?.videoTitle || 'Shared YouTube Video';
      default:
        return 'Shared Content';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={`${getTitle()} - PDFStudy.online`}
        description={`View shared ${sharedContent.contentType} content from PDFStudy.online`}
        ogImage={sharedContent.contentData.videoThumbnail || undefined}
      />
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold">{getTitle()}</h1>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

