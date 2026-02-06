import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Resource {
  id: string;
  therapist_id: string;
  title: string;
  type: 'PDF' | 'Vídeo' | 'Áudio' | 'Drive' | 'Link';
  category: string;
  file_url: string | null;
  file_size: string | null;
  cloud_url: string | null;
  auto_send: boolean;
  trigger_event: string | null;
  shared_count: number;
  created_at: string;
  updated_at: string;
}

export interface ResourceInsert {
  title: string;
  type: 'PDF' | 'Vídeo' | 'Áudio' | 'Drive' | 'Link';
  category: string;
  file_url?: string | null;
  file_size?: string | null;
  cloud_url?: string | null;
  auto_send?: boolean;
  trigger_event?: string | null;
}

export const useResources = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: resources = [], isLoading, error } = useQuery({
    queryKey: ['resources', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .eq('therapist_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Resource[];
    },
    enabled: !!user?.id,
  });

  const createResource = useMutation({
    mutationFn: async (resource: ResourceInsert) => {
      if (!user?.id) throw new Error('Usuário não autenticado');
      
      const { data, error } = await supabase
        .from('resources')
        .insert({
          ...resource,
          therapist_id: user.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
      toast({
        title: 'Arquivo adicionado',
        description: 'O recurso foi salvo com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao salvar arquivo',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateResource = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Resource> & { id: string }) => {
      const { data, error } = await supabase
        .from('resources')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
      toast({
        title: 'Arquivo atualizado',
        description: 'O recurso foi atualizado com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao atualizar arquivo',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteResource = useMutation({
    mutationFn: async (resource: Resource) => {
      // Delete file from storage if exists
      if (resource.file_url && user?.id) {
        const filePath = resource.file_url.split('/resources/')[1];
        if (filePath) {
          await supabase.storage.from('resources').remove([filePath]);
        }
      }
      
      const { error } = await supabase
        .from('resources')
        .delete()
        .eq('id', resource.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
      toast({
        title: 'Arquivo removido',
        description: 'O recurso foi excluído com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao remover arquivo',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const uploadFile = async (file: File): Promise<{ url: string; size: string }> => {
    if (!user?.id) throw new Error('Usuário não autenticado');
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('resources')
      .upload(fileName, file);
    
    if (uploadError) throw uploadError;
    
    const { data: urlData } = supabase.storage
      .from('resources')
      .getPublicUrl(fileName);
    
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
    const sizeStr = parseFloat(sizeInMB) < 1 
      ? `${(file.size / 1024).toFixed(0)} KB` 
      : `${sizeInMB} MB`;
    
    return { url: urlData.publicUrl, size: sizeStr };
  };

  const incrementSharedCount = useMutation({
    mutationFn: async (id: string) => {
      const resource = resources.find(r => r.id === id);
      if (!resource) throw new Error('Recurso não encontrado');
      
      const { data, error } = await supabase
        .from('resources')
        .update({ shared_count: (resource.shared_count || 0) + 1 })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
    },
  });

  return {
    resources,
    isLoading,
    error,
    createResource,
    updateResource,
    deleteResource,
    uploadFile,
    incrementSharedCount,
  };
};
