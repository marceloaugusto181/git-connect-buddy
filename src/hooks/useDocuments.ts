import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Document {
  id: string;
  therapist_id: string;
  patient_id: string | null;
  title: string;
  type: 'Atestado' | 'Relatório' | 'Contrato' | 'Encaminhamento';
  category: string;
  content: string | null;
  status: 'Rascunho' | 'Finalizado';
  generated_at: string | null;
  created_at: string;
  updated_at: string;
  patient?: {
    name: string;
  };
}

export interface DocumentInsert {
  patient_id?: string | null;
  title: string;
  type: 'Atestado' | 'Relatório' | 'Contrato' | 'Encaminhamento';
  category?: string;
  content?: string | null;
  status?: 'Rascunho' | 'Finalizado';
}

export const useDocuments = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: documents = [], isLoading, error } = useQuery({
    queryKey: ['documents', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('documents')
        .select(`
          *,
          patient:patients(name)
        `)
        .eq('therapist_id', user.id)
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      return data as Document[];
    },
    enabled: !!user?.id,
  });

  const createDocument = useMutation({
    mutationFn: async (doc: DocumentInsert) => {
      if (!user?.id) throw new Error('Usuário não autenticado');
      
      const { data, error } = await supabase
        .from('documents')
        .insert({
          ...doc,
          therapist_id: user.id,
          generated_at: doc.status === 'Finalizado' ? new Date().toISOString() : null,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast({
        title: 'Documento criado',
        description: 'O documento foi salvo com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao criar documento',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateDocument = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Document> & { id: string }) => {
      const updateData: any = { ...updates };
      if (updates.status === 'Finalizado') {
        updateData.generated_at = new Date().toISOString();
      }
      
      const { data, error } = await supabase
        .from('documents')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast({
        title: 'Documento atualizado',
        description: 'O documento foi atualizado com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao atualizar documento',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteDocument = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast({
        title: 'Documento removido',
        description: 'O documento foi excluído com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao remover documento',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    documents,
    isLoading,
    error,
    createDocument,
    updateDocument,
    deleteDocument,
  };
};
