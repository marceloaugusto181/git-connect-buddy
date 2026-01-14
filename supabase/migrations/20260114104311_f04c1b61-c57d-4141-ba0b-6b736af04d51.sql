-- Create tasks table
CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  therapist_id UUID NOT NULL,
  patient_id UUID REFERENCES public.patients(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE NOT NULL,
  priority TEXT NOT NULL DEFAULT 'Média',
  status TEXT NOT NULL DEFAULT 'Pendente',
  category TEXT NOT NULL DEFAULT 'Administrativa',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Therapists can view their own tasks"
ON public.tasks
FOR SELECT
USING (auth.uid() = therapist_id);

CREATE POLICY "Therapists can insert their own tasks"
ON public.tasks
FOR INSERT
WITH CHECK (auth.uid() = therapist_id);

CREATE POLICY "Therapists can update their own tasks"
ON public.tasks
FOR UPDATE
USING (auth.uid() = therapist_id);

CREATE POLICY "Therapists can delete their own tasks"
ON public.tasks
FOR DELETE
USING (auth.uid() = therapist_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_tasks_updated_at
BEFORE UPDATE ON public.tasks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();