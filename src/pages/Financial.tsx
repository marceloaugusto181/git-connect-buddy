import React, { useState } from 'react';
import { DollarSign, TrendingUp, CreditCard, ArrowUpRight, ArrowDownRight, Download, Target, Wallet } from 'lucide-react';
import StatCard from '../components/StatCard';
import { recentTransactions } from '../utils/mockData';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const Financial: React.FC = () => {
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');

  const pieData = [
    { name: 'Recebido', value: 12450, color: '#6366f1' },
    { name: 'Aguardando', value: 2200, color: '#e2e8f0' },
  ];

  const cashFlowData = [
    { name: 'Mar', entrada: 11000, saida: 3200 },
    { name: 'Abr', entrada: 13000, saida: 3500 },
    { name: 'Mai', entrada: 12450, saida: 4100 },
    { name: 'Jun', entrada: 15000, saida: 3800 },
  ];

  const filteredTransactions = recentTransactions.filter(t => {
    if (filterType === 'all') return true;
    return t.type === filterType;
  });

  return (
    <div className="space-y-8 animate-flow">
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">Financeiro Estratégico</h1>
          <p className="text-muted-foreground font-medium">Controle o faturamento do seu consultório</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-card border border-border text-muted-foreground px-5 py-3 rounded-xl font-bold text-sm hover:border-foreground hover:text-foreground transition">
            <Download className="w-4 h-4" /> Exportar
          </button>
          <button className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-3 rounded-xl font-bold text-sm shadow-lg">
            <DollarSign className="w-4 h-4" /> Nova Transação
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard kpi={{ label: "Faturamento", value: "R$ 14.6k", icon: DollarSign, change: "+18%", trend: "up", color: "bg-primary text-primary-foreground", description: "Total do mês" }} />
        <StatCard kpi={{ label: "Recebido", value: "R$ 12.4k", icon: TrendingUp, change: "85%", trend: "up", color: "bg-emerald text-primary-foreground", description: "Já confirmado" }} />
        <StatCard kpi={{ label: "Pendente", value: "R$ 2.2k", icon: CreditCard, change: "3 cobranças", trend: "neutral", color: "bg-amber text-foreground", description: "A receber" }} />
        <StatCard kpi={{ label: "Meta", value: "92%", icon: Target, change: "+8%", trend: "up", color: "bg-purple text-primary-foreground", description: "Do objetivo mensal" }} />
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
                <Tooltip formatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`} />
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
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => `${value / 1000}k`} />
                <Tooltip formatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`} />
                <Bar dataKey="entrada" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="saida" fill="#f43f5e" radius={[4, 4, 0, 0]} />
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
              <button key={type} onClick={() => setFilterType(type)} className={`px-4 py-2 rounded-xl font-bold text-sm transition ${filterType === type ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}>
                {type === 'all' ? 'Todas' : type === 'income' ? 'Receitas' : 'Despesas'}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {filteredTransactions.map(transaction => (
            <div key={transaction.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-2xl hover:bg-muted transition">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${transaction.type === 'income' ? 'bg-emerald/20 text-emerald' : 'bg-destructive/20 text-destructive'}`}>
                  {transaction.type === 'income' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                </div>
                <div>
                  <p className="font-bold text-foreground">{transaction.description}</p>
                  <p className="text-xs text-muted-foreground">{transaction.category} {transaction.patientName && `• ${transaction.patientName}`}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-black ${transaction.type === 'income' ? 'text-emerald' : 'text-destructive'}`}>
                  {transaction.type === 'income' ? '+' : '-'} R$ {transaction.amount.toLocaleString('pt-BR')}
                </p>
                <p className="text-xs text-muted-foreground">{new Date(transaction.date).toLocaleDateString('pt-BR')}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Financial;
