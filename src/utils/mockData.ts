import { Patient, AppointmentData, FinancialData, Transaction, AutomationConfig, ChatMessage, ClinicalRecord, Lead, ClinicalDocument, Partner } from '../types';

const getRelativeDate = (daysOffset: number) => {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  return date.toISOString().split('T')[0];
};

export const leadList: Lead[] = [
  { id: '1', name: 'Juliana Mendes', phone: '(11) 98877-0011', source: 'Instagram', urgency: 'high', status: 'Lead', date: getRelativeDate(0) },
  { id: '2', name: 'Marcos Paulo', phone: '(11) 97766-5544', source: 'Google', urgency: 'medium', status: 'Triagem', date: getRelativeDate(-1) },
  { id: '3', name: 'Cintia Lopes', phone: '(11) 96655-4433', source: 'Indicação', urgency: 'low', status: 'Aguardando 1ª', date: getRelativeDate(-3) },
];

export const documentTemplates: ClinicalDocument[] = [
  { id: '1', title: 'Atestado de Comparecimento', category: 'Atestado', lastGenerated: '12 Mai 2024', status: 'Finalizado' },
  { id: '2', title: 'Relatório Psicológico Judicial', category: 'Relatório', lastGenerated: '05 Mai 2024', status: 'Draft' },
  { id: '3', title: 'Contrato Terapêutico Individual', category: 'Contrato', lastGenerated: '15 Abr 2024', status: 'Finalizado' },
];

export const partnerList: Partner[] = [
  { id: '1', name: 'Dr. Roberto Faro', specialty: 'Psiquiatra', referralsCount: 12, status: 'Ativo', contact: 'roberto@clinicafaro.com' },
  { id: '2', name: 'Dra. Aline Santos', specialty: 'Neurologista', referralsCount: 8, status: 'Ativo', contact: 'aline.neuro@gmail.com' },
];

export const weeklyAppointments: AppointmentData[] = [
  { name: 'Seg', attended: 4, canceled: 0 },
  { name: 'Ter', attended: 6, canceled: 1 },
  { name: 'Qua', attended: 5, canceled: 0 },
  { name: 'Qui', attended: 7, canceled: 1 },
  { name: 'Sex', attended: 3, canceled: 0 },
];

export const financialHistory: FinancialData[] = [
  { month: 'Jan', revenue: 12000, projected: 12500 },
  { month: 'Fev', revenue: 11500, projected: 13000 },
  { month: 'Mar', revenue: 14000, projected: 14000 },
  { month: 'Abr', revenue: 13200, projected: 15000 },
  { month: 'Mai', revenue: 15500, projected: 15500 },
  { month: 'Jun', revenue: 16000, projected: 16500 },
];

export const patientList: Patient[] = [
  {
    id: '1',
    name: 'Ana Silva',
    phone: '(11) 99876-5432',
    email: 'ana.silva@email.com',
    status: 'Ativo',
    lastSession: getRelativeDate(-7),
    nextSession: getRelativeDate(1),
    firstSessionDate: '2023-01-15',
    paymentStatus: 'Em dia',
    notes: 'Paciente prefere sessões no período da manhã. Foco atual: ansiedade social.',
    automaticReminders: true,
    sessionPrice: 200,
    paymentMethod: 'Pix',
    category: 'Particular'
  },
  {
    id: '2',
    name: 'Carlos Ferreira',
    phone: '(21) 98888-7777',
    status: 'Ativo',
    lastSession: getRelativeDate(-2),
    nextSession: getRelativeDate(2),
    firstSessionDate: '2023-03-10',
    paymentStatus: 'Pendente',
    notes: 'Aguardando confirmação do convênio para reembolso.',
    automaticReminders: true,
    sessionPrice: 180,
    paymentMethod: 'Reembolso',
    category: 'Reembolso'
  },
  {
    id: '3',
    name: 'Beatriz Costa',
    phone: '(31) 97777-6666',
    status: 'Inativo',
    lastSession: '2023-09-15',
    nextSession: '-',
    firstSessionDate: '2022-11-05',
    paymentStatus: 'Em dia',
    automaticReminders: false,
    sessionPrice: 200,
    paymentMethod: 'Pix',
    category: 'Particular'
  },
];

export const clinicalRecordsMock: ClinicalRecord[] = [
  {
    id: '101',
    patientId: '1',
    date: getRelativeDate(-7),
    type: 'Sessão',
    content: 'Paciente relatou melhora nos quadros de ansiedade social.',
    sentiment: 'positive',
    wellbeingScore: 8
  },
  {
    id: '102',
    patientId: '1',
    date: getRelativeDate(-14),
    type: 'Sessão',
    content: 'Sessão focada em reestruturação cognitiva.',
    sentiment: 'neutral',
    wellbeingScore: 6
  },
  {
    id: '103',
    patientId: '1',
    date: getRelativeDate(-21),
    type: 'Sessão',
    content: 'Crise de pânico durante a semana.',
    sentiment: 'negative',
    wellbeingScore: 3
  }
];

export const automationSettings: AutomationConfig[] = [
  {
    id: '1',
    title: 'Lembrete de Sessão',
    description: 'Envia mensagem de confirmação 24h antes.',
    active: true,
    trigger: '24h antes',
    icon: 'whatsapp',
    template: 'Olá {nome}, lembrete da sua sessão amanhã às {horario}. Confirmado?'
  },
];

export const recentTransactions: Transaction[] = [
  { id: '1', description: 'Sessão Terapia', category: 'Receita', amount: 250, type: 'income', date: getRelativeDate(0), status: 'Pago', patientName: 'Ana Silva' },
  { id: '2', description: 'Aluguel Consultório', category: 'Despesa Fixa', amount: 1200, type: 'expense', date: getRelativeDate(-1), status: 'Pago' },
];

export const securityLog = [
  { id: 1, action: 'Backup Realizado', date: 'Hoje, 03:00', status: 'Sucesso' },
];

export const mockChatMessages: ChatMessage[] = [
  { id: '1', patientId: '1', sender: 'patient', text: 'Bom dia, Dra! Gostaria de confirmar nossa sessão de amanhã.', timestamp: new Date(Date.now() - 86400000).toISOString(), read: true },
];
