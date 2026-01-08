-- Migration: Add Save, Share & Export System
-- Creates tables for saved flashcards, notes, YouTube videos, and shared content

-- Table for saved flashcards
CREATE TABLE IF NOT EXISTS public.saved_flashcards (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    flashcards jsonb NOT NULL,
    title text,
    content_hash text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Table for saved notes
CREATE TABLE IF NOT EXISTS public.saved_notes (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    notes jsonb NOT NULL,
    title text,
    content_hash text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Table for saved YouTube videos
CREATE TABLE IF NOT EXISTS public.saved_youtube_videos (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    video_url text NOT NULL,
    video_id text NOT NULL,
    video_title text,
    video_thumbnail text,
    transcript text,
    generated_notes jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Table for saved website content
CREATE TABLE IF NOT EXISTS public.saved_website_content (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    website_url text NOT NULL,
    website_title text,
    content text,
    generated_content jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Table for shared content (unified for all content types)
CREATE TABLE IF NOT EXISTS public.shared_content (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    share_token text UNIQUE NOT NULL,
    content_type text NOT NULL CHECK (content_type IN ('flashcards', 'notes', 'youtube', 'qa', 'website')),
    content_data jsonb NOT NULL,
    shared_by_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    view_count integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone
);

-- Table for saved AI Q&A conversations
CREATE TABLE IF NOT EXISTS public.saved_qa_conversations (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content text NOT NULL,
    messages jsonb NOT NULL,
    title text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Table for user notifications (inspirational quotes)
CREATE TABLE IF NOT EXISTS public.user_notifications (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    notification_type text DEFAULT 'inspirational_quote',
    title text,
    message text,
    emoji text,
    is_read boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_saved_flashcards_user_id ON public.saved_flashcards(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_flashcards_created_at ON public.saved_flashcards(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_saved_notes_user_id ON public.saved_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_notes_created_at ON public.saved_notes(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_saved_youtube_videos_user_id ON public.saved_youtube_videos(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_youtube_videos_created_at ON public.saved_youtube_videos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_saved_youtube_videos_video_id ON public.saved_youtube_videos(video_id);

CREATE INDEX IF NOT EXISTS idx_saved_website_content_user_id ON public.saved_website_content(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_website_content_created_at ON public.saved_website_content(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_shared_content_token ON public.shared_content(share_token);
CREATE INDEX IF NOT EXISTS idx_shared_content_created_at ON public.shared_content(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_saved_qa_conversations_user_id ON public.saved_qa_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_qa_conversations_created_at ON public.saved_qa_conversations(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_notifications_user_id ON public.user_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_is_read ON public.user_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_user_notifications_created_at ON public.user_notifications(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.saved_flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_youtube_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_website_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_qa_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for saved_flashcards
CREATE POLICY "Users can view their own saved flashcards"
    ON public.saved_flashcards FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved flashcards"
    ON public.saved_flashcards FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved flashcards"
    ON public.saved_flashcards FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved flashcards"
    ON public.saved_flashcards FOR DELETE
    USING (auth.uid() = user_id);

-- RLS Policies for saved_notes
CREATE POLICY "Users can view their own saved notes"
    ON public.saved_notes FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved notes"
    ON public.saved_notes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved notes"
    ON public.saved_notes FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved notes"
    ON public.saved_notes FOR DELETE
    USING (auth.uid() = user_id);

-- RLS Policies for saved_youtube_videos
CREATE POLICY "Users can view their own saved YouTube videos"
    ON public.saved_youtube_videos FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved YouTube videos"
    ON public.saved_youtube_videos FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved YouTube videos"
    ON public.saved_youtube_videos FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved YouTube videos"
    ON public.saved_youtube_videos FOR DELETE
    USING (auth.uid() = user_id);

-- RLS Policies for saved_website_content
CREATE POLICY "Users can view their own saved website content"
    ON public.saved_website_content FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved website content"
    ON public.saved_website_content FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved website content"
    ON public.saved_website_content FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved website content"
    ON public.saved_website_content FOR DELETE
    USING (auth.uid() = user_id);

-- RLS Policies for shared_content (public read, authenticated write)
CREATE POLICY "Anyone can view shared content"
    ON public.shared_content FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can create shared content"
    ON public.shared_content FOR INSERT
    WITH CHECK (auth.uid() = shared_by_user_id);

CREATE POLICY "Users can update their own shared content"
    ON public.shared_content FOR UPDATE
    USING (auth.uid() = shared_by_user_id);

CREATE POLICY "Users can delete their own shared content"
    ON public.shared_content FOR DELETE
    USING (auth.uid() = shared_by_user_id);

-- RLS Policies for saved_qa_conversations
CREATE POLICY "Users can view their own saved Q&A conversations"
    ON public.saved_qa_conversations FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved Q&A conversations"
    ON public.saved_qa_conversations FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved Q&A conversations"
    ON public.saved_qa_conversations FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved Q&A conversations"
    ON public.saved_qa_conversations FOR DELETE
    USING (auth.uid() = user_id);

-- RLS Policies for user_notifications
CREATE POLICY "Users can view their own notifications"
    ON public.user_notifications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
    ON public.user_notifications FOR UPDATE
    USING (auth.uid() = user_id);

-- Add triggers for updated_at
CREATE TRIGGER update_saved_flashcards_updated_at
    BEFORE UPDATE ON public.saved_flashcards
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_saved_notes_updated_at
    BEFORE UPDATE ON public.saved_notes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_saved_youtube_videos_updated_at
    BEFORE UPDATE ON public.saved_youtube_videos
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_saved_website_content_updated_at
    BEFORE UPDATE ON public.saved_website_content
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_saved_qa_conversations_updated_at
    BEFORE UPDATE ON public.saved_qa_conversations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();


