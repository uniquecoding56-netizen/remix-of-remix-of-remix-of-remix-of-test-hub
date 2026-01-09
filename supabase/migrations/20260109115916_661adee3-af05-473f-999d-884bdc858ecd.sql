-- Create saved_flashcards table for storing user flashcard sets
CREATE TABLE public.saved_flashcards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL DEFAULT 'Untitled Flashcards',
  flashcards JSONB NOT NULL DEFAULT '[]'::jsonb,
  source_type TEXT,
  source_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.saved_flashcards ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own saved flashcards" 
ON public.saved_flashcards 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own saved flashcards" 
ON public.saved_flashcards 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved flashcards" 
ON public.saved_flashcards 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved flashcards" 
ON public.saved_flashcards 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create user_notifications table
CREATE TABLE public.user_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  notification_type TEXT NOT NULL DEFAULT 'general',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  emoji TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own notifications" 
ON public.user_notifications 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own notifications" 
ON public.user_notifications 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
ON public.user_notifications 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications" 
ON public.user_notifications 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create saved_youtube_videos table
CREATE TABLE public.saved_youtube_videos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  video_url TEXT NOT NULL,
  video_id TEXT NOT NULL,
  video_title TEXT NOT NULL,
  video_thumbnail TEXT,
  transcript TEXT,
  generated_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.saved_youtube_videos ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own saved YouTube videos" 
ON public.saved_youtube_videos 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own saved YouTube videos" 
ON public.saved_youtube_videos 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved YouTube videos" 
ON public.saved_youtube_videos 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved YouTube videos" 
ON public.saved_youtube_videos 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create shared_content table for public sharing
CREATE TABLE public.shared_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  share_token TEXT NOT NULL UNIQUE,
  content_type TEXT NOT NULL,
  content_data JSONB NOT NULL,
  title TEXT,
  thumbnail_url TEXT,
  view_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.shared_content ENABLE ROW LEVEL SECURITY;

-- Create policies (public read for shared content)
CREATE POLICY "Anyone can view shared content" 
ON public.shared_content 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own shared content" 
ON public.shared_content 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own shared content" 
ON public.shared_content 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own shared content" 
ON public.shared_content 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for updating timestamps
CREATE TRIGGER update_saved_flashcards_updated_at
BEFORE UPDATE ON public.saved_flashcards
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_saved_youtube_videos_updated_at
BEFORE UPDATE ON public.saved_youtube_videos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Fix profiles RLS policy - make it only viewable by authenticated users
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Authenticated users can view profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (true);