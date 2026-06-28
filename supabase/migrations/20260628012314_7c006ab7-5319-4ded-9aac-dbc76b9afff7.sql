
-- 1) Remove orphan rows (therapist_id not referencing existing auth.users)
DELETE FROM public.transactions t WHERE NOT EXISTS (SELECT 1 FROM auth.users u WHERE u.id = t.therapist_id);
DELETE FROM public.tasks t WHERE NOT EXISTS (SELECT 1 FROM auth.users u WHERE u.id = t.therapist_id);
DELETE FROM public.leads t WHERE NOT EXISTS (SELECT 1 FROM auth.users u WHERE u.id = t.therapist_id);
DELETE FROM public.resources t WHERE NOT EXISTS (SELECT 1 FROM auth.users u WHERE u.id = t.therapist_id);
DELETE FROM public.documents t WHERE NOT EXISTS (SELECT 1 FROM auth.users u WHERE u.id = t.therapist_id);

-- 2) Add FK constraints
ALTER TABLE public.transactions
  ADD CONSTRAINT fk_transactions_therapist FOREIGN KEY (therapist_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.tasks
  ADD CONSTRAINT fk_tasks_therapist FOREIGN KEY (therapist_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.leads
  ADD CONSTRAINT fk_leads_therapist FOREIGN KEY (therapist_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.resources
  ADD CONSTRAINT fk_resources_therapist FOREIGN KEY (therapist_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.documents
  ADD CONSTRAINT fk_documents_therapist FOREIGN KEY (therapist_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 3) PHI audit log table
CREATE TABLE IF NOT EXISTS public.phi_access_audit (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  therapist_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  table_name TEXT NOT NULL,
  record_id UUID,
  action TEXT NOT NULL CHECK (action IN ('INSERT','UPDATE','DELETE')),
  accessed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_phi_audit_therapist ON public.phi_access_audit(therapist_id, accessed_at DESC);

GRANT SELECT ON public.phi_access_audit TO authenticated;
GRANT ALL ON public.phi_access_audit TO service_role;
ALTER TABLE public.phi_access_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Therapists can view their own PHI audit logs"
  ON public.phi_access_audit FOR SELECT
  USING (auth.uid() = therapist_id);

-- No INSERT/UPDATE/DELETE policies => writes go through SECURITY DEFINER trigger only.

-- 4) Trigger function to log PHI writes
CREATE OR REPLACE FUNCTION public.log_phi_access()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_therapist UUID;
  v_record UUID;
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_therapist := OLD.therapist_id;
    v_record := OLD.id;
  ELSE
    v_therapist := NEW.therapist_id;
    v_record := NEW.id;
  END IF;

  IF v_therapist IS NOT NULL THEN
    INSERT INTO public.phi_access_audit (therapist_id, table_name, record_id, action)
    VALUES (v_therapist, TG_TABLE_NAME, v_record, TG_OP);
  END IF;

  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END;
$$;

-- 5) Attach triggers on PHI tables
DROP TRIGGER IF EXISTS trg_phi_audit_clinical_records ON public.clinical_records;
CREATE TRIGGER trg_phi_audit_clinical_records
  AFTER INSERT OR UPDATE OR DELETE ON public.clinical_records
  FOR EACH ROW EXECUTE FUNCTION public.log_phi_access();

DROP TRIGGER IF EXISTS trg_phi_audit_patients ON public.patients;
CREATE TRIGGER trg_phi_audit_patients
  AFTER INSERT OR UPDATE OR DELETE ON public.patients
  FOR EACH ROW EXECUTE FUNCTION public.log_phi_access();

DROP TRIGGER IF EXISTS trg_phi_audit_documents ON public.documents;
CREATE TRIGGER trg_phi_audit_documents
  AFTER INSERT OR UPDATE OR DELETE ON public.documents
  FOR EACH ROW EXECUTE FUNCTION public.log_phi_access();
