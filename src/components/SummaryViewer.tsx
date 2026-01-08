import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Loader2, Sparkles, Copy, Check, Download, BookOpen, 
  Lightbulb, Target, Quote, FileText, Save, Share2
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { ShareButton } from './ShareButton';
import { generateNotesPDF } from '@/utils/generateNotesPDF';
import { generateShareLink } from '@/utils/shareContent';

interface SummaryViewerProps {
  content: string;
}

export interface StudyNotes {
  summary: string;
  keyPoints: string[];
  keyConcepts: { term: string; definition: string; importance: string }[];
  importantQuotes?: string[];
  actionItems?: string[];
  studyTips?: string[];
}

export function SummaryViewer({ content }: SummaryViewerProps) {
  const [notes, setNotes] = useState<StudyNotes | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('summary');
  const [isSaving, setIsSaving] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [shareCopied, setShareCopied] = useState(false);

  const generateNotes = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Please sign in to generate notes');
        return;
      }

      const response = await supabase.functions.invoke('study-tools-process', {
        body: { 
          type: 'generate',
          tool: 'notes-advanced',
          content 
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      setNotes(response.data);
      setHasGenerated(true);
      toast.success('Study notes generated!');
    } catch (error) {
      console.error('Notes generation error:', error);
      toast.error('Failed to generate notes. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!notes) return;
    
    try {
      let fullText = `# Study Notes\n\n## Summary\n${notes.summary}\n\n`;
      
      fullText += `## Key Points\n${notes.keyPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')}\n\n`;
      
      if (notes.keyConcepts?.length) {
        fullText += `## Key Concepts\n`;
        notes.keyConcepts.forEach(c => {
          fullText += `### ${c.term}\n${c.definition}\n*Importance: ${c.importance}*\n\n`;
        });
      }
      
      if (notes.studyTips?.length) {
        fullText += `## Study Tips\n${notes.studyTips.map(t => `- ${t}`).join('\n')}\n`;
      }
      
      await navigator.clipboard.writeText(fullText);
      setCopied(true);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const exportNotes = () => {
    if (!notes) return;
    
    // Use PDF export instead of markdown
    generateNotesPDF({
      notes: notes,
      title: 'Study Notes'
    });
  };

  const saveNotes = async () => {
    if (!notes) return;
    
    setIsSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Please sign in to save notes');
        return;
      }

      const response = await supabase.functions.invoke('study-tools-process', {
        body: {
          type: 'save-notes',
          notes: notes,
          title: `Study Notes - ${new Date().toLocaleDateString()}`,
          contentHash: content ? content.substring(0, 100) : ''
        }
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to save notes');
      }

      // Check if response.data contains an error
      if (response.data?.error) {
        throw new Error(response.data.error);
      }

      if (!response.data?.success) {
        throw new Error('Save operation failed. Please ensure database tables are created.');
      }

      toast.success('Notes saved successfully!');
    } catch (error: any) {
      console.error('Save error:', error);
      const errorMessage = error?.message || error?.error?.message || 'Failed to save notes. Please check if database migration has been applied.';
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = async () => {
    if (!notes) return;
    
    const shareUrl = await generateShareLink({
      contentType: 'notes',
      contentData: {
        notes: notes,
        title: `Study Notes - ${new Date().toLocaleDateString()}`
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
      setShareCopied(true);
      toast.success('Share link copied!');
      setTimeout(() => setShareCopied(false), 2000);
    } catch (e) {
      toast.error('Failed to copy link');
    }
  };

  if (!hasGenerated) {
    return (
      <div className="text-center py-8">
        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <BookOpen className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-lg font-medium mb-2">Generate Comprehensive Study Notes</h3>
        <p className="text-muted-foreground mb-4 max-w-md mx-auto">
          AI creates a detailed summary, key concepts with definitions, important highlights, and personalized study tips.
        </p>
        <Button onClick={generateNotes} disabled={isLoading} size="lg">
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Study Notes
            </>
          )}
        </Button>
      </div>
    );
  }

  if (!notes) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No notes generated. Try with different content.</p>
        <Button variant="outline" onClick={generateNotes} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header Actions */}
      <div className="flex justify-end gap-2 flex-wrap">
        <Button variant="ghost" size="sm" onClick={copyToClipboard}>
          {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
          Copy
        </Button>
        <Button variant="ghost" size="sm" onClick={exportNotes}>
          <Download className="h-4 w-4 mr-1" />
          Export PDF
        </Button>
        <Button variant="ghost" size="sm" onClick={saveNotes} disabled={isSaving}>
          {isSaving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
          Save
        </Button>
        <Button variant="ghost" size="sm" onClick={handleShare}>
          <Share2 className="h-4 w-4 mr-1" />
          Share
        </Button>
      </div>
      {shareUrl && (
        <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
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
            {shareCopied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          </Button>
        </div>
      )}

      {/* Tabs for different sections */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="summary" className="flex items-center gap-1">
            <FileText className="h-3 w-3" />
            <span className="hidden sm:inline">Summary</span>
          </TabsTrigger>
          <TabsTrigger value="concepts" className="flex items-center gap-1">
            <Lightbulb className="h-3 w-3" />
            <span className="hidden sm:inline">Concepts</span>
          </TabsTrigger>
          <TabsTrigger value="points" className="flex items-center gap-1">
            <Target className="h-3 w-3" />
            <span className="hidden sm:inline">Key Points</span>
          </TabsTrigger>
          <TabsTrigger value="tips" className="flex items-center gap-1">
            <BookOpen className="h-3 w-3" />
            <span className="hidden sm:inline">Tips</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="mt-4">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Summary
              </h3>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkMath]}
                  rehypePlugins={[rehypeKatex]}
                >
                  {notes.summary}
                </ReactMarkdown>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="concepts" className="mt-4">
          <div className="space-y-3">
            {notes.keyConcepts?.length ? (
              notes.keyConcepts.map((concept, index) => (
                <Card key={index} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="font-semibold text-primary flex items-center gap-2">
                          <Lightbulb className="h-4 w-4" />
                          {concept.term}
                        </h4>
                        <p className="mt-2 text-sm">{concept.definition}</p>
                        <Badge variant="secondary" className="mt-2">
                          {concept.importance}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">No key concepts extracted.</p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="points" className="mt-4">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Key Points
              </h3>
              <ul className="space-y-3">
                {notes.keyPoints.map((point, index) => (
                  <li key={index} className="flex gap-3">
                    <span className="flex-shrink-0 h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </span>
                    <span className="prose prose-sm dark:prose-invert">
                      <ReactMarkdown
                        remarkPlugins={[remarkMath]}
                        rehypePlugins={[rehypeKatex]}
                      >
                        {point}
                      </ReactMarkdown>
                    </span>
                  </li>
                ))}
              </ul>

              {/* Important Quotes */}
              {notes.importantQuotes?.length > 0 && (
                <div className="mt-6 pt-6 border-t">
                  <h4 className="font-semibold flex items-center gap-2 mb-3">
                    <Quote className="h-4 w-4" />
                    Important Quotes
                  </h4>
                  <div className="space-y-2">
                    {notes.importantQuotes.map((quote, index) => (
                      <blockquote key={index} className="border-l-2 border-primary pl-4 italic text-muted-foreground">
                        "{quote}"
                      </blockquote>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tips" className="mt-4">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Study Tips & Action Items
              </h3>
              
              {notes.studyTips?.length > 0 && (
                <div className="space-y-2 mb-6">
                  <h4 className="font-medium text-sm text-muted-foreground">💡 Study Tips</h4>
                  <ul className="space-y-2">
                    {notes.studyTips.map((tip, index) => (
                      <li key={index} className="flex gap-2 items-start bg-muted/50 rounded-lg p-3">
                        <Lightbulb className="h-4 w-4 text-yellow-500 shrink-0 mt-0.5" />
                        <span className="text-sm">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {notes.actionItems?.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-muted-foreground">✅ Action Items</h4>
                  <ul className="space-y-2">
                    {notes.actionItems.map((item, index) => (
                      <li key={index} className="flex gap-2 items-start">
                        <input type="checkbox" className="mt-1 rounded" />
                        <span className="text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {!notes.studyTips?.length && !notes.actionItems?.length && (
                <p className="text-center text-muted-foreground py-4">
                  No study tips or action items available.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Regenerate */}
      <div className="text-center pt-4 border-t">
        <Button variant="ghost" onClick={generateNotes} disabled={isLoading}>
          {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
          Regenerate Notes
        </Button>
      </div>
    </div>
  );
}
