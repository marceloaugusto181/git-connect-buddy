import jsPDF from 'jspdf';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import * as XLSX from 'xlsx';
import { Transaction } from '@/hooks/useTransactions';

interface MonthSummary {
  monthLabel: string;
  income: number;
  expense: number;
  balance: number;
  sessionCount: number;
}

interface ExportData {
  transactions: Transaction[];
  year: number;
  therapistName?: string;
}

const getMonthlyData = (transactions: Transaction[], year: number): MonthSummary[] => {
  const data: MonthSummary[] = [];
  for (let month = 0; month < 12; month++) {
    const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
    const mt = transactions.filter(t => t.date.startsWith(monthKey));
    const income = mt.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
    const expense = mt.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);
    const sessionCount = mt.filter(t => t.type === 'income' && t.category === 'Sessão').length;
    data.push({
      monthLabel: new Date(year, month, 1).toLocaleDateString('pt-BR', { month: 'long' }),
      income,
      expense,
      balance: income - expense,
      sessionCount,
    });
  }
  return data;
};

const fmt = (v: number) => `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

// ── PDF Export ──
export const exportFinancialPdf = ({ transactions, year, therapistName }: ExportData) => {
  const doc = new jsPDF();
  const pw = doc.internal.pageSize.getWidth();
  const margin = 20;
  let y = margin;

  // Header
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Relatório Financeiro', pw / 2, y, { align: 'center' });
  y += 8;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Ano: ${year}`, pw / 2, y, { align: 'center' });
  y += 6;
  if (therapistName) {
    doc.setFontSize(10);
    doc.text(`Profissional: ${therapistName}`, pw / 2, y, { align: 'center' });
    y += 6;
  }
  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text(`Gerado em: ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`, pw / 2, y, { align: 'center' });
  y += 8;
  doc.setDrawColor(200);
  doc.line(margin, y, pw - margin, y);
  y += 10;

  const monthly = getMonthlyData(transactions, year);
  const totalIncome = monthly.reduce((s, m) => s + m.income, 0);
  const totalExpense = monthly.reduce((s, m) => s + m.expense, 0);
  const totalSessions = monthly.reduce((s, m) => s + m.sessionCount, 0);

  // Summary KPIs
  doc.setTextColor(0);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Resumo Anual', margin, y);
  y += 7;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Receita Total: ${fmt(totalIncome)}`, margin, y); y += 5;
  doc.text(`Despesa Total: ${fmt(totalExpense)}`, margin, y); y += 5;
  doc.text(`Saldo: ${fmt(totalIncome - totalExpense)}`, margin, y); y += 5;
  doc.text(`Total de Sessões: ${totalSessions}`, margin, y); y += 5;
  doc.text(`Média Mensal (Receita): ${fmt(totalIncome / 12)}`, margin, y); y += 5;
  doc.text(`Média Mensal (Despesa): ${fmt(totalExpense / 12)}`, margin, y); y += 10;

  doc.line(margin, y, pw - margin, y);
  y += 10;

  // Monthly Table
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Detalhamento Mensal', margin, y);
  y += 8;

  // Table header
  const cols = [margin, margin + 40, margin + 80, margin + 120, margin + 155];
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setFillColor(245, 245, 245);
  doc.roundedRect(margin, y - 4, pw - margin * 2, 10, 2, 2, 'F');
  doc.text('Mês', cols[0] + 2, y + 2);
  doc.text('Receitas', cols[1] + 2, y + 2);
  doc.text('Despesas', cols[2] + 2, y + 2);
  doc.text('Saldo', cols[3] + 2, y + 2);
  doc.text('Sessões', cols[4] + 2, y + 2);
  y += 10;

  doc.setFont('helvetica', 'normal');
  monthly.forEach(m => {
    if (y > doc.internal.pageSize.getHeight() - 30) {
      doc.addPage();
      y = margin;
    }
    doc.text(m.monthLabel.charAt(0).toUpperCase() + m.monthLabel.slice(1), cols[0] + 2, y);
    doc.text(fmt(m.income), cols[1] + 2, y);
    doc.text(fmt(m.expense), cols[2] + 2, y);
    doc.text(fmt(m.balance), cols[3] + 2, y);
    doc.text(String(m.sessionCount), cols[4] + 2, y);
    y += 6;
  });

  // Total row
  y += 2;
  doc.setFont('helvetica', 'bold');
  doc.setFillColor(240, 240, 240);
  doc.roundedRect(margin, y - 4, pw - margin * 2, 10, 2, 2, 'F');
  doc.text('TOTAL', cols[0] + 2, y + 2);
  doc.text(fmt(totalIncome), cols[1] + 2, y + 2);
  doc.text(fmt(totalExpense), cols[2] + 2, y + 2);
  doc.text(fmt(totalIncome - totalExpense), cols[3] + 2, y + 2);
  doc.text(String(totalSessions), cols[4] + 2, y + 2);
  y += 16;

  // Transactions list
  const yearTx = transactions.filter(t => t.date.startsWith(String(year)));
  if (yearTx.length > 0) {
    if (y > doc.internal.pageSize.getHeight() - 40) {
      doc.addPage();
      y = margin;
    }
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Todas as Transações', margin, y);
    y += 8;

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setFillColor(245, 245, 245);
    doc.roundedRect(margin, y - 4, pw - margin * 2, 10, 2, 2, 'F');
    doc.text('Data', margin + 2, y + 2);
    doc.text('Descrição', margin + 25, y + 2);
    doc.text('Categoria', margin + 85, y + 2);
    doc.text('Tipo', margin + 115, y + 2);
    doc.text('Valor', margin + 135, y + 2);
    doc.text('Status', margin + 160, y + 2);
    y += 10;

    doc.setFont('helvetica', 'normal');
    yearTx.forEach(t => {
      if (y > doc.internal.pageSize.getHeight() - 20) {
        doc.addPage();
        y = margin;
      }
      doc.text(format(new Date(t.date), 'dd/MM/yy'), margin + 2, y);
      doc.text(t.description.slice(0, 30), margin + 25, y);
      doc.text(t.category.slice(0, 15), margin + 85, y);
      doc.text(t.type === 'income' ? 'Receita' : 'Despesa', margin + 115, y);
      doc.text(fmt(Number(t.amount)), margin + 135, y);
      doc.text(t.status || '-', margin + 160, y);
      y += 5;
    });
  }

  // Footer
  const totalPages = doc.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`Página ${i} de ${totalPages} - Documento confidencial`, pw / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
  }

  doc.save(`relatorio_financeiro_${year}.pdf`);
};

// ── Excel Export ──
export const exportFinancialExcel = ({ transactions, year, therapistName }: ExportData) => {
  const wb = XLSX.utils.book_new();
  const monthly = getMonthlyData(transactions, year);
  const totalIncome = monthly.reduce((s, m) => s + m.income, 0);
  const totalExpense = monthly.reduce((s, m) => s + m.expense, 0);
  const totalSessions = monthly.reduce((s, m) => s + m.sessionCount, 0);

  // Sheet 1: Resumo Mensal
  const summaryRows = [
    ['Relatório Financeiro - ' + year],
    [therapistName ? `Profissional: ${therapistName}` : ''],
    [`Gerado em: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}`],
    [],
    ['Mês', 'Receitas', 'Despesas', 'Saldo', 'Sessões'],
    ...monthly.map(m => [
      m.monthLabel.charAt(0).toUpperCase() + m.monthLabel.slice(1),
      m.income,
      m.expense,
      m.balance,
      m.sessionCount,
    ]),
    ['TOTAL', totalIncome, totalExpense, totalIncome - totalExpense, totalSessions],
  ];
  const ws1 = XLSX.utils.aoa_to_sheet(summaryRows);
  ws1['!cols'] = [{ wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 10 }];
  XLSX.utils.book_append_sheet(wb, ws1, 'Resumo Mensal');

  // Sheet 2: Transações
  const yearTx = transactions.filter(t => t.date.startsWith(String(year)));
  const txRows = [
    ['Data', 'Descrição', 'Categoria', 'Paciente', 'Tipo', 'Valor', 'Status'],
    ...yearTx.map(t => [
      format(new Date(t.date), 'dd/MM/yyyy'),
      t.description,
      t.category,
      t.patient?.name || '-',
      t.type === 'income' ? 'Receita' : 'Despesa',
      Number(t.amount),
      t.status || '-',
    ]),
  ];
  const ws2 = XLSX.utils.aoa_to_sheet(txRows);
  ws2['!cols'] = [{ wch: 12 }, { wch: 30 }, { wch: 15 }, { wch: 20 }, { wch: 10 }, { wch: 12 }, { wch: 12 }];
  XLSX.utils.book_append_sheet(wb, ws2, 'Transações');

  XLSX.writeFile(wb, `relatorio_financeiro_${year}.xlsx`);
};
