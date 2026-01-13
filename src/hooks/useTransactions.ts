import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Transaction {
  id: string;
  therapist_id: string;
  patient_id: string | null;
  description: string;
  category: string;
  amount: number;
  type: 'income' | 'expense';
  status: string;
  date: string;
  created_at: string;
  updated_at: string;
  // Joined patient data
  patient?: {
    id: string;
    name: string;
  } | null;
}

export interface TransactionInsert {
  patient_id?: string | null;
  description: string;
  category: string;
  amount: number;
  type: 'income' | 'expense';
  status?: string;
  date: string;
}

export interface TransactionUpdate {
  patient_id?: string | null;
  description?: string;
  category?: string;
  amount?: number;
  type?: 'income' | 'expense';
  status?: string;
  date?: string;
}

export const useTransactions = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: transactions = [], isLoading, error, refetch } = useQuery({
    queryKey: ['transactions', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          patient:patients(id, name)
        `)
        .eq('therapist_id', user.id)
        .order('date', { ascending: false });

      if (error) throw error;
      return data as Transaction[];
    },
    enabled: !!user?.id,
  });

  const createTransaction = useMutation({
    mutationFn: async (transaction: TransactionInsert) => {
      if (!user?.id) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('transactions')
        .insert({
          ...transaction,
          therapist_id: user.id,
        })
        .select(`
          *,
          patient:patients(id, name)
        `)
        .single();

      if (error) throw error;
      return data as Transaction;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions', user?.id] });
    },
  });

  const updateTransaction = useMutation({
    mutationFn: async ({ id, ...updates }: TransactionUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('transactions')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          patient:patients(id, name)
        `)
        .single();

      if (error) throw error;
      return data as Transaction;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions', user?.id] });
    },
  });

  const deleteTransaction = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions', user?.id] });
    },
  });

  // Calculate summaries
  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthlyTransactions = transactions.filter(t => t.date.startsWith(currentMonth));
  
  const totalIncome = monthlyTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);
  
  const totalExpense = monthlyTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const confirmedIncome = monthlyTransactions
    .filter(t => t.type === 'income' && t.status === 'confirmado')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const pendingIncome = monthlyTransactions
    .filter(t => t.type === 'income' && t.status === 'pendente')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  return {
    transactions,
    isLoading,
    error,
    refetch,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    summary: {
      totalIncome,
      totalExpense,
      confirmedIncome,
      pendingIncome,
      balance: totalIncome - totalExpense,
    },
  };
};
