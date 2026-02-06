-- Create resources table for file management
CREATE TABLE public.resources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  therapist_id UUID NOT NULL,
  title TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'PDF',
  category TEXT NOT NULL DEFAULT 'Exercício',
  file_url TEXT,
  file_size TEXT,
  cloud_url TEXT,
  auto_send BOOLEAN DEFAULT false,
  trigger_event TEXT,
  shared_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Therapists can view their own resources"
  ON public.resources FOR SELECT
  USING (auth.uid() = therapist_id);

CREATE POLICY "Therapists can insert their own resources"
  ON public.resources FOR INSERT
  WITH CHECK (auth.uid() = therapist_id);

CREATE POLICY "Therapists can update their own resources"
  ON public.resources FOR UPDATE
  USING (auth.uid() = therapist_id);

CREATE POLICY "Therapists can delete their own resources"
  ON public.resources FOR DELETE
  USING (auth.uid() = therapist_id);

-- Create trigger for updated_at
CREATE TRIGGER update_resources_updated_at
  BEFORE UPDATE ON public.resources
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for resources
INSERT INTO storage.buckets (id, name, public) VALUES ('resources', 'resources', true);

-- Storage policies for resources bucket
CREATE POLICY "Therapists can upload their own resources"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'resources' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Resources are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'resources');

CREATE POLICY "Therapists can update their own resources files"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'resources' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Therapists can delete their own resources files"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'resources' AND auth.uid()::text = (storage.foldername(name))[1]);