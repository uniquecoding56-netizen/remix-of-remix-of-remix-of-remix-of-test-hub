import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { Share2, Copy, Check, MessageCircle, Twitter, Linkedin, Mail, Link2 } from 'lucide-react';

interface ShareButtonProps {
  title: string;
  text: string;
  url?: string;
  content?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function ShareButton({ 
  title, 
  text, 
  url = typeof window !== 'undefined' ? window.location.href : '',
  content,
  variant = 'ghost',
  size = 'sm'
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const shareData = {
    title,
    text: content ? `${text}\n\n${content.slice(0, 500)}${content.length > 500 ? '...' : ''}` : text,
    url
  };

  const shareViaWebShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        toast.success('Shared successfully!');
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Error sharing:', err);
        }
      }
    }
  };

  const shareViaWhatsApp = () => {
    const whatsappText = encodeURIComponent(`${title}\n\n${text}\n\n${url}`);
    window.open(`https://wa.me/?text=${whatsappText}`, '_blank');
    toast.success('Opening WhatsApp...');
  };

  const shareViaTwitter = () => {
    const tweetText = encodeURIComponent(`${title} - ${text}`);
    const tweetUrl = encodeURIComponent(url);
    window.open(`https://twitter.com/intent/tweet?text=${tweetText}&url=${tweetUrl}`, '_blank');
    toast.success('Opening Twitter...');
  };

  const shareViaLinkedIn = () => {
    const linkedInUrl = encodeURIComponent(url);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${linkedInUrl}`, '_blank');
    toast.success('Opening LinkedIn...');
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent(title);
    const body = encodeURIComponent(`${text}\n\n${content ? content.slice(0, 1000) : ''}\n\nCheck it out: ${url}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const copyLink = async () => {
    try {
      const textToCopy = content 
        ? `${title}\n\n${text}\n\n${content}\n\nGenerated with PDFStudy.online` 
        : `${title}\n\n${text}\n\n${url}`;
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  // Use native share on mobile if available
  const isMobile = typeof window !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  if (isMobile && navigator.share) {
    return (
      <Button variant={variant} size={size} onClick={shareViaWebShare}>
        <Share2 className="h-4 w-4 mr-1" />
        Share
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size}>
          <Share2 className="h-4 w-4 mr-1" />
          Share
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={shareViaWhatsApp} className="cursor-pointer">
          <MessageCircle className="h-4 w-4 mr-2 text-green-500" />
          WhatsApp
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareViaTwitter} className="cursor-pointer">
          <Twitter className="h-4 w-4 mr-2 text-blue-400" />
          Twitter / X
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareViaLinkedIn} className="cursor-pointer">
          <Linkedin className="h-4 w-4 mr-2 text-blue-600" />
          LinkedIn
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareViaEmail} className="cursor-pointer">
          <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
          Email
        </DropdownMenuItem>
        <DropdownMenuItem onClick={copyLink} className="cursor-pointer">
          {copied ? (
            <Check className="h-4 w-4 mr-2 text-green-500" />
          ) : (
            <Link2 className="h-4 w-4 mr-2 text-muted-foreground" />
          )}
          {copied ? 'Copied!' : 'Copy Link'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
