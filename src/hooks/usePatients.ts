import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Patient {
  id: string;
  therapist_id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  cpf?: string | null;
  birth_date?: string | null;
  address?: string | null;
  emergency_contact?: string | null;
  emergency_phone?: string | null;
  notes?: string | null;
  status?: string | null;
  payment_status?: string | null;
  session_value?: number | null;
  created_at: string;
  updated_at: string;
}

export type PatientInsert = Omit<Patient, 'id' | 'therapist_id' | 'created_at' | 'updated_at'>;
export type PatientUpdate = Partial<PatientInsert>;

export const usePatients = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchPatients = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setPatients(data || []);
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar pacientes',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const createPatient = async (patient: PatientInsert) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('patients')
        .insert({
          ...patient,
          therapist_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      setPatients(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
      toast({
        title: 'Paciente cadastrado!',
        description: `${patient.name} foi adicionado com sucesso.`,
      });
      return data;
    } catch (error: any) {
      toast({
        title: 'Erro ao cadastrar paciente',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    }
  };

  const updatePatient = async (id: string, updates: PatientUpdate) => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setPatients(prev => prev.map(p => p.id === id ? data : p));
      toast({
        title: 'Paciente atualizado!',
        description: 'As informações foram salvas.',
      });
      return data;
    } catch (error: any) {
      toast({
        title: 'Erro ao atualizar paciente',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    }
  };

  const deletePatient = async (id: string) => {
    try {
      const { error } = await supabase
        .from('patients')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setPatients(prev => prev.filter(p => p.id !== id));
      toast({
        title: 'Paciente removido',
        description: 'O paciente foi excluído do sistema.',
      });
      return true;
    } catch (error: any) {
      toast({
        title: 'Erro ao excluir paciente',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    }
  };

  return {
    patients,
    loading,
    fetchPatients,
    createPatient,
    updatePatient,
    deletePatient,
  };
};
