import React, { useState, useMemo, useEffect } from 'react';
import { DollarSign, TrendingUp, CreditCard, ArrowUpRight, ArrowDownRight, Download, Target, Loader2, BarChart3, List, Receipt } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import StatCard from '../components/StatCard';
import TransactionFormModal from '../components/TransactionFormModal';
import MonthlyFinancialReport from '../components/MonthlyFinancialReport';
import PaymentModal from '../components/PaymentModal';
import { useTransactions, TransactionInsert } from '@/hooks/useTransactions';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const Financial: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { transactions, isLoading, summary, createTransaction } = useTransactions();
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'report'>('overview');

  // Handle payment success/cancel from URL params
  useEffect(() => {
    if (searchParams.get('payment') === 'success') {
      toast.success('Pagamento realizado com sucesso!');
    } else if (searchParams.get('payment') === 'canceled') {
      toast.info('Pagamento cancelado');
    } else if (searchParams.get('subscription') === 'success') {
      toast.success('Assinatura criada com sucesso!');
    } else if (searchParams.get('subscription') === 'canceled') {
      toast.info('Assinatura cancelada');
    }
  }, [searchParams]);

  const pieData = useMemo(() => [
    { name: 'Recebido', value: summary.confirmedIncome, color: '#6366f1' },
    { name: 'Aguardando', value: summary.pendingIncome, color: '#e2e8f0' },
  ], [summary]);

  // Calculate cash flow for last 4 months
  const cashFlowData = useMemo(() => {
    const months: { [key: string]: { entrada: number; saida: number } } = {};
    const today = new Date();
    
    // Initialize last 4 months
    for (let i = 3; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const key = d.toISOString().slice(0, 7);
      months[key] = { entrada: 0, saida: 0 };
    }

    // Aggregate transactions
    transactions.forEach(t => {
      const monthKey = t.date.slice(0, 7);
      if (months[monthKey]) {
        if (t.type === 'income') {
          months[monthKey].entrada += Number(t.amount);
        } else {
          months[monthKey].saida += Number(t.amount);
        }
      }
    });

    return Object.entries(months).map(([key, value]) => ({
      name: new Date(key + '-01').toLocaleDateString('pt-BR', { month: 'short' }),
      ...value,
    }));
  }, [transactions]);

  const filteredTransactions = transactions.filter(t => {
    if (filterType === 'all') return true;
    return t.type === filterType;
  });

  const handleSaveTransaction = async (data: TransactionInsert) => {
    await createTransaction.mutateAsync(data);
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000) {
      return `R$ ${(value / 1000).toFixed(1)}k`;
    }
    return `R$ ${value.toLocaleString('pt-BR')}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-flow">
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">Financeiro Estratégico</h1>
          <p className="text-muted-foreground font-medium">Controle o faturamento do seu consultório</p>
        </div>
        <div className="flex gap-3">
          {/* Tab Switcher */}
          <div className="flex bg-muted rounded-xl p-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition ${
                activeTab === 'overview' 
                  ? 'bg-background text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <List className="w-4 h-4" /> Visão Geral
            </button>
            <button
              onClick={() => setActiveTab('report')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition ${
                activeTab === 'report' 
                  ? 'bg-background text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <BarChart3 className="w-4 h-4" /> Relatório
            </button>
          </div>
          <button 
            onClick={() => setIsPaymentModalOpen(true)}
            className="flex items-center gap-2 bg-card border border-border text-foreground px-5 py-3 rounded-xl font-bold text-sm hover:border-primary hover:bg-primary/5 transition"
          >
            <Receipt className="w-4 h-4" /> Cobrar Paciente
          </button>
          <button className="flex items-center gap-2 bg-card border border-border text-muted-foreground px-5 py-3 rounded-xl font-bold text-sm hover:border-foreground hover:text-foreground transition">
            <Download className="w-4 h-4" /> Exportar
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-3 rounded-xl font-bold text-sm shadow-lg"
          >
            <DollarSign className="w-4 h-4" /> Nova Transação
          </button>
        </div>
      </div>

      {activeTab === 'report' ? (
        <MonthlyFinancialReport transactions={transactions} />
      ) : (
        <>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard kpi={{ 
          label: "Faturamento", 
          value: formatCurrency(summary.totalIncome), 
          icon: DollarSign, 
          change: "Total do mês", 
          trend: "up", 
          color: "bg-primary text-primary-foreground" 
        }} />
        <StatCard kpi={{ 
          label: "Recebido", 
          value: formatCurrency(summary.confirmedIncome), 
          icon: TrendingUp, 
          change: summary.totalIncome > 0 ? `${Math.round((summary.confirmedIncome / summary.totalIncome) * 100)}%` : "0%", 
          trend: "up", 
          color: "bg-emerald text-primary-foreground" 
        }} />
        <StatCard kpi={{ 
          label: "Pendente", 
          value: formatCurrency(summary.pendingIncome), 
          icon: CreditCard, 
          change: "A receber", 
          trend: "neutral", 
          color: "bg-amber text-foreground" 
        }} />
        <StatCard kpi={{ 
          label: "Despesas", 
          value: formatCurrency(summary.totalExpense), 
          icon: Target, 
          change: "Total do mês", 
          trend: "down", 
          color: "bg-destructive text-destructive-foreground" 
        }} />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="bg-card border border-border rounded-[32px] p-6">
          <h3 className="text-lg font-black text-foreground mb-4">Composição do Faturamento</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `R$ ${Number(value).toLocaleString('pt-BR')}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            {pieData.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span className="text-sm font-medium text-muted-foreground">{item.name}: R$ {item.value.toLocaleString('pt-BR')}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bar Chart */}
        <div className="bg-card border border-border rounded-[32px] p-6">
          <h3 className="text-lg font-black text-foreground mb-4">Fluxo de Caixa</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cashFlowData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => value >= 1000 ? `${value / 1000}k` : value} />
                <Tooltip formatter={(value) => `R$ ${Number(value).toLocaleString('pt-BR')}`} />
                <Bar dataKey="entrada" fill="#6366f1" radius={[4, 4, 0, 0]} name="Entradas" />
                <Bar dataKey="saida" fill="#f43f5e" radius={[4, 4, 0, 0]} name="Saídas" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary"></div>
              <span className="text-sm font-medium text-muted-foreground">Entradas</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-destructive"></div>
              <span className="text-sm font-medium text-muted-foreground">Saídas</span>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions */}
      <div className="bg-card border border-border rounded-[32px] p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h3 className="text-lg font-black text-foreground">Últimas Transações</h3>
          <div className="flex gap-2">
            {(['all', 'income', 'expense'] as const).map(type => (
              <button 
                key={type} 
                onClick={() => setFilterType(type)} 
                className={`px-4 py-2 rounded-xl font-bold text-sm transition ${
                  filterType === type 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                {type === 'all' ? 'Todas' : type === 'income' ? 'Receitas' : 'Despesas'}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {filteredTransactions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Nenhuma transação registrada</p>
          ) : (
            filteredTransactions.slice(0, 10).map(transaction => (
              <div key={transaction.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-2xl hover:bg-muted transition">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    transaction.type === 'income' 
                      ? 'bg-emerald/20 text-emerald' 
                      : 'bg-destructive/20 text-destructive'
                  }`}>
                    {transaction.type === 'income' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="font-bold text-foreground">{transaction.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {transaction.category}
                      {transaction.patient?.name && ` • ${transaction.patient.name}`}
                      {transaction.status === 'pendente' && (
                        <span className="ml-2 px-2 py-0.5 bg-amber/20 text-amber rounded text-[10px] font-bold uppercase">Pendente</span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-black ${transaction.type === 'income' ? 'text-emerald' : 'text-destructive'}`}>
                    {transaction.type === 'income' ? '+' : '-'} R$ {Number(transaction.amount).toLocaleString('pt-BR')}
                  </p>
                  <p className="text-xs text-muted-foreground">{new Date(transaction.date).toLocaleDateString('pt-BR')}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      </>
      )}

      <TransactionFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTransaction}
      />

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
      />
    </div>
  );
};

export default Financial;
