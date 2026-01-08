import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, Link as LinkIcon, FileText, Loader2, X, CheckCircle, 
  Youtube, FileAudio, FileVideo, FileType, Globe, Languages, Play, Save
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface StudyToolsInputProps {
  type: 'upload' | 'link' | 'paste';
  onContentReady: (content: string, type: 'upload' | 'link' | 'paste', metadata?: ContentMetadata) => void;
  isProcessing: boolean;
  setIsProcessing: (value: boolean) => void;
}

export interface ContentMetadata {
  sourceType: 'text' | 'image' | 'pdf' | 'document' | 'audio' | 'video' | 'youtube' | 'website';
  fileName?: string;
  language?: string;
  duration?: string;
  title?: string;
}

const SUPPORTED_FILE_TYPES = {
  text: ['.txt', '.md', '.rtf'],
  document: ['.pdf', '.doc', '.docx', '.ppt', '.pptx'],
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  audio: ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a', '.mp3', '.wav', '.ogg', '.m4a'],
  video: ['video/mp4', 'video/webm', 'video/ogg', '.mp4', '.webm', '.mov']
};

export function StudyToolsInput({ 
  type, 
  onContentReady, 
  isProcessing, 
  setIsProcessing 
}: StudyToolsInputProps) {
  const [linkUrl, setLinkUrl] = useState('');
  const [pasteText, setPasteText] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileType, setFileType] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [detectedLanguage, setDetectedLanguage] = useState<string | null>(null);
  const [youtubeMetadata, setYoutubeMetadata] = useState<{
    videoId: string;
    thumbnail: string;
    title: string;
  } | null>(null);
  const [isSavingYouTube, setIsSavingYouTube] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileCategory = (file: File): string => {
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (SUPPORTED_FILE_TYPES.text.includes(extension)) return 'text';
    if (SUPPORTED_FILE_TYPES.document.some(ext => extension === ext || file.type.includes('pdf') || file.type.includes('document') || file.type.includes('presentation'))) return 'document';
    if (SUPPORTED_FILE_TYPES.image.some(type => file.type.startsWith('image/'))) return 'image';
    if (SUPPORTED_FILE_TYPES.audio.some(type => file.type.startsWith('audio/') || extension === type)) return 'audio';
    if (SUPPORTED_FILE_TYPES.video.some(type => file.type.startsWith('video/') || extension === type)) return 'video';
    return 'unknown';
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 50MB for audio/video, 20MB for others)
    const maxSize = ['audio', 'video'].includes(getFileCategory(file)) ? 50 * 1024 * 1024 : 20 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error(`File too large. Maximum size: ${maxSize / 1024 / 1024}MB`);
      return;
    }

    const category = getFileCategory(file);
    if (category === 'unknown') {
      toast.error('Unsupported file type. Please upload a text, document, image, audio, or video file.');
      return;
    }

    setFileName(file.name);
    setFileType(category);
    setIsProcessing(true);
    setUploadProgress(10);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Please sign in to process files');
        setIsProcessing(false);
        return;
      }

      setUploadProgress(30);

      // Handle text files directly
      if (category === 'text') {
        const text = await file.text();
        setUploadProgress(100);
        onContentReady(text, 'upload', { sourceType: 'text', fileName: file.name });
        toast.success('Text file processed successfully!');
        setIsProcessing(false);
        return;
      }

      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;
        setUploadProgress(50);

        try {
          const response = await supabase.functions.invoke('study-tools-process', {
            body: { 
              type: 'file-process',
              fileType: category,
              fileData: base64,
              fileName: file.name
            }
          });

          setUploadProgress(90);

          if (response.error) {
            throw new Error(response.error.message);
          }

          setUploadProgress(100);
          setDetectedLanguage(response.data.language);
          
          onContentReady(response.data.content, 'upload', {
            sourceType: category as any,
            fileName: file.name,
            language: response.data.language,
            title: response.data.title
          });
          
          toast.success(`${category.charAt(0).toUpperCase() + category.slice(1)} processed successfully!`);
        } catch (error) {
          console.error('File processing error:', error);
          toast.error('Failed to process file. Please try again.');
        } finally {
          setIsProcessing(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('File upload error:', error);
      toast.error('Failed to upload file. Please try again.');
      setIsProcessing(false);
    }
  };

  const isYouTubeUrl = (url: string): boolean => {
    return url.includes('youtube.com/watch') || url.includes('youtu.be/') || url.includes('youtube.com/embed');
  };

  const extractYouTubeId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const handleLinkProcess = async () => {
    if (!linkUrl.trim()) {
      toast.error('Please enter a valid URL');
      return;
    }

    setIsProcessing(true);
    setUploadProgress(10);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Please sign in to process links');
        setIsProcessing(false);
        return;
      }

      const isYouTube = isYouTubeUrl(linkUrl);
      setUploadProgress(30);

      const response = await supabase.functions.invoke('study-tools-process', {
        body: { 
          type: isYouTube ? 'youtube' : 'website',
          url: linkUrl.trim() 
        }
      });

      setUploadProgress(90);

      if (response.error) {
        throw new Error(response.error.message);
      }

      setUploadProgress(100);
      setDetectedLanguage(response.data.language);

      // Handle YouTube metadata
      if (isYouTube && response.data.videoId) {
        setYoutubeMetadata({
          videoId: response.data.videoId,
          thumbnail: response.data.thumbnail || `https://img.youtube.com/vi/${response.data.videoId}/maxresdefault.jpg`,
          title: response.data.title || 'YouTube Video'
        });

        // Auto-save YouTube video
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            await saveYouTubeVideo({
              videoUrl: linkUrl.trim(),
              videoId: response.data.videoId,
              videoTitle: response.data.title,
              videoThumbnail: response.data.thumbnail,
              transcript: response.data.content
            });
          }
        } catch (e) {
          console.error('Auto-save failed:', e);
        }
      } else {
        setYoutubeMetadata(null);
      }

      onContentReady(response.data.content, 'link', {
        sourceType: isYouTube ? 'youtube' : 'website',
        title: response.data.title,
        language: response.data.language,
        duration: response.data.duration,
        videoId: isYouTube ? response.data.videoId : undefined,
        thumbnail: isYouTube ? response.data.thumbnail : undefined
      });
      
      toast.success(isYouTube ? 'YouTube video transcript extracted!' : 'Website content extracted!');
    } catch (error) {
      console.error('Link processing error:', error);
      toast.error('Failed to process link. Please check the URL and try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePasteSubmit = async () => {
    if (!pasteText.trim()) {
      toast.error('Please enter some text');
      return;
    }

    if (pasteText.trim().length < 50) {
      toast.error('Please enter at least 50 characters for better results');
      return;
    }

    setIsProcessing(true);
    
    try {
      // Detect language
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const response = await supabase.functions.invoke('study-tools-process', {
          body: { 
            type: 'detect-language',
            content: pasteText.trim().substring(0, 500)
          }
        });
        
        if (response.data?.language) {
          setDetectedLanguage(response.data.language);
        }
      }

      onContentReady(pasteText.trim(), 'paste', { sourceType: 'text' });
      toast.success('Content ready for processing!');
    } catch (error) {
      // Still proceed even if language detection fails
      onContentReady(pasteText.trim(), 'paste', { sourceType: 'text' });
      toast.success('Content ready for processing!');
    } finally {
      setIsProcessing(false);
    }
  };

  const clearFile = () => {
    setFileName(null);
    setFileType(null);
    setUploadProgress(0);
    setDetectedLanguage(null);
    setYoutubeMetadata(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const saveYouTubeVideo = async (videoData: {
    videoUrl: string;
    videoId: string;
    videoTitle: string;
    videoThumbnail: string;
    transcript: string;
  }) => {
    setIsSavingYouTube(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        return;
      }

      const response = await supabase.functions.invoke('study-tools-process', {
        body: {
          type: 'save-youtube',
          videoData: videoData
        }
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to save YouTube video');
      }

      // Check if response.data contains an error
      if (response.data?.error) {
        throw new Error(response.data.error);
      }

      if (!response.data?.success) {
        throw new Error('Save operation failed. Please ensure database tables are created.');
      }

      toast.success('YouTube video saved automatically!');
    } catch (error: any) {
      console.error('Save YouTube error:', error);
      // Don't show error toast for auto-save failures to avoid annoying users
      // But log it for debugging
    } finally {
      setIsSavingYouTube(false);
    }
  };

  const getFileIcon = () => {
    switch (fileType) {
      case 'audio': return <FileAudio className="h-10 w-10 text-purple-500" />;
      case 'video': return <FileVideo className="h-10 w-10 text-red-500" />;
      case 'document': return <FileType className="h-10 w-10 text-blue-500" />;
      case 'image': return <FileText className="h-10 w-10 text-green-500" />;
      default: return <FileText className="h-10 w-10 text-muted-foreground" />;
    }
  };

  if (type === 'upload') {
    return (
      <div className="space-y-4">
        <div 
          className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors relative"
          onClick={() => !isProcessing && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.md,.pdf,.doc,.docx,.ppt,.pptx,image/*,audio/*,video/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          {isProcessing ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-muted-foreground">Processing {fileType || 'file'}...</p>
              <Progress value={uploadProgress} className="w-48" />
              <p className="text-xs text-muted-foreground">{uploadProgress}%</p>
            </div>
          ) : fileName ? (
            <div className="flex flex-col items-center gap-2">
              <CheckCircle className="h-10 w-10 text-green-500" />
              {getFileIcon()}
              <p className="font-medium">{fileName}</p>
              <div className="flex gap-2">
                {fileType && <Badge variant="secondary">{fileType}</Badge>}
                {detectedLanguage && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Languages className="h-3 w-3" />
                    {detectedLanguage}
                  </Badge>
                )}
              </div>
              <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); clearFile(); }}>
                <X className="h-4 w-4 mr-1" /> Remove
              </Button>
            </div>
          ) : (
            <>
              <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-lg font-medium mb-1">Drop your file here or click to upload</p>
              <div className="flex flex-wrap gap-2 justify-center mt-3">
                <Badge variant="outline" className="flex items-center gap-1">
                  <FileText className="h-3 w-3" /> PDF, DOC, PPT
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <FileAudio className="h-3 w-3" /> Audio (MP3, WAV)
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <FileVideo className="h-3 w-3" /> Video (MP4)
                </Badge>
                <Badge variant="outline">Images</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Max: 50MB for audio/video, 20MB for others</p>
            </>
          )}
        </div>
      </div>
    );
  }

  if (type === 'link') {
    return (
      <div className="space-y-4">
        <div>
          <Label htmlFor="url">Website or YouTube Video URL</Label>
          <div className="flex gap-2 mt-1">
            <div className="relative flex-1">
              {isYouTubeUrl(linkUrl) ? (
                <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500" />
              ) : (
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              )}
              <Input
                id="url"
                placeholder="https://youtube.com/watch?v=... or any website URL"
                value={linkUrl}
                onChange={(e) => {
                  setLinkUrl(e.target.value);
                  // Check if it's a YouTube URL and extract metadata
                  if (isYouTubeUrl(e.target.value)) {
                    const videoId = extractYouTubeId(e.target.value);
                    if (videoId) {
                      setYoutubeMetadata({
                        videoId: videoId,
                        thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
                        title: 'YouTube Video'
                      });
                    }
                  } else {
                    setYoutubeMetadata(null);
                  }
                }}
                className="pl-9"
                disabled={isProcessing}
              />
            </div>
            <Button onClick={handleLinkProcess} disabled={isProcessing || !linkUrl.trim()}>
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  {Math.round(uploadProgress)}%
                </>
              ) : (
                'Process'
              )}
            </Button>
          </div>
          {isProcessing && <Progress value={uploadProgress} className="mt-2" />}
        </div>

        {/* YouTube Video Preview */}
        {youtubeMetadata && (
          <div className="border rounded-lg overflow-hidden bg-muted/50">
            <div className="relative aspect-video bg-black">
              <img
                src={youtubeMetadata.thumbnail}
                alt={youtubeMetadata.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <a
                  href={`https://www.youtube.com/watch?v=${youtubeMetadata.videoId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-red-600 hover:bg-red-700 text-white rounded-full p-4 transition-colors"
                >
                  <Play className="h-6 w-6" />
                </a>
              </div>
            </div>
            <div className="p-3">
              <p className="font-medium text-sm line-clamp-2">{youtubeMetadata.title}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Youtube className="h-3 w-3" />
                  YouTube
                </Badge>
                {isSavingYouTube && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Saving...
                  </Badge>
                )}
              </div>
            </div>
          </div>
        )}
        
        <div className="flex flex-wrap gap-2">
          <Badge variant={isYouTubeUrl(linkUrl) ? 'default' : 'outline'} className="flex items-center gap-1">
            <Youtube className="h-3 w-3" /> YouTube Videos
          </Badge>
          <Badge variant={!isYouTubeUrl(linkUrl) && linkUrl ? 'default' : 'outline'} className="flex items-center gap-1">
            <Globe className="h-3 w-3" /> Any Website
          </Badge>
        </div>
        
        {detectedLanguage && (
          <Badge variant="secondary" className="flex items-center gap-1 w-fit">
            <Languages className="h-3 w-3" />
            Detected: {detectedLanguage}
          </Badge>
        )}
        
        <p className="text-sm text-muted-foreground">
          YouTube videos will extract the full transcript and auto-save. Websites will extract the main article content.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="text">Paste Your Study Material</Label>
        <Textarea
          id="text"
          placeholder="Paste your notes, textbook content, lecture transcript, or any study material here... Supports multiple languages!"
          value={pasteText}
          onChange={(e) => setPasteText(e.target.value)}
          className="mt-1 min-h-[200px]"
          disabled={isProcessing}
        />
        <div className="flex justify-between items-center mt-1">
          <p className="text-xs text-muted-foreground">
            {pasteText.length} characters {pasteText.length < 50 && '(minimum 50 required)'}
          </p>
          {detectedLanguage && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Languages className="h-3 w-3" />
              {detectedLanguage}
            </Badge>
          )}
        </div>
      </div>
      <Button onClick={handlePasteSubmit} disabled={pasteText.length < 50 || isProcessing}>
        {isProcessing ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <FileText className="h-4 w-4 mr-2" />
            Use This Content
          </>
        )}
      </Button>
    </div>
  );
}
