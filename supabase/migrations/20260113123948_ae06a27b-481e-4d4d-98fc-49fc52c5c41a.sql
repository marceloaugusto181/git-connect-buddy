-- Create transactions table for financial records
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  therapist_id UUID NOT NULL,
  patient_id UUID REFERENCES public.patients(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  status TEXT DEFAULT 'confirmado',
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for therapist access
CREATE POLICY "Therapists can view their own transactions" 
ON public.transactions 
FOR SELECT 
USING (auth.uid() = therapist_id);

CREATE POLICY "Therapists can insert their own transactions" 
ON public.transactions 
FOR INSERT 
WITH CHECK (auth.uid() = therapist_id);

CREATE POLICY "Therapists can update their own transactions" 
ON public.transactions 
FOR UPDATE 
USING (auth.uid() = therapist_id);

CREATE POLICY "Therapists can delete their own transactions" 
ON public.transactions 
FOR DELETE 
USING (auth.uid() = therapist_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_transactions_updated_at
BEFORE UPDATE ON public.transactions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();