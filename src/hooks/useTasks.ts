import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Task {
  id: string;
  therapist_id: string;
  patient_id: string | null;
  title: string;
  description: string | null;
  due_date: string;
  priority: string;
  status: string;
  category: string;
  created_at: string;
  updated_at: string;
  patients?: {
    name: string;
  } | null;
}

export interface TaskInsert {
  patient_id?: string | null;
  title: string;
  description?: string | null;
  due_date: string;
  priority?: string;
  status?: string;
  category?: string;
}

export interface TaskUpdate {
  patient_id?: string | null;
  title?: string;
  description?: string | null;
  due_date?: string;
  priority?: string;
  status?: string;
  category?: string;
}

export const useTasks = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: tasks = [], isLoading, error } = useQuery({
    queryKey: ['tasks', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          patients (name)
        `)
        .eq('therapist_id', user.id)
        .order('due_date', { ascending: true });
      
      if (error) throw error;
      return data as Task[];
    },
    enabled: !!user?.id,
  });

  const createTask = useMutation({
    mutationFn: async (task: TaskInsert) => {
      if (!user?.id) throw new Error('Usuário não autenticado');
      
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          ...task,
          therapist_id: user.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({
        title: 'Tarefa criada',
        description: 'A tarefa foi adicionada com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao criar tarefa',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateTask = useMutation({
    mutationFn: async ({ id, ...updates }: TaskUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({
        title: 'Tarefa atualizada',
        description: 'A tarefa foi atualizada com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao atualizar tarefa',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteTask = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({
        title: 'Tarefa excluída',
        description: 'A tarefa foi removida com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao excluir tarefa',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const toggleTaskStatus = useMutation({
    mutationFn: async ({ id, currentStatus, category }: { id: string; currentStatus: string; category: string }) => {
      let newStatus: string;
      if (currentStatus === 'Pendente') {
        newStatus = category === 'Financeira' ? 'Pago' : 'Concluído';
      } else {
        newStatus = 'Pendente';
      }
      
      const { data, error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao atualizar status',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    tasks,
    isLoading,
    error,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskStatus,
  };
};
