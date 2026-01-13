import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Appointment {
  id: string;
  patient_id: string;
  therapist_id: string;
  date: string;
  time: string;
  duration: number;
  type: string;
  status: string;
  meet_link?: string | null;
  notes?: string | null;
  reminder_sent: boolean;
  created_at: string;
  updated_at: string;
  // Joined patient data
  patient?: {
    id: string;
    name: string;
    phone: string | null;
  };
}

export interface AppointmentInsert {
  patient_id: string;
  date: string;
  time: string;
  duration?: number;
  type?: string;
  status?: string;
  meet_link?: string | null;
  notes?: string | null;
}

export interface AppointmentUpdate {
  patient_id?: string;
  date?: string;
  time?: string;
  duration?: number;
  type?: string;
  status?: string;
  meet_link?: string | null;
  notes?: string | null;
  reminder_sent?: boolean;
}

export const useAppointments = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: appointments = [], isLoading, error, refetch } = useQuery({
    queryKey: ['appointments', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          patient:patients(id, name, phone)
        `)
        .eq('therapist_id', user.id)
        .order('date', { ascending: true })
        .order('time', { ascending: true });

      if (error) throw error;
      return data as Appointment[];
    },
    enabled: !!user?.id,
  });

  const createAppointment = useMutation({
    mutationFn: async (appointment: AppointmentInsert) => {
      if (!user?.id) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('appointments')
        .insert({
          ...appointment,
          therapist_id: user.id,
        })
        .select(`
          *,
          patient:patients(id, name, phone)
        `)
        .single();

      if (error) throw error;
      return data as Appointment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments', user?.id] });
    },
  });

  const updateAppointment = useMutation({
    mutationFn: async ({ id, ...updates }: AppointmentUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('appointments')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          patient:patients(id, name, phone)
        `)
        .single();

      if (error) throw error;
      return data as Appointment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments', user?.id] });
    },
  });

  const deleteAppointment = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments', user?.id] });
    },
  });

  const markReminderSent = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('appointments')
        .update({ reminder_sent: true })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments', user?.id] });
    },
  });

  return {
    appointments,
    isLoading,
    error,
    refetch,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    markReminderSent,
  };
};
