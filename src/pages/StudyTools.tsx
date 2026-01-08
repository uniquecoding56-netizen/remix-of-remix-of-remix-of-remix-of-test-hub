import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Upload, Link as LinkIcon, FileText, Sparkles, Timer, Brain, PenLine } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { StudyToolsInput } from '@/components/StudyToolsInput';
import { FlashcardViewer } from '@/components/FlashcardViewer';
import { QuizGenerator } from '@/components/QuizGenerator';
import { SummaryViewer } from '@/components/SummaryViewer';
import { ContentQA } from '@/components/ContentQA';
import { PomodoroStudy } from '@/components/PomodoroStudy';
import { MindMapQuiz } from '@/components/MindMapQuiz';
import { ActiveRecall } from '@/components/ActiveRecall';
import { useAuth } from '@/hooks/useAuth';
import { SEOHead } from '@/components/SEOHead';

export default function StudyTools() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [content, setContent] = useState<string>('');
  const [contentType, setContentType] = useState<'upload' | 'link' | 'paste'>('paste');
  const [activeOutputTab, setActiveOutputTab] = useState<string>('flashcards');
  const [isProcessing, setIsProcessing] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    navigate('/auth');
    return null;
  }

  const handleContentReady = (extractedContent: string, type: 'upload' | 'link' | 'paste') => {
    setContent(extractedContent);
    setContentType(type);
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="AI Study Tools - PDF to Notes, Flashcards & Quizzes | PDFStudy.online"
        description="Transform your study materials into AI-generated notes, flashcards, quizzes, and more. Upload PDFs or paste YouTube links."
        keywords="study tools, flashcard generator, quiz maker, AI notes, PDF to flashcards"
        canonicalUrl="https://pdfstudy.online/study-tools"
      />

      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-primary to-purple-600 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <h1 className="text-xl font-bold">Study Tools</h1>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Input Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Add Your Study Material
              </CardTitle>
              <CardDescription>
                Upload a file, paste a link, or type/paste text to generate study tools
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="paste" className="w-full">
                <TabsList className="grid w-full grid-cols-3 h-auto p-1">
                  <TabsTrigger value="upload" className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm py-2">
                    <Upload className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span className="hidden xs:inline sm:inline">Upload</span>
                  </TabsTrigger>
                  <TabsTrigger value="link" className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm py-2">
                    <LinkIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span className="hidden xs:inline sm:inline">Link</span>
                  </TabsTrigger>
                  <TabsTrigger value="paste" className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm py-2">
                    <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span className="hidden xs:inline sm:inline">Paste</span>
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="upload" className="mt-4">
                  <StudyToolsInput 
                    type="upload" 
                    onContentReady={handleContentReady}
                    isProcessing={isProcessing}
                    setIsProcessing={setIsProcessing}
                  />
                </TabsContent>
                
                <TabsContent value="link" className="mt-4">
                  <StudyToolsInput 
                    type="link" 
                    onContentReady={handleContentReady}
                    isProcessing={isProcessing}
                    setIsProcessing={setIsProcessing}
                  />
                </TabsContent>
                
                <TabsContent value="paste" className="mt-4">
                  <StudyToolsInput 
                    type="paste" 
                    onContentReady={handleContentReady}
                    isProcessing={isProcessing}
                    setIsProcessing={setIsProcessing}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Output Section */}
          {content && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  AI Study Tools
                </CardTitle>
                <CardDescription>
                  Generate flashcards, quizzes, summaries, and more from your content
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeOutputTab} onValueChange={setActiveOutputTab}>
                  <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7 h-auto p-1 gap-1">
                    <TabsTrigger value="flashcards" className="text-xs py-2 px-1">
                      <Sparkles className="h-3 w-3 mr-1 hidden sm:inline" />
                      Cards
                    </TabsTrigger>
                    <TabsTrigger value="quiz" className="text-xs py-2 px-1">
                      <Brain className="h-3 w-3 mr-1 hidden sm:inline" />
                      Quiz
                    </TabsTrigger>
                    <TabsTrigger value="summary" className="text-xs py-2 px-1">
                      <FileText className="h-3 w-3 mr-1 hidden sm:inline" />
                      Notes
                    </TabsTrigger>
                    <TabsTrigger value="qa" className="text-xs py-2 px-1">
                      <Brain className="h-3 w-3 mr-1 hidden sm:inline" />
                      AI Q&A
                    </TabsTrigger>
                    <TabsTrigger value="pomodoro" className="text-xs py-2 px-1 hidden lg:flex">
                      <Timer className="h-3 w-3 mr-1" />
                      Timer
                    </TabsTrigger>
                    <TabsTrigger value="concept" className="text-xs py-2 px-1 hidden lg:flex">
                      <Brain className="h-3 w-3 mr-1" />
                      Concept
                    </TabsTrigger>
                    <TabsTrigger value="recall" className="text-xs py-2 px-1 hidden lg:flex">
                      <PenLine className="h-3 w-3 mr-1" />
                      Recall
                    </TabsTrigger>
                  </TabsList>

                  {/* Mobile-only additional tabs */}
                  <div className="lg:hidden mt-2">
                    <TabsList className="grid w-full grid-cols-3 h-auto p-1">
                      <TabsTrigger value="pomodoro" className="text-xs py-2 px-1">
                        <Timer className="h-3 w-3 mr-1" />
                        Timer
                      </TabsTrigger>
                      <TabsTrigger value="concept" className="text-xs py-2 px-1">
                        <Brain className="h-3 w-3 mr-1" />
                        Concept
                      </TabsTrigger>
                      <TabsTrigger value="recall" className="text-xs py-2 px-1">
                        <PenLine className="h-3 w-3 mr-1" />
                        Recall
                      </TabsTrigger>
                    </TabsList>
                  </div>
                  
                  <TabsContent value="flashcards" className="mt-4">
                    <FlashcardViewer content={content} />
                  </TabsContent>
                  
                  <TabsContent value="quiz" className="mt-4">
                    <QuizGenerator content={content} />
                  </TabsContent>
                  
                  <TabsContent value="summary" className="mt-4">
                    <SummaryViewer content={content} />
                  </TabsContent>
                  
                  <TabsContent value="qa" className="mt-4">
                    <ContentQA content={content} />
                  </TabsContent>

                  <TabsContent value="pomodoro" className="mt-4">
                    <PomodoroStudy content={content} />
                  </TabsContent>

                  <TabsContent value="concept" className="mt-4">
                    <MindMapQuiz content={content} />
                  </TabsContent>

                  <TabsContent value="recall" className="mt-4">
                    <ActiveRecall content={content} />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}

          {/* Empty State */}
          {!content && (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Sparkles className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">No content added yet</h3>
                <p className="text-muted-foreground max-w-md">
                  Add your study material above to unlock 7 powerful AI study tools:
                </p>
                <div className="flex flex-wrap justify-center gap-2 mt-4 max-w-md">
                  {[
                    'Smart Flashcards',
                    'Practice Quiz',
                    'AI Notes',
                    'Q&A Tutor',
                    'Pomodoro Timer',
                    'Concept Quiz',
                    'Active Recall'
                  ].map((tool) => (
                    <span key={tool} className="px-3 py-1 bg-primary/10 text-primary text-xs rounded-full">
                      {tool}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
