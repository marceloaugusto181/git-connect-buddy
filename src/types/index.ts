export type Page = 'overview' | 'agenda' | 'financial' | 'patients' | 'automations' | 'security' | 'resources' | 'tasks' | 'leads' | 'documents' | 'partners';

export interface KPI {
  label: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon: React.ComponentType<{ className?: string }>;
  color?: string;
  description?: string;
}

export interface EvolutionPoint {
  date: string;
  status: 'attended' | 'missed' | 'canceled';
  paid: boolean;
  sentiment?: 'positive' | 'neutral' | 'negative';
  summary?: string;
}

export interface Patient {
  id: string;
  name: string;
  phone: string;
  email?: string;
  cpf?: string;
  birthDate?: string;
  status: 'Ativo' | 'Inativo' | 'Pendente' | 'Lista de Espera';
  lastSession: string;
  nextSession: string;
  firstSessionDate: string;
  paymentStatus: 'Em dia' | 'Pendente' | 'Atrasado';
  sessionPrice: number;
  paymentMethod: 'Pix' | 'Cartão' | 'Dinheiro' | 'Convênio' | 'Reembolso';
  notes?: string;
  sessionSummary?: string;
  automaticReminders: boolean;
  reminderTime?: string;
  category: 'Particular' | 'Convênio' | 'Reembolso';
  docsStatus?: {
    contract: boolean;
    identity: boolean;
  };
}

export interface ChatMessage {
  id: string;
  patientId: string;
  sender: 'user' | 'patient';
  text: string;
  timestamp: string;
  read: boolean;
  attachment?: unknown;
}

export interface ClinicalRecord {
  id: string;
  patientId: string;
  date: string;
  content: string;
  type: 'Sessão' | 'Anamnese' | 'Encaminhamento';
  sentiment?: 'positive' | 'neutral' | 'negative';
  wellbeingScore?: number;
}

export interface AppointmentData {
  name: string;
  attended: number;
  canceled: number;
}

export interface FinancialData {
  month: string;
  revenue: number;
  projected: number;
}

export interface Transaction {
  id: string;
  description: string;
  category: string;
  amount: number;
  type: 'income' | 'expense';
  date: string;
  status: string;
  patientName?: string;
}

export interface AutomationConfig {
  id: string;
  title: string;
  description: string;
  active: boolean;
  trigger: string;
  icon: 'whatsapp' | 'bot';
  template: string;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  source: string;
  urgency: 'high' | 'medium' | 'low';
  status: string;
  date: string;
}

export interface ClinicalDocument {
  id: string;
  title: string;
  category: string;
  lastGenerated: string;
  status: 'Finalizado' | 'Draft';
}

export interface Partner {
  id: string;
  name: string;
  specialty: string;
  referralsCount: number;
  status: 'Ativo' | 'Inativo';
  contact: string;
}

export interface AISuggestion {
  id: string;
  type: 'billing' | 'clinical' | 'retention' | string;
  title: string;
  description: string;
  actionLabel: string;
  impact: 'high' | 'medium' | 'low' | string;
}

export interface Resource {
  id: string;
  title: string;
  type: 'PDF' | 'Vídeo' | 'Áudio' | 'Drive' | 'Link';
  size?: string;
  autoSend: boolean;
  trigger?: string;
  category: string;
  cloudUrl?: string;
}

export interface Task {
  id: string;
  title: string;
  patientName?: string;
  dueDate: string;
  priority: 'Alta' | 'Média' | 'Baixa';
  status: 'Pendente' | 'Concluído' | 'Pago';
  category: 'Clínica' | 'Financeira' | 'Administrativa';
}
