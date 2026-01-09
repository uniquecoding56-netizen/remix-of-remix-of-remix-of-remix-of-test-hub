import { useState, useRef, useEffect, useCallback, forwardRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bot, Send, Loader2, Sparkles, Camera, Image, X, Volume2, VolumeX, Trash2, Settings, Brain, Plus, MessageSquare, Download, FileText, ChevronLeft, MoreVertical, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Message {
  role: 'user' | 'assistant';
  content: string | Array<{ type: string; text?: string; image_url?: { url: string } }>;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  updated_at: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-master-chat`;

const WELCOME_MESSAGE: Message = {
  role: 'assistant',
  content: "Hello! 👋 I'm **AI Master**, your friendly study companion! I'm here to help you learn and understand any subject.\n\n📸 **NEW!** You can now share images with me! Take a photo of your homework or upload an image, and I'll help you solve it.\n\n📚 **What I can help with:**\n- Math problems (step-by-step solutions)\n- Science concepts & experiments\n- Language & grammar questions\n- Any subject you're studying!\n\nJust type your question or share an image. Let's learn together! 🎓"
};

// Forward ref wrapper for DropdownMenuTrigger
const DropdownTriggerButton = forwardRef<HTMLButtonElement, React.ComponentProps<typeof Button>>((props, ref) => (
  <Button ref={ref} {...props} />
));
DropdownTriggerButton.displayName = 'DropdownTriggerButton';

export function AIMasterChat() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [unreadCount, setUnreadCount] = useState(1);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [chatId, setChatId] = useState<string | null>(null);
  const [showSessions, setShowSessions] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionTitle, setCurrentSessionTitle] = useState('New Chat');
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Load user settings and chat sessions on mount
  useEffect(() => {
    if (user) {
      loadUserSettings();
      loadChatSessions();
    }
  }, [user]);

  const loadUserSettings = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('user_settings')
      .select('sound_enabled')
      .eq('user_id', user.id)
      .single();
    
    if (data) {
      setSoundEnabled(data.sound_enabled);
    }
  };

  const loadChatSessions = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('ai_master_chats')
      .select('id, title, messages, updated_at')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });
    
    if (data && data.length > 0) {
      const formattedSessions: ChatSession[] = data.map(session => ({
        id: session.id,
        title: session.title || 'New Chat',
        messages: session.messages as unknown as Message[],
        updated_at: session.updated_at
      }));
      setSessions(formattedSessions);
      
      // Load the most recent session
      const latestSession = formattedSessions[0];
      if (latestSession.messages && latestSession.messages.length > 0) {
        setChatId(latestSession.id);
        setMessages(latestSession.messages);
        setCurrentSessionTitle(latestSession.title);
        setUnreadCount(0);
      }
    }
  };

  const saveChatHistory = async (newMessages: Message[], title?: string) => {
    if (!user) return;
    
    try {
      const sessionTitle = title || currentSessionTitle;
      if (chatId) {
        await supabase
          .from('ai_master_chats')
          .update({ 
            messages: JSON.parse(JSON.stringify(newMessages)),
            title: sessionTitle
          })
          .eq('id', chatId);
      } else {
        const { data } = await supabase
          .from('ai_master_chats')
          .insert([{ 
            user_id: user.id, 
            messages: JSON.parse(JSON.stringify(newMessages)),
            title: sessionTitle
          }])
          .select('id')
          .single();
        
        if (data) {
          setChatId(data.id);
        }
      }
      // Refresh sessions list
      loadChatSessions();
    } catch (error) {
      console.error('Error saving chat history:', error);
    }
  };

  const createNewSession = async () => {
    setMessages([WELCOME_MESSAGE]);
    setChatId(null);
    setCurrentSessionTitle('New Chat');
    setShowSessions(false);
    toast.success('New chat started');
  };

  const loadSession = (session: ChatSession) => {
    setChatId(session.id);
    setMessages(session.messages.length > 0 ? session.messages : [WELCOME_MESSAGE]);
    setCurrentSessionTitle(session.title);
    setShowSessions(false);
  };

  const deleteSession = async (sessionId: string) => {
    if (!user) return;
    
    await supabase.from('ai_master_chats').delete().eq('id', sessionId);
    
    if (sessionId === chatId) {
      setMessages([WELCOME_MESSAGE]);
      setChatId(null);
      setCurrentSessionTitle('New Chat');
    }
    
    loadChatSessions();
    toast.success('Chat deleted');
  };

  const updateSessionTitle = async () => {
    if (!chatId || !titleInput.trim()) return;
    
    await supabase
      .from('ai_master_chats')
      .update({ title: titleInput.trim() })
      .eq('id', chatId);
    
    setCurrentSessionTitle(titleInput.trim());
    setEditingTitle(false);
    loadChatSessions();
    toast.success('Title updated');
  };

  const exportChat = (format: 'pdf' | 'txt') => {
    const textContent = messages.map(msg => {
      const role = msg.role === 'user' ? 'You' : 'AI Master';
      const text = typeof msg.content === 'string' 
        ? msg.content 
        : msg.content.find(c => c.type === 'text')?.text || '';
      return `${role}:\n${text}\n`;
    }).join('\n---\n\n');

    if (format === 'txt') {
      const blob = new Blob([textContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentSessionTitle.replace(/[^a-z0-9]/gi, '_')}_chat.txt`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Chat exported as text file');
    } else {
      // Professional PDF export with PDFStudy branding
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>${currentSessionTitle} - PDFStudy.online</title>
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { 
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                padding: 40px; 
                max-width: 800px; 
                margin: 0 auto;
                line-height: 1.6;
                color: #333;
              }
              .header {
                text-align: center;
                padding-bottom: 25px;
                border-bottom: 3px solid #6366f1;
                margin-bottom: 30px;
              }
              .logo {
                font-size: 32px;
                font-weight: bold;
                background: linear-gradient(135deg, #6366f1, #8b5cf6);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                margin-bottom: 8px;
              }
              .tagline {
                font-size: 14px;
                color: #6b7280;
                margin-bottom: 15px;
              }
              h1 { 
                color: #1f2937; 
                font-size: 24px;
                margin-bottom: 5px;
              }
              .date {
                font-size: 12px;
                color: #9ca3af;
              }
              .message { 
                margin: 20px 0; 
                padding: 18px; 
                border-radius: 12px; 
              }
              .user { 
                background: linear-gradient(135deg, #6366f1, #8b5cf6); 
                color: white; 
                margin-left: 60px;
                border-bottom-right-radius: 4px;
              }
              .assistant { 
                background: #f8fafc; 
                border: 1px solid #e2e8f0;
                margin-right: 60px;
                border-bottom-left-radius: 4px;
              }
              .role { 
                font-weight: 600; 
                margin-bottom: 10px; 
                font-size: 13px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
              }
              .user .role { color: rgba(255,255,255,0.9); }
              .assistant .role { color: #6366f1; }
              .content {
                font-size: 14px;
                line-height: 1.7;
              }
              hr { 
                border: none; 
                border-top: 1px dashed #e2e8f0; 
                margin: 25px 0; 
              }
              .footer { 
                text-align: center; 
                color: #9ca3af; 
                margin-top: 50px;
                padding-top: 25px;
                border-top: 2px solid #e2e8f0;
                font-size: 12px;
              }
              .footer a {
                color: #6366f1;
                text-decoration: none;
              }
              @media print {
                body { padding: 20px; }
                .message { break-inside: avoid; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="logo">📚 PDFStudy.online</div>
              <div class="tagline">AI-Powered Study Companion</div>
              <h1>${currentSessionTitle}</h1>
              <div class="date">Generated on ${new Date().toLocaleDateString('en-US', { 
                day: '2-digit', 
                month: 'long', 
                year: 'numeric' 
              })}</div>
            </div>
            ${messages.map(msg => {
              const role = msg.role === 'user' ? '👤 You' : '🤖 AI Master';
              const text = typeof msg.content === 'string' 
                ? msg.content 
                : msg.content.find(c => c.type === 'text')?.text || '';
              return `<div class="message ${msg.role}">
                <div class="role">${role}</div>
                <div class="content">${text.replace(/\n/g, '<br>')}</div>
              </div>`;
            }).join('')}
            <div class="footer">
              <p>Exported from <a href="https://pdfstudy.online">PDFStudy.online</a></p>
              <p>Your AI-Powered Learning Platform</p>
            </div>
          </body>
          </html>
        `);
        printWindow.document.close();
        setTimeout(() => printWindow.print(), 300);
        toast.success('PDF export ready');
      }
    }
  };

  const toggleSound = async () => {
    const newValue = !soundEnabled;
    setSoundEnabled(newValue);
    
    if (user) {
      const { error } = await supabase
        .from('user_settings')
        .upsert({ user_id: user.id, sound_enabled: newValue }, { onConflict: 'user_id' });
      
      if (error) {
        console.error('Error saving settings:', error);
      }
    }
  };

  const clearCurrentChat = async () => {
    if (chatId && user) {
      await supabase.from('ai_master_chats').delete().eq('id', chatId);
    }
    setMessages([WELCOME_MESSAGE]);
    setChatId(null);
    setCurrentSessionTitle('New Chat');
    loadChatSessions();
    toast.success('Chat cleared');
  };

  // Play click sound and trigger haptic feedback
  const playClickFeedback = useCallback(() => {
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
    
    if (!soundEnabled) return;
    
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 600;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (e) {
      // Audio not supported
    }
  }, [soundEnabled]);

  const handleOpenChange = useCallback((isOpen: boolean) => {
    if (isOpen) {
      playClickFeedback();
      setUnreadCount(0);
      setShowSessions(false);
    }
    setOpen(isOpen);
  }, [playClickFeedback]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      // Check if mediaDevices is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast.error('Camera not supported on this device/browser. Try uploading an image instead.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      streamRef.current = stream;
      setShowCamera(true);
      
      // Wait for state to update then set video source
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(console.error);
        }
      }, 100);
    } catch (error: any) {
      console.error('Camera error:', error);
      if (error.name === 'NotAllowedError') {
        toast.error('Camera permission denied. Please allow camera access in your browser settings.');
      } else if (error.name === 'NotFoundError') {
        toast.error('No camera found. Please connect a camera or use image upload.');
      } else if (error.name === 'NotSupportedError' || error.name === 'TypeError') {
        toast.error('Camera not supported. Try uploading an image instead.');
      } else {
        toast.error('Could not access camera. Try uploading an image instead.');
      }
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && videoRef.current.videoWidth > 0) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg', 0.85);
        setImagePreview(imageData);
        stopCamera();
        toast.success('Photo captured!');
      }
    } else {
      toast.error('Camera not ready. Please wait and try again.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Image too large. Please use an image under 10MB.');
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          setImagePreview(result);
          toast.success('Image uploaded!');
        }
      };
      reader.onerror = () => {
        toast.error('Failed to read image. Please try again.');
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const streamChat = async (userMessages: Message[]) => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.access_token) {
      throw new Error('Please sign in to use AI Master');
    }

    const resp = await fetch(CHAT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`
      },
      body: JSON.stringify({
        messages: userMessages
      })
    });

    if (!resp.ok) {
      const errorData = await resp.json().catch(() => ({}));
      if (resp.status === 429) {
        throw new Error('Rate limit exceeded. Please wait a moment and try again.');
      }
      if (resp.status === 402) {
        throw new Error('AI credits exhausted. Please try again later.');
      }
      throw new Error(errorData.error || 'Failed to get response');
    }

    if (!resp.body) throw new Error('No response body');

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = '';
    let assistantContent = '';
    let hasAddedAssistantMessage = false;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      textBuffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);

        if (line.endsWith('\r')) line = line.slice(0, -1);
        if (line.startsWith(':') || line.trim() === '') continue;
        if (!line.startsWith('data: ')) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === '[DONE]') break;

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) {
            assistantContent += content;
            
            // Update messages state with streaming content
            setMessages(prev => {
              if (!hasAddedAssistantMessage) {
                hasAddedAssistantMessage = true;
                return [...prev, { role: 'assistant', content: assistantContent }];
              }
              // Update the last assistant message
              return prev.map((m, i) => 
                i === prev.length - 1 && m.role === 'assistant' 
                  ? { ...m, content: assistantContent } 
                  : m
              );
            });
          }
        } catch {
          // JSON parse error, continue
        }
      }
    }

    return assistantContent;
  };

  const handleSend = async () => {
    if ((!input.trim() && !imagePreview) || isLoading) return;

    let messageContent: Message['content'];
    
    if (imagePreview) {
      messageContent = [
        { type: 'text', text: input.trim() || 'Please analyze this image and help me understand it.' },
        { type: 'image_url', image_url: { url: imagePreview } }
      ];
    } else {
      messageContent = input.trim();
    }

    const userMessage: Message = {
      role: 'user',
      content: messageContent
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setImagePreview(null);
    setIsLoading(true);

    try {
      const apiMessages = updatedMessages.filter((_, i) => i !== 0);
      const assistantResponse = await streamChat(apiMessages);
      
      // Get final messages state and save
      setMessages(prev => {
        const latestMessages = [...prev];
        // Auto-generate title from first user message if it's a new chat
        if (!chatId && latestMessages.length >= 2) {
          const firstUserMsg = latestMessages.find(m => m.role === 'user');
          if (firstUserMsg) {
            const text = typeof firstUserMsg.content === 'string' 
              ? firstUserMsg.content 
              : firstUserMsg.content.find(c => c.type === 'text')?.text || 'New Chat';
            const autoTitle = text.slice(0, 50) + (text.length > 50 ? '...' : '');
            setCurrentSessionTitle(autoTitle);
            saveChatHistory(latestMessages, autoTitle);
          }
        } else {
          saveChatHistory(latestMessages);
        }
        return latestMessages;
      });
      
      if (!open) {
        setUnreadCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Chat error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to get response');
      // Remove empty assistant message if error occurred
      setMessages(prev => {
        if (prev[prev.length - 1]?.role === 'assistant' && prev[prev.length - 1]?.content === '') {
          return prev.slice(0, -1);
        }
        return prev;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getMessageText = (content: Message['content']): string => {
    if (typeof content === 'string') return content;
    const textPart = content.find(part => part.type === 'text');
    return textPart?.text || '';
  };

  const getMessageImage = (content: Message['content']): string | null => {
    if (typeof content === 'string') return null;
    const imagePart = content.find(part => part.type === 'image_url');
    return imagePart?.image_url?.url || null;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 group cursor-pointer">
          <div className="absolute inset-0 rounded-full border-2 border-primary/30 scale-100 group-hover:scale-150 group-hover:opacity-0 transition-all duration-700 ease-out" />
          <div className="absolute inset-0 rounded-full border border-primary/20 scale-100 group-hover:scale-[1.8] group-hover:opacity-0 transition-all duration-1000 ease-out delay-100" />
          
          <div className="absolute inset-[-4px] rounded-full bg-gradient-to-r from-primary via-purple-500 to-primary opacity-60 blur-xl group-hover:opacity-90 group-hover:blur-2xl transition-all duration-500 animate-pulse" />
          <div className="absolute inset-[-2px] rounded-full bg-gradient-to-br from-primary/80 to-purple-600/80 opacity-40 blur-md group-hover:opacity-70 transition-all duration-300" />
          
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-primary/40 blur-lg translate-y-2 group-hover:translate-y-3 transition-transform duration-300" />
            <Button 
              size="lg" 
              className="relative h-14 w-14 sm:h-16 sm:w-16 rounded-full shadow-2xl bg-gradient-to-br from-primary via-primary to-purple-600 hover:from-primary hover:via-purple-500 hover:to-purple-600 border border-white/20 transition-all duration-500 group-hover:scale-110 group-hover:shadow-[0_0_40px_rgba(139,92,246,0.5)] active:scale-95 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent rounded-full" />
              <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/5 to-white/20 rounded-full" />
              <div className="absolute inset-0 rounded-full border border-white/10 group-hover:rotate-180 transition-transform duration-700" />
              <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-white relative z-10 group-hover:rotate-12 transition-transform duration-300" />
            </Button>
          </div>
          
          {unreadCount > 0 && (
            <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2">
              <div className="absolute inset-0 bg-destructive rounded-full animate-ping opacity-75" />
              <Badge 
                className="relative h-5 min-w-5 sm:h-6 sm:min-w-6 flex items-center justify-center rounded-full bg-destructive text-destructive-foreground text-xs font-bold shadow-lg border-2 border-background"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </Badge>
            </div>
          )}
          
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full opacity-0 group-hover:opacity-100 group-hover:-translate-y-[calc(100%+12px)] transition-all duration-300 pointer-events-none">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-md" />
              <div className="relative bg-background/95 backdrop-blur-sm border border-border rounded-full px-3 py-1.5 shadow-lg">
                <span className="text-xs font-semibold text-foreground whitespace-nowrap flex items-center gap-1.5">
                  <Brain className="w-3 h-3 text-primary" />
                  AI Master
                </span>
              </div>
              <div className="absolute left-1/2 -translate-x-1/2 top-full w-2 h-2 bg-background border-r border-b border-border rotate-45 -mt-1" />
            </div>
          </div>
          
          <div className="absolute -bottom-0.5 -right-0.5 sm:bottom-0 sm:right-0">
            <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-50" />
            <div className="relative h-3.5 w-3.5 sm:h-4 sm:w-4 bg-gradient-to-br from-green-400 to-green-500 rounded-full border-2 border-background shadow-lg" />
          </div>
        </div>
      </SheetTrigger>
      
      <SheetContent className="w-full sm:max-w-md p-0 flex flex-col">
        {/* Sessions List View */}
        {showSessions ? (
          <div className="flex flex-col h-full">
            <div className="p-4 border-b border-border bg-gradient-to-r from-primary/10 to-purple-600/10">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" onClick={() => setShowSessions(false)}>
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <div>
                  <h2 className="font-semibold">Chat History</h2>
                  <p className="text-xs text-muted-foreground">{sessions.length} conversation{sessions.length !== 1 ? 's' : ''}</p>
                </div>
              </div>
            </div>
            
            <div className="p-3">
              <Button onClick={createNewSession} className="w-full gap-2">
                <Plus className="h-4 w-4" />
                New Chat
              </Button>
            </div>
            
            <ScrollArea className="flex-1 px-3">
              <div className="space-y-2 pb-4">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className={`p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors ${
                      session.id === chatId ? 'border-primary bg-primary/5' : 'border-border'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div 
                        className="flex-1 min-w-0"
                        onClick={() => loadSession(session)}
                      >
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4 text-muted-foreground shrink-0" />
                          <p className="font-medium text-sm truncate">{session.title}</p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDate(session.updated_at)} • {session.messages.length} messages
                        </p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <DropdownTriggerButton variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                            <MoreVertical className="h-4 w-4" />
                          </DropdownTriggerButton>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => loadSession(session)}>
                            Open
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => deleteSession(session.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
                
                {sessions.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">No chat history yet</p>
                    <p className="text-xs">Start a conversation to see it here</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        ) : (
          <>
            <SheetHeader className="p-4 border-b border-border bg-gradient-to-r from-primary/10 to-purple-600/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-r from-primary to-purple-600 flex items-center justify-center shrink-0">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    {editingTitle ? (
                      <div className="flex items-center gap-2">
                        <Input
                          value={titleInput}
                          onChange={(e) => setTitleInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') updateSessionTitle();
                            if (e.key === 'Escape') setEditingTitle(false);
                          }}
                          className="h-7 text-sm"
                          autoFocus
                        />
                        <Button size="sm" variant="ghost" onClick={updateSessionTitle}>
                          Save
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <SheetTitle className="text-left truncate">{currentSessionTitle}</SheetTitle>
                        {chatId && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 shrink-0"
                            onClick={() => {
                              setTitleInput(currentSessionTitle);
                              setEditingTitle(true);
                            }}
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">Your Friendly Study Companion 📚</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowSessions(true)}
                    className="h-8 w-8"
                    title="Chat History"
                  >
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <DropdownTriggerButton
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        title="Options"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </DropdownTriggerButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={createNewSession}>
                        <Plus className="h-4 w-4 mr-2" />
                        New Chat
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => exportChat('txt')}>
                        <FileText className="h-4 w-4 mr-2" />
                        Export as Text
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => exportChat('pdf')}>
                        <Download className="h-4 w-4 mr-2" />
                        Export as PDF
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={toggleSound}>
                        {soundEnabled ? <Volume2 className="h-4 w-4 mr-2" /> : <VolumeX className="h-4 w-4 mr-2" />}
                        Sound {soundEnabled ? 'On' : 'Off'}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={clearCurrentChat} className="text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Clear This Chat
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </SheetHeader>

            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.role === 'assistant' && (
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarFallback className="bg-gradient-to-r from-primary to-purple-600 text-white">
                          <Bot className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div className={`max-w-[85%] rounded-2xl px-4 py-2 ${
                      message.role === 'user' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted'
                    }`}>
                      {getMessageImage(message.content) && (
                        <img 
                          src={getMessageImage(message.content)!} 
                          alt="Uploaded" 
                          className="max-w-full rounded-lg mb-2 max-h-48 object-contain"
                        />
                      )}
                      <div className="text-sm prose prose-sm dark:prose-invert max-w-none [&>p]:my-1 [&>ul]:my-1 [&>ol]:my-1 [&_.katex]:text-inherit">
                        <ReactMarkdown
                          remarkPlugins={[remarkMath]}
                          rehypePlugins={[rehypeKatex]}
                        >
                          {getMessageText(message.content)}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>
                ))}
                
                {isLoading && messages[messages.length - 1]?.role === 'user' && (
                  <div className="flex gap-3 justify-start">
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarFallback className="bg-gradient-to-r from-primary to-purple-600 text-white">
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-muted rounded-2xl px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm text-muted-foreground">Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Camera View */}
            {showCamera && (
              <div className="absolute inset-0 bg-background z-50 flex flex-col">
                <div className="flex justify-between items-center p-4 border-b">
                  <span className="font-medium">📷 Take a Photo</span>
                  <Button variant="ghost" size="icon" onClick={stopCamera}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <div className="flex-1 relative bg-black">
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    muted
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4 flex justify-center gap-4 bg-background">
                  <Button 
                    variant="outline"
                    onClick={stopCamera}
                  >
                    Cancel
                  </Button>
                  <Button 
                    size="lg" 
                    className="rounded-full h-16 w-16"
                    onClick={capturePhoto}
                  >
                    <Camera className="h-6 w-6" />
                  </Button>
                </div>
              </div>
            )}

            {/* Image Preview */}
            {imagePreview && (
              <div className="px-4 py-2 border-t border-border bg-muted/50">
                <div className="relative inline-block">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="h-20 rounded-lg object-cover border border-border"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                    onClick={removeImage}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Image attached • Add a question below</p>
              </div>
            )}

            <div className="p-4 border-t border-border">
              <div className="flex gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                  title="Upload image"
                >
                  <Image className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={startCamera}
                  disabled={isLoading}
                  title="Take photo"
                >
                  <Camera className="h-4 w-4" />
                </Button>
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={imagePreview ? "Ask about this image..." : "Ask me anything..."}
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button 
                  onClick={handleSend} 
                  disabled={isLoading || (!input.trim() && !imagePreview)} 
                  size="icon"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground text-center mt-2">
                📷 Camera & 🖼️ Image upload supported • Press Enter to send
              </p>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
