import React, { useState } from 'react';
import { Sparkles, Loader2, RefreshCw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Transaction } from '@/hooks/useTransactions';

interface Props {
  transactions: Transaction[];
  year: number;
  onSummaryChange?: (summary: string | null) => void;
}

const buildContext = (transactions: Transaction[], year: number) => {
  const months = Array.from({ length: 12 }, (_, m) => {
    const key = `${year}-${String(m + 1).padStart(2, '0')}`;
    const list = transactions.filter((t) => t.date.startsWith(key));
    const income = list.filter((t) => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
    const expense = list.filter((t) => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);
    const sessions = list.filter((t) => t.type === 'income' && t.category === 'Sessão').length;
    return {
      label: new Date(year, m, 1).toLocaleDateString('pt-BR', { month: 'long' }),
      income, expense, balance: income - expense, sessions,
    };
  });
  const totalIncome = months.reduce((s, m) => s + m.income, 0);
  const totalExpense = months.reduce((s, m) => s + m.expense, 0);
  const totalSessions = months.reduce((s, m) => s + m.sessions, 0);
  const lines = months
    .map((m) => `- ${m.label}: receita R$ ${m.income.toFixed(2)} | despesa R$ ${m.expense.toFixed(2)} | saldo R$ ${m.balance.toFixed(2)} | ${m.sessions} sessões`)
    .join('\n');
  return `Relatório Financeiro - Ano ${year}\nReceita total: R$ ${totalIncome.toFixed(2)}\nDespesa total: R$ ${totalExpense.toFixed(2)}\nSaldo: R$ ${(totalIncome - totalExpense).toFixed(2)}\nSessões realizadas: ${totalSessions}\n\nDetalhamento mensal:\n${lines}`;
};

const FinancialAISummary: React.FC<Props> = ({ transactions, year, onSummaryChange }) => {
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      const context = buildContext(transactions, year);
      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: {
          mode: 'summary',
          context,
          messages: [
            {
              role: 'user',
              content: `Gere um resumo executivo do ano de ${year} com: 1) Visão geral, 2) Destaques (melhor e pior mês, sessões), 3) Pontos de atenção, 4) Recomendações práticas para o(a) profissional.`,
            },
          ],
        },
      });
      if (error) throw error;
      const reply: string = data?.reply ?? '';
      setSummary(reply);
      onSummaryChange?.(reply);
      toast.success('Resumo gerado pela IA!');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erro ao gerar resumo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-[32px] p-6">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-primary/15 text-primary flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-foreground">Resumo com IA</h3>
            <p className="text-sm text-muted-foreground">
              O Gemini analisa seu ano e gera insights — incluído no PDF/Excel.
            </p>
          </div>
        </div>
        <button
          onClick={generate}
          disabled={loading}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl font-bold text-sm hover:opacity-90 disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : summary ? <RefreshCw className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
          {loading ? 'Gerando...' : summary ? 'Regenerar' : 'Gerar resumo'}
        </button>
      </div>

      {summary ? (
        <div className="prose prose-sm max-w-none dark:prose-invert bg-muted/40 rounded-2xl p-4">
          <ReactMarkdown>{summary}</ReactMarkdown>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground italic">
          Clique em "Gerar resumo" para receber uma análise automática do ano de {year}.
        </p>
      )}
    </div>
  );
};

export default FinancialAISummary;
