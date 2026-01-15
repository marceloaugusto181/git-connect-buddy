import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Lead {
  id: string;
  therapist_id: string;
  name: string;
  phone: string | null;
  email: string | null;
  source: string;
  urgency: string;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface LeadInsert {
  name: string;
  phone?: string | null;
  email?: string | null;
  source?: string;
  urgency?: string;
  status?: string;
  notes?: string | null;
}

export interface LeadUpdate {
  name?: string;
  phone?: string | null;
  email?: string | null;
  source?: string;
  urgency?: string;
  status?: string;
  notes?: string | null;
}

export const useLeads = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: leads = [], isLoading, error } = useQuery({
    queryKey: ['leads', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('therapist_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Lead[];
    },
    enabled: !!user?.id,
  });

  const createLead = useMutation({
    mutationFn: async (lead: LeadInsert) => {
      if (!user?.id) throw new Error('Usuário não autenticado');
      
      const { data, error } = await supabase
        .from('leads')
        .insert({
          ...lead,
          therapist_id: user.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast({
        title: 'Lead adicionado',
        description: 'O lead foi cadastrado com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao adicionar lead',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateLead = useMutation({
    mutationFn: async ({ id, ...updates }: LeadUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('leads')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast({
        title: 'Lead atualizado',
        description: 'O lead foi atualizado com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao atualizar lead',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteLead = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast({
        title: 'Lead removido',
        description: 'O lead foi excluído com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao remover lead',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const moveLeadToStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data, error } = await supabase
        .from('leads')
        .update({ status })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return { lead: data as Lead, newStatus: status };
    },
    onSuccess: async ({ lead, newStatus }) => {
      // Auto-convert lead to patient when moved to 'Convertido'
      if (newStatus === 'Convertido' && user?.id) {
        const { data: newPatient, error: patientError } = await supabase
          .from('patients')
          .insert({
            therapist_id: user.id,
            name: lead.name,
            phone: lead.phone,
            email: lead.email,
            notes: lead.notes ? `Origem: ${lead.source}\n${lead.notes}` : `Origem: ${lead.source}`,
          })
          .select()
          .single();
        
        if (!patientError && newPatient) {
          // Delete the lead after successful conversion
          await supabase.from('leads').delete().eq('id', lead.id);
          
          toast({
            title: 'Lead convertido!',
            description: `${lead.name} foi adicionado como paciente e removido do funil.`,
          });
          
          queryClient.invalidateQueries({ queryKey: ['patients'] });
        } else if (patientError) {
          toast({
            title: 'Erro ao converter lead',
            description: patientError.message,
            variant: 'destructive',
          });
        }
      }
      
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao mover lead',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    leads,
    isLoading,
    error,
    createLead,
    updateLead,
    deleteLead,
    moveLeadToStatus,
  };
};
