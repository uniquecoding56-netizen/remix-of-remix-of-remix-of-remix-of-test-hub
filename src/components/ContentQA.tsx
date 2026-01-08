import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Send, Loader2, Bot, User, Sparkles, GraduationCap, 
  Lightbulb, BookOpen, HelpCircle, Trash2, Save, Share2, Download, Copy, Check
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { generateQAPDF } from '@/utils/generateQAPDF';
import { generateShareLink } from '@/utils/shareContent';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
}

interface ContentQAProps {
  content: string;
}

const TUTOR_MODES = [
  { id: 'explain', label: 'Explain', icon: Lightbulb, prompt: 'Explain this concept simply: ' },
  { id: 'example', label: 'Give Example', icon: BookOpen, prompt: 'Give me a real-world example of: ' },
  { id: 'stepbystep', label: 'Step by Step', icon: GraduationCap, prompt: 'Walk me through step by step: ' },
  { id: 'quiz', label: 'Quiz Me', icon: HelpCircle, prompt: 'Create a quick quiz question about: ' },
];

export function ContentQA({ content }: ContentQAProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [shareCopied, setShareCopied] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendQuestion = async (customQuestion?: string) => {
    const question = customQuestion || input.trim();
    if (!question || isLoading) return;

    const userMessage: Message = { role: 'user', content: question };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setSelectedMode(null);
    setIsLoading(true);

    // Add streaming placeholder
    setMessages(prev => [...prev, { role: 'assistant', content: '', isStreaming: true }]);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Please sign in to ask questions');
        setMessages(prev => prev.slice(0, -1));
        return;
      }

      const response = await supabase.functions.invoke('study-tools-process', {
        body: { 
          type: 'tutor-qa',
          content,
          question,
          chatHistory: messages.filter(m => !m.isStreaming)
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      // Update the streaming message with actual response
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = { 
          role: 'assistant', 
          content: response.data.answer,
          isStreaming: false
        };
        return newMessages;
      });
    } catch (error) {
      console.error('Q&A error:', error);
      toast.error('Failed to get answer. Please try again.');
      setMessages(prev => prev.slice(0, -1)); // Remove the streaming placeholder
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendQuestion();
    }
  };

  const handleModeSelect = (mode: typeof TUTOR_MODES[0]) => {
    if (selectedMode === mode.id) {
      setSelectedMode(null);
      setInput('');
    } else {
      setSelectedMode(mode.id);
      setInput(mode.prompt);
      inputRef.current?.focus();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setShareUrl(null);
    toast.success('Chat cleared');
  };

  const saveConversation = async () => {
    if (messages.length === 0) {
      toast.error('No conversation to save');
      return;
    }

    setIsSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Please sign in to save conversation');
        return;
      }

      const response = await supabase.functions.invoke('study-tools-process', {
        body: {
          type: 'save-qa',
          conversationData: {
            content: content,
            messages: messages,
            title: `Q&A Conversation - ${new Date().toLocaleDateString()}`
          }
        }
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to save conversation');
      }

      // Check if response.data contains an error
      if (response.data?.error) {
        throw new Error(response.data.error);
      }

      if (!response.data?.success) {
        throw new Error('Save operation failed. Please ensure database tables are created.');
      }

      toast.success('Conversation saved successfully!');
    } catch (error: any) {
      console.error('Save error:', error);
      const errorMessage = error?.message || error?.error?.message || 'Failed to save conversation. Please check if database migration has been applied.';
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const exportToPDF = () => {
    if (messages.length === 0) {
      toast.error('No conversation to export');
      return;
    }

    generateQAPDF({
      messages: messages,
      content: content,
      title: `AI Q&A Conversation - ${new Date().toLocaleDateString()}`
    });
  };

  const handleShare = async () => {
    if (messages.length === 0) {
      toast.error('No conversation to share');
      return;
    }

    const shareUrl = await generateShareLink({
      contentType: 'qa',
      contentData: {
        content: content,
        messages: messages,
        title: `Q&A Conversation - ${new Date().toLocaleDateString()}`
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

  const suggestedQuestions = [
    "What are the main concepts?",
    "Explain this like I'm 5",
    "Give me real-world examples",
    "What should I focus on?",
    "Create a mnemonic to remember this"
  ];

  return (
    <div className="space-y-4">
      {/* Tutor Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold">AI Master Tutor</h3>
            <p className="text-xs text-muted-foreground">Ask me anything about your content</p>
          </div>
        </div>
        {messages.length > 0 && (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={exportToPDF}>
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={saveConversation} disabled={isSaving}>
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="sm" onClick={handleShare}>
              <Share2 className="h-4 w-4" />
            </Button>
          <Button variant="ghost" size="sm" onClick={clearChat}>
            <Trash2 className="h-4 w-4" />
          </Button>
          </div>
        )}
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

      {/* Quick Mode Buttons */}
      <div className="flex flex-wrap gap-2">
        {TUTOR_MODES.map((mode) => (
          <Button
            key={mode.id}
            variant={selectedMode === mode.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleModeSelect(mode)}
            className="flex items-center gap-1"
          >
            <mode.icon className="h-3 w-3" />
            {mode.label}
          </Button>
        ))}
      </div>

      {/* Empty state with suggestions */}
      {messages.length === 0 && (
        <div className="text-center py-6 bg-muted/30 rounded-lg">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <h3 className="font-medium mb-2">Your Personal AI Tutor</h3>
          <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
            I've deeply analyzed your content. Ask me to explain concepts, give examples, 
            break down complex topics, or quiz you on what you've learned!
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {suggestedQuestions.map((q, i) => (
              <Badge 
                key={i} 
                variant="secondary"
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => setInput(q)}
              >
                {q}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Chat Messages */}
      {messages.length > 0 && (
        <ScrollArea className="h-[350px] pr-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className="bg-gradient-to-br from-primary to-purple-600 text-white">
                      <GraduationCap className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.role === 'user' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted'
                }`}>
                  {message.isStreaming ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Thinking...</span>
                    </div>
                  ) : (
                    <div className="text-sm prose prose-sm dark:prose-invert max-w-none [&>p]:my-1 [&>ul]:my-2 [&>ol]:my-2">
                      <ReactMarkdown
                        remarkPlugins={[remarkMath]}
                        rehypePlugins={[rehypeKatex]}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
                {message.role === 'user' && (
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className="bg-muted">
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      )}

      {/* Input */}
      <div className="flex gap-2">
        <Input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask me anything about your content..."
          disabled={isLoading}
          className="flex-1"
        />
        <Button onClick={() => sendQuestion()} disabled={isLoading || !input.trim()} size="icon">
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </div>

      {/* Tips */}
      <p className="text-xs text-muted-foreground text-center">
        💡 Tip: Use the quick modes above for structured learning, or ask anything in natural language!
      </p>
    </div>
  );
}
