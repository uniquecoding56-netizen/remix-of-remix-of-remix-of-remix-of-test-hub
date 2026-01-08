import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ShareContentData {
  contentType: 'flashcards' | 'notes' | 'youtube' | 'qa' | 'website';
  contentData: any;
}

export const generateShareLink = async (data: ShareContentData): Promise<string | null> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error('Please sign in to share content');
      return null;
    }

    const response = await supabase.functions.invoke('study-tools-process', {
      body: {
        type: 'share-content',
        contentType: data.contentType,
        contentData: data.contentData
      }
    });

    if (response.error) {
      throw new Error(response.error.message);
    }

    // Use the shareUrl from response if available, otherwise construct it
    const shareUrl = response.data.shareUrl || `${window.location.origin}/shared/${response.data.shareToken}`;
    
    // Auto-copy to clipboard
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Share link copied to clipboard!');
    } catch (e) {
      console.error('Failed to copy to clipboard:', e);
      toast.success('Share link generated!');
    }

    return shareUrl;
  } catch (error) {
    console.error('Share error:', error);
    toast.error('Failed to generate share link');
    return null;
  }
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
    return true;
  } catch (e) {
    console.error('Failed to copy:', e);
    toast.error('Failed to copy to clipboard');
    return false;
  }
};

