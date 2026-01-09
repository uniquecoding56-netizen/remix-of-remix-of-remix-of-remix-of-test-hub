-- Create saved_notes table
CREATE TABLE public.saved_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL DEFAULT 'Untitled Notes',
  notes JSONB NOT NULL DEFAULT '{}'::jsonb,
  source_type TEXT,
  source_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.saved_notes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own saved notes" 
ON public.saved_notes 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own saved notes" 
ON public.saved_notes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved notes" 
ON public.saved_notes 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved notes" 
ON public.saved_notes 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create saved_qa_conversations table
CREATE TABLE public.saved_qa_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL DEFAULT 'Untitled Conversation',
  content TEXT,
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.saved_qa_conversations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own saved conversations" 
ON public.saved_qa_conversations 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own saved conversations" 
ON public.saved_qa_conversations 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved conversations" 
ON public.saved_qa_conversations 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved conversations" 
ON public.saved_qa_conversations 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create saved_website_content table
CREATE TABLE public.saved_website_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  website_url TEXT NOT NULL,
  website_title TEXT,
  content TEXT,
  generated_content TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.saved_website_content ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own saved website content" 
ON public.saved_website_content 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own saved website content" 
ON public.saved_website_content 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved website content" 
ON public.saved_website_content 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved website content" 
ON public.saved_website_content 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create triggers for updating timestamps
CREATE TRIGGER update_saved_notes_updated_at
BEFORE UPDATE ON public.saved_notes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_saved_qa_conversations_updated_at
BEFORE UPDATE ON public.saved_qa_conversations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_saved_website_content_updated_at
BEFORE UPDATE ON public.saved_website_content
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();