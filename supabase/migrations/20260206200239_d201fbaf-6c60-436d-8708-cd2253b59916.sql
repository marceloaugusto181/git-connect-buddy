-- Create documents table for clinical document management
CREATE TABLE public.documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  therapist_id UUID NOT NULL,
  patient_id UUID REFERENCES public.patients(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'Atestado',
  category TEXT NOT NULL DEFAULT 'Clínico',
  content TEXT,
  status TEXT NOT NULL DEFAULT 'Rascunho',
  generated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Therapists can view their own documents"
  ON public.documents FOR SELECT
  USING (auth.uid() = therapist_id);

CREATE POLICY "Therapists can insert their own documents"
  ON public.documents FOR INSERT
  WITH CHECK (auth.uid() = therapist_id);

CREATE POLICY "Therapists can update their own documents"
  ON public.documents FOR UPDATE
  USING (auth.uid() = therapist_id);

CREATE POLICY "Therapists can delete their own documents"
  ON public.documents FOR DELETE
  USING (auth.uid() = therapist_id);

-- Create trigger for updated_at
CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON public.documents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();