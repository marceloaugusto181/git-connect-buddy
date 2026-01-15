import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface ClinicalRecord {
  id: string;
  therapist_id: string;
  patient_id: string;
  appointment_id: string | null;
  session_date: string;
  content: string | null;
  observations: string | null;
  goals: string | null;
  wellbeing_score: number | null;
  sentiment: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClinicalRecordInsert {
  patient_id: string;
  appointment_id?: string | null;
  session_date: string;
  content?: string | null;
  observations?: string | null;
  goals?: string | null;
  wellbeing_score?: number | null;
  sentiment?: string | null;
}

export interface ClinicalRecordUpdate {
  session_date?: string;
  content?: string | null;
  observations?: string | null;
  goals?: string | null;
  wellbeing_score?: number | null;
  sentiment?: string | null;
}

export const useClinicalRecords = (patientId?: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: records = [], isLoading, error } = useQuery({
    queryKey: ['clinical_records', patientId],
    queryFn: async () => {
      if (!user?.id || !patientId) return [];
      
      const { data, error } = await supabase
        .from('clinical_records')
        .select('*')
        .eq('therapist_id', user.id)
        .eq('patient_id', patientId)
        .order('session_date', { ascending: false });
      
      if (error) throw error;
      return data as ClinicalRecord[];
    },
    enabled: !!user?.id && !!patientId,
  });

  const createRecord = useMutation({
    mutationFn: async (record: ClinicalRecordInsert) => {
      if (!user?.id) throw new Error('Usuário não autenticado');
      
      const { data, error } = await supabase
        .from('clinical_records')
        .insert({
          ...record,
          therapist_id: user.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clinical_records'] });
      toast({
        title: 'Registro adicionado',
        description: 'O prontuário foi salvo com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao salvar prontuário',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateRecord = useMutation({
    mutationFn: async ({ id, ...updates }: ClinicalRecordUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('clinical_records')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clinical_records'] });
      toast({
        title: 'Registro atualizado',
        description: 'O prontuário foi atualizado com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao atualizar prontuário',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteRecord = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('clinical_records')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clinical_records'] });
      toast({
        title: 'Registro removido',
        description: 'O prontuário foi excluído com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao remover prontuário',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    records,
    isLoading,
    error,
    createRecord,
    updateRecord,
    deleteRecord,
  };
};
