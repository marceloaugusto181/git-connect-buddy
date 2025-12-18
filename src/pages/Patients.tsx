import React, { useState, useMemo } from 'react';
import { UserPlus, Search, X, Save, Phone, MessageCircle, DollarSign, CheckCircle2, AlertCircle, Clock, Smile, Frown, Meh } from 'lucide-react';
import { patientList as initialPatientList, clinicalRecordsMock } from '../utils/mockData';
import { Patient, ClinicalRecord } from '../types';
import { generatePaymentMessage, openWhatsApp, generateReminderMessage } from '../services/whatsappService';

const Patients: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>(initialPatientList);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [activeTab, setActiveTab] = useState<'dados' | 'prontuario' | 'financeiro'>('dados');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredPatients = useMemo(() => {
    return patients.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.phone.includes(searchTerm);
      const matchesFilter = filterStatus === 'all' || p.status === filterStatus;
      return matchesSearch && matchesFilter;
    });
  }, [patients, searchTerm, filterStatus]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Ativo': return 'bg-emerald/20 text-emerald';
      case 'Inativo': return 'bg-muted text-muted-foreground';
      case 'Pendente': return 'bg-amber/20 text-amber';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getPaymentColor = (status: string) => {
    switch (status) {
      case 'Em dia': return 'text-emerald';
      case 'Pendente': return 'text-amber';
      case 'Atrasado': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const getSentimentIcon = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive': return <Smile className="w-4 h-4 text-emerald" />;
      case 'negative': return <Frown className="w-4 h-4 text-destructive" />;
      default: return <Meh className="w-4 h-4 text-amber" />;
    }
  };

  const handleSendPaymentReminder = (patient: Patient) => {
    const message = generatePaymentMessage(patient.name, `R$ ${patient.sessionPrice}`);
    openWhatsApp(patient.phone, message);
  };

  const handleSendSessionReminder = (patient: Patient) => {
    const message = generateReminderMessage(patient.name, patient.nextSession, '14:00');
    openWhatsApp(patient.phone, message);
  };

  const patientRecords = selectedPatient ? clinicalRecordsMock.filter(r => r.patientId === selectedPatient.id) : [];

  return (
    <div className="space-y-6 animate-flow">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">Pacientes</h1>
          <p className="text-muted-foreground font-medium">Gerencie prontuários e acompanhamentos</p>
        </div>
        <button className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-3 rounded-xl font-bold hover:bg-primary/90 transition shadow-lg active:scale-95">
          <UserPlus className="w-5 h-5" /> Novo Paciente
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 flex items-center bg-card border border-border rounded-2xl px-4 py-3">
          <Search className="w-5 h-5 text-muted-foreground" />
          <input type="text" placeholder="Buscar por nome ou telefone..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="flex-1 bg-transparent border-none outline-none ml-3 font-medium" />
        </div>
        <div className="flex gap-2">
          {['all', 'Ativo', 'Inativo', 'Pendente'].map(status => (
            <button key={status} onClick={() => setFilterStatus(status)} className={`px-4 py-2 rounded-xl font-bold text-sm transition ${filterStatus === status ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-muted-foreground hover:text-foreground'}`}>
              {status === 'all' ? 'Todos' : status}
            </button>
          ))}
        </div>
      </div>

      {/* Patient List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPatients.map(patient => (
          <div key={patient.id} onClick={() => { setSelectedPatient(patient); setIsModalOpen(true); }} className="bg-card border border-border rounded-[24px] p-5 hover:shadow-lg hover:border-primary/30 transition-all cursor-pointer group">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary font-black text-lg">{patient.name.charAt(0)}</div>
                <div>
                  <h3 className="font-bold text-foreground group-hover:text-primary transition">{patient.name}</h3>
                  <p className="text-xs text-muted-foreground">{patient.phone}</p>
                </div>
              </div>
              <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg ${getStatusColor(patient.status)}`}>{patient.status}</span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Última sessão:</span>
                <span className="font-medium text-foreground">{new Date(patient.lastSession).toLocaleDateString('pt-BR')}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Próxima:</span>
                <span className="font-medium text-foreground">{patient.nextSession === '-' ? '-' : new Date(patient.nextSession).toLocaleDateString('pt-BR')}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Pagamento:</span>
                <span className={`font-bold ${getPaymentColor(patient.paymentStatus)}`}>{patient.paymentStatus}</span>
              </div>
            </div>
            <div className="flex gap-2 mt-4 pt-4 border-t border-border">
              <button onClick={e => { e.stopPropagation(); handleSendSessionReminder(patient); }} className="flex-1 flex items-center justify-center gap-2 py-2 bg-muted rounded-xl text-sm font-medium hover:bg-primary/20 hover:text-primary transition">
                <MessageCircle className="w-4 h-4" /> Lembrar
              </button>
              <button onClick={e => { e.stopPropagation(); handleSendPaymentReminder(patient); }} className="flex-1 flex items-center justify-center gap-2 py-2 bg-muted rounded-xl text-sm font-medium hover:bg-amber/20 hover:text-amber transition">
                <DollarSign className="w-4 h-4" /> Cobrar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Patient Detail Modal */}
      {isModalOpen && selectedPatient && (
        <div className="fixed inset-0 bg-foreground/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-[32px] w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary font-black text-xl">{selectedPatient.name.charAt(0)}</div>
                <div>
                  <h3 className="text-xl font-black text-foreground">{selectedPatient.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedPatient.phone}</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-muted rounded-lg"><X className="w-5 h-5" /></button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-border">
              {(['dados', 'prontuario', 'financeiro'] as const).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-4 text-sm font-bold uppercase tracking-widest transition ${activeTab === tab ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}>
                  {tab === 'dados' ? 'Dados' : tab === 'prontuario' ? 'Prontuário' : 'Financeiro'}
                </button>
              ))}
            </div>

            <div className="p-6 overflow-y-auto max-h-[400px] custom-scrollbar">
              {activeTab === 'dados' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-muted/50 p-4 rounded-2xl">
                      <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Email</p>
                      <p className="font-medium text-foreground">{selectedPatient.email || '-'}</p>
                    </div>
                    <div className="bg-muted/50 p-4 rounded-2xl">
                      <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Categoria</p>
                      <p className="font-medium text-foreground">{selectedPatient.category}</p>
                    </div>
                    <div className="bg-muted/50 p-4 rounded-2xl">
                      <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Primeira Sessão</p>
                      <p className="font-medium text-foreground">{new Date(selectedPatient.firstSessionDate).toLocaleDateString('pt-BR')}</p>
                    </div>
                    <div className="bg-muted/50 p-4 rounded-2xl">
                      <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Lembretes</p>
                      <p className="font-medium text-foreground">{selectedPatient.automaticReminders ? 'Ativados' : 'Desativados'}</p>
                    </div>
                  </div>
                  {selectedPatient.notes && (
                    <div className="bg-muted/50 p-4 rounded-2xl">
                      <p className="text-xs font-bold text-muted-foreground uppercase mb-2">Observações</p>
                      <p className="text-foreground">{selectedPatient.notes}</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'prontuario' && (
                <div className="space-y-4">
                  {patientRecords.length > 0 ? patientRecords.map(record => (
                    <div key={record.id} className="bg-muted/50 p-4 rounded-2xl">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-muted-foreground uppercase">{new Date(record.date).toLocaleDateString('pt-BR')}</span>
                          <span className="text-xs font-bold px-2 py-0.5 rounded bg-primary/20 text-primary">{record.type}</span>
                        </div>
                        {getSentimentIcon(record.sentiment)}
                      </div>
                      <p className="text-foreground">{record.content}</p>
                      {record.wellbeingScore && (
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Bem-estar:</span>
                          <div className="flex-1 bg-muted rounded-full h-2">
                            <div className="bg-primary h-2 rounded-full" style={{ width: `${record.wellbeingScore * 10}%` }}></div>
                          </div>
                          <span className="text-xs font-bold text-primary">{record.wellbeingScore}/10</span>
                        </div>
                      )}
                    </div>
                  )) : (
                    <p className="text-center text-muted-foreground py-8">Nenhum registro clínico</p>
                  )}
                </div>
              )}

              {activeTab === 'financeiro' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-muted/50 p-4 rounded-2xl">
                      <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Valor da Sessão</p>
                      <p className="text-2xl font-black text-foreground">R$ {selectedPatient.sessionPrice}</p>
                    </div>
                    <div className="bg-muted/50 p-4 rounded-2xl">
                      <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Forma de Pagamento</p>
                      <p className="text-2xl font-black text-foreground">{selectedPatient.paymentMethod}</p>
                    </div>
                  </div>
                  <div className={`p-4 rounded-2xl flex items-center justify-between ${selectedPatient.paymentStatus === 'Em dia' ? 'bg-emerald/10' : 'bg-amber/10'}`}>
                    <div className="flex items-center gap-3">
                      {selectedPatient.paymentStatus === 'Em dia' ? <CheckCircle2 className="w-6 h-6 text-emerald" /> : <AlertCircle className="w-6 h-6 text-amber" />}
                      <div>
                        <p className="font-bold text-foreground">Status: {selectedPatient.paymentStatus}</p>
                        <p className="text-sm text-muted-foreground">Última atualização: hoje</p>
                      </div>
                    </div>
                    {selectedPatient.paymentStatus !== 'Em dia' && (
                      <button onClick={() => handleSendPaymentReminder(selectedPatient)} className="bg-amber text-foreground px-4 py-2 rounded-xl font-bold text-sm">Enviar Cobrança</button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Patients;
