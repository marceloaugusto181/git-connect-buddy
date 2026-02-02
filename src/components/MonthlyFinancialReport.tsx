import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Calendar, DollarSign, ArrowUpRight, ArrowDownRight, BarChart3 } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, AreaChart, Area, Legend } from 'recharts';
import { Transaction } from '@/hooks/useTransactions';

interface MonthlyFinancialReportProps {
  transactions: Transaction[];
}

interface MonthData {
  month: string;
  monthLabel: string;
  income: number;
  expense: number;
  balance: number;
  sessionCount: number;
}

const MonthlyFinancialReport: React.FC<MonthlyFinancialReportProps> = ({ transactions }) => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Calculate monthly data for the selected year
  const monthlyData = useMemo(() => {
    const data: MonthData[] = [];
    
    for (let month = 0; month < 12; month++) {
      const monthKey = `${selectedYear}-${String(month + 1).padStart(2, '0')}`;
      const monthTransactions = transactions.filter(t => t.date.startsWith(monthKey));
      
      const income = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0);
      
      const expense = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const sessionCount = monthTransactions
        .filter(t => t.type === 'income' && t.category === 'Sessão')
        .length;

      data.push({
        month: monthKey,
        monthLabel: new Date(selectedYear, month, 1).toLocaleDateString('pt-BR', { month: 'short' }),
        income,
        expense,
        balance: income - expense,
        sessionCount,
      });
    }
    
    return data;
  }, [transactions, selectedYear]);

  // Calculate cumulative data for area chart
  const cumulativeData = useMemo(() => {
    let cumulativeIncome = 0;
    let cumulativeExpense = 0;
    
    return monthlyData.map(item => {
      cumulativeIncome += item.income;
      cumulativeExpense += item.expense;
      return {
        ...item,
        cumulativeIncome,
        cumulativeExpense,
        cumulativeBalance: cumulativeIncome - cumulativeExpense,
      };
    });
  }, [monthlyData]);

  // Calculate year summary
  const yearSummary = useMemo(() => {
    const totalIncome = monthlyData.reduce((sum, m) => sum + m.income, 0);
    const totalExpense = monthlyData.reduce((sum, m) => sum + m.expense, 0);
    const totalSessions = monthlyData.reduce((sum, m) => sum + m.sessionCount, 0);
    const avgMonthlyIncome = totalIncome / 12;
    const avgMonthlyExpense = totalExpense / 12;
    
    // Find best and worst months
    const monthsWithIncome = monthlyData.filter(m => m.income > 0);
    const bestMonth = monthsWithIncome.length > 0 
      ? monthsWithIncome.reduce((best, m) => m.income > best.income ? m : best) 
      : null;
    const worstMonth = monthsWithIncome.length > 0 
      ? monthsWithIncome.reduce((worst, m) => m.income < worst.income ? m : worst)
      : null;

    return {
      totalIncome,
      totalExpense,
      totalBalance: totalIncome - totalExpense,
      totalSessions,
      avgMonthlyIncome,
      avgMonthlyExpense,
      bestMonth,
      worstMonth,
    };
  }, [monthlyData]);

  // Calculate growth rate
  const growthData = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentMonthData = monthlyData[currentMonth];
    const previousMonthData = currentMonth > 0 ? monthlyData[currentMonth - 1] : null;
    
    if (!previousMonthData || previousMonthData.income === 0) {
      return { incomeGrowth: 0, expenseGrowth: 0 };
    }
    
    return {
      incomeGrowth: ((currentMonthData.income - previousMonthData.income) / previousMonthData.income) * 100,
      expenseGrowth: ((currentMonthData.expense - previousMonthData.expense) / previousMonthData.expense) * 100,
    };
  }, [monthlyData]);

  const formatCurrency = (value: number) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  const formatShortCurrency = (value: number) => {
    if (value >= 1000) return `R$ ${(value / 1000).toFixed(1)}k`;
    return `R$ ${value.toFixed(0)}`;
  };

  return (
    <div className="space-y-6">
      {/* Year Selector and Summary */}
      <div className="bg-card border border-border rounded-[32px] p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h3 className="text-xl font-black text-foreground flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-primary" />
              Relatório Anual
            </h3>
            <p className="text-sm text-muted-foreground">Evolução financeira detalhada</p>
          </div>
          
          <div className="flex items-center gap-3 bg-muted rounded-xl p-1">
            <button 
              onClick={() => setSelectedYear(y => y - 1)}
              className="p-2 hover:bg-background rounded-lg transition"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="font-bold text-foreground px-4">{selectedYear}</span>
            <button 
              onClick={() => setSelectedYear(y => y + 1)}
              disabled={selectedYear >= new Date().getFullYear()}
              className="p-2 hover:bg-background rounded-lg transition disabled:opacity-50"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Year KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-muted/50 rounded-2xl p-4">
            <div className="flex items-center gap-2 text-emerald mb-2">
              <ArrowUpRight className="w-4 h-4" />
              <span className="text-xs font-bold uppercase">Receita Total</span>
            </div>
            <p className="text-2xl font-black text-foreground">{formatShortCurrency(yearSummary.totalIncome)}</p>
            <p className="text-xs text-muted-foreground mt-1">Média: {formatShortCurrency(yearSummary.avgMonthlyIncome)}/mês</p>
          </div>
          
          <div className="bg-muted/50 rounded-2xl p-4">
            <div className="flex items-center gap-2 text-destructive mb-2">
              <ArrowDownRight className="w-4 h-4" />
              <span className="text-xs font-bold uppercase">Despesa Total</span>
            </div>
            <p className="text-2xl font-black text-foreground">{formatShortCurrency(yearSummary.totalExpense)}</p>
            <p className="text-xs text-muted-foreground mt-1">Média: {formatShortCurrency(yearSummary.avgMonthlyExpense)}/mês</p>
          </div>
          
          <div className="bg-muted/50 rounded-2xl p-4">
            <div className="flex items-center gap-2 text-primary mb-2">
              <DollarSign className="w-4 h-4" />
              <span className="text-xs font-bold uppercase">Saldo do Ano</span>
            </div>
            <p className={`text-2xl font-black ${yearSummary.totalBalance >= 0 ? 'text-emerald' : 'text-destructive'}`}>
              {formatShortCurrency(yearSummary.totalBalance)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{yearSummary.totalSessions} sessões realizadas</p>
          </div>
          
          <div className="bg-muted/50 rounded-2xl p-4">
            <div className="flex items-center gap-2 text-purple mb-2">
              <Calendar className="w-4 h-4" />
              <span className="text-xs font-bold uppercase">Melhor Mês</span>
            </div>
            {yearSummary.bestMonth ? (
              <>
                <p className="text-2xl font-black text-foreground capitalize">{yearSummary.bestMonth.monthLabel}</p>
                <p className="text-xs text-muted-foreground mt-1">{formatShortCurrency(yearSummary.bestMonth.income)}</p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Sem dados</p>
            )}
          </div>
        </div>
      </div>

      {/* Evolution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend Line Chart */}
        <div className="bg-card border border-border rounded-[32px] p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-black text-foreground">Evolução Mensal</h3>
            <div className="flex items-center gap-2">
              {growthData.incomeGrowth !== 0 && (
                <span className={`text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1 ${
                  growthData.incomeGrowth >= 0 
                    ? 'bg-emerald/20 text-emerald' 
                    : 'bg-destructive/20 text-destructive'
                }`}>
                  {growthData.incomeGrowth >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {Math.abs(growthData.incomeGrowth).toFixed(1)}%
                </span>
              )}
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="monthLabel" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => formatShortCurrency(v)} />
                <Tooltip 
                  formatter={(value: number, name: string) => [formatCurrency(value), name === 'income' ? 'Receitas' : name === 'expense' ? 'Despesas' : 'Saldo']}
                  labelFormatter={(label) => `Mês: ${label}`}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '12px',
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="income" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3} 
                  dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                  name="income"
                />
                <Line 
                  type="monotone" 
                  dataKey="expense" 
                  stroke="hsl(var(--destructive))" 
                  strokeWidth={3} 
                  dot={{ fill: 'hsl(var(--destructive))', strokeWidth: 2, r: 4 }}
                  name="expense"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary"></div>
              <span className="text-sm font-medium text-muted-foreground">Receitas</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-destructive"></div>
              <span className="text-sm font-medium text-muted-foreground">Despesas</span>
            </div>
          </div>
        </div>

        {/* Cumulative Area Chart */}
        <div className="bg-card border border-border rounded-[32px] p-6">
          <h3 className="text-lg font-black text-foreground mb-4">Acumulado no Ano</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cumulativeData}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="monthLabel" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => formatShortCurrency(v)} />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    formatCurrency(value), 
                    name === 'cumulativeIncome' ? 'Receitas Acum.' : 'Despesas Acum.'
                  ]}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '12px',
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="cumulativeIncome" 
                  stroke="hsl(var(--primary))" 
                  fillOpacity={1} 
                  fill="url(#colorIncome)" 
                  strokeWidth={2}
                  name="cumulativeIncome"
                />
                <Area 
                  type="monotone" 
                  dataKey="cumulativeExpense" 
                  stroke="hsl(var(--destructive))" 
                  fillOpacity={1} 
                  fill="url(#colorExpense)" 
                  strokeWidth={2}
                  name="cumulativeExpense"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary"></div>
              <span className="text-sm font-medium text-muted-foreground">Receitas Acumuladas</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-destructive"></div>
              <span className="text-sm font-medium text-muted-foreground">Despesas Acumuladas</span>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Breakdown Table */}
      <div className="bg-card border border-border rounded-[32px] p-6">
        <h3 className="text-lg font-black text-foreground mb-4">Detalhamento Mensal</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-xs font-bold uppercase text-muted-foreground">Mês</th>
                <th className="text-right py-3 px-4 text-xs font-bold uppercase text-muted-foreground">Receitas</th>
                <th className="text-right py-3 px-4 text-xs font-bold uppercase text-muted-foreground">Despesas</th>
                <th className="text-right py-3 px-4 text-xs font-bold uppercase text-muted-foreground">Saldo</th>
                <th className="text-right py-3 px-4 text-xs font-bold uppercase text-muted-foreground">Sessões</th>
              </tr>
            </thead>
            <tbody>
              {monthlyData.map((month, index) => (
                <tr key={month.month} className={`border-b border-border/50 ${index === new Date().getMonth() && selectedYear === new Date().getFullYear() ? 'bg-primary/5' : ''}`}>
                  <td className="py-3 px-4 font-bold text-foreground capitalize">{month.monthLabel}</td>
                  <td className="py-3 px-4 text-right font-medium text-emerald">{formatCurrency(month.income)}</td>
                  <td className="py-3 px-4 text-right font-medium text-destructive">{formatCurrency(month.expense)}</td>
                  <td className={`py-3 px-4 text-right font-bold ${month.balance >= 0 ? 'text-emerald' : 'text-destructive'}`}>
                    {formatCurrency(month.balance)}
                  </td>
                  <td className="py-3 px-4 text-right text-muted-foreground">{month.sessionCount}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-muted/50">
                <td className="py-3 px-4 font-black text-foreground">TOTAL</td>
                <td className="py-3 px-4 text-right font-black text-emerald">{formatCurrency(yearSummary.totalIncome)}</td>
                <td className="py-3 px-4 text-right font-black text-destructive">{formatCurrency(yearSummary.totalExpense)}</td>
                <td className={`py-3 px-4 text-right font-black ${yearSummary.totalBalance >= 0 ? 'text-emerald' : 'text-destructive'}`}>
                  {formatCurrency(yearSummary.totalBalance)}
                </td>
                <td className="py-3 px-4 text-right font-bold text-foreground">{yearSummary.totalSessions}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MonthlyFinancialReport;
