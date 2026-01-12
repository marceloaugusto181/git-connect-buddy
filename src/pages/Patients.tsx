import React, { useState, useMemo } from 'react';
import { UserPlus, Search, X, Phone, MessageCircle, DollarSign, CheckCircle2, AlertCircle, Smile, Frown, Meh, Trash2, Edit, Loader2 } from 'lucide-react';
import { usePatients, Patient } from '@/hooks/usePatients';
import PatientFormModal from '@/components/PatientFormModal';
import { generatePaymentMessage, openWhatsApp, generateReminderMessage } from '../services/whatsappService';

const Patients: React.FC = () => {
  const { patients, loading, createPatient, updatePatient, deletePatient } = usePatients();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [activeTab, setActiveTab] = useState<'dados' | 'prontuario' | 'financeiro'>('dados');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredPatients = useMemo(() => {
    return patients.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || (p.phone || '').includes(searchTerm);
      const matchesFilter = filterStatus === 'all' || p.status?.toLowerCase() === filterStatus.toLowerCase();
      return matchesSearch && matchesFilter;
    });
  }, [patients, searchTerm, filterStatus]);

  const getStatusColor = (status?: string | null) => {
    switch (status?.toLowerCase()) {
      case 'ativo': return 'bg-emerald/20 text-emerald';
      case 'inativo': return 'bg-muted text-muted-foreground';
      case 'pendente': return 'bg-amber/20 text-amber';
      case 'lista de espera': return 'bg-purple/20 text-purple';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getPaymentColor = (status?: string | null) => {
    switch (status) {
      case 'Em dia': return 'text-emerald';
      case 'Pendente': return 'text-amber';
      case 'Atrasado': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const handleSendPaymentReminder = (patient: Patient) => {
    const message = generatePaymentMessage(patient.name, `R$ ${patient.session_value || 0}`);
    openWhatsApp(patient.phone || '', message);
  };

  const handleSendSessionReminder = (patient: Patient) => {
    const message = generateReminderMessage(patient.name, new Date().toISOString().split('T')[0], '14:00');
    openWhatsApp(patient.phone || '', message);
  };

  const handleDelete = async (e: React.MouseEvent, patient: Patient) => {
    e.stopPropagation();
    if (confirm(`Tem certeza que deseja excluir ${patient.name}?`)) {
      setDeletingId(patient.id);
      await deletePatient(patient.id);
      setDeletingId(null);
    }
  };

  const handleEdit = (e: React.MouseEvent, patient: Patient) => {
    e.stopPropagation();
    setEditingPatient(patient);
    setIsFormOpen(true);
  };

  const openNewPatientForm = () => {
    setEditingPatient(null);
    setIsFormOpen(true);
  };

  const handleSave = async (data: any) => {
    if (editingPatient) {
      return await updatePatient(editingPatient.id, data);
    } else {
      return await createPatient(data);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-flow">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">Pacientes</h1>
          <p className="text-muted-foreground font-medium">Gerencie prontuários e acompanhamentos</p>
        </div>
        <button
          onClick={openNewPatientForm}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-3 rounded-xl font-bold hover:bg-primary/90 transition shadow-lg active:scale-95"
        >
          <UserPlus className="w-5 h-5" /> Novo Paciente
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 flex items-center bg-card border border-border rounded-2xl px-4 py-3">
          <Search className="w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por nome ou telefone..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none ml-3 font-medium"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['all', 'ativo', 'inativo', 'pendente'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-xl font-bold text-sm transition ${filterStatus === status ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-muted-foreground hover:text-foreground'}`}
            >
              {status === 'all' ? 'Todos' : status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Patient List */}
      {filteredPatients.length === 0 ? (
        <div className="bg-card border border-border rounded-[32px] p-12 text-center">
          <UserPlus className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-bold text-foreground mb-2">
            {searchTerm || filterStatus !== 'all' ? 'Nenhum paciente encontrado' : 'Nenhum paciente cadastrado'}
          </h3>
          <p className="text-muted-foreground mb-6">
            {searchTerm || filterStatus !== 'all' ? 'Tente ajustar os filtros de busca' : 'Comece cadastrando seu primeiro paciente'}
          </p>
          {!searchTerm && filterStatus === 'all' && (
            <button
              onClick={openNewPatientForm}
              className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold hover:bg-primary/90 transition"
            >
              Cadastrar Paciente
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPatients.map(patient => (
            <div
              key={patient.id}
              onClick={() => { setSelectedPatient(patient); setIsDetailOpen(true); }}
              className="bg-card border border-border rounded-[24px] p-5 hover:shadow-lg hover:border-primary/30 transition-all cursor-pointer group relative"
            >
              {deletingId === patient.id && (
                <div className="absolute inset-0 bg-card/80 rounded-[24px] flex items-center justify-center z-10">
                  <Loader2 className="w-6 h-6 animate-spin text-destructive" />
                </div>
              )}
              
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary font-black text-lg">
                    {patient.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground group-hover:text-primary transition">{patient.name}</h3>
                    <p className="text-xs text-muted-foreground">{patient.phone || 'Sem telefone'}</p>
                  </div>
                </div>
                <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg ${getStatusColor(patient.status)}`}>
                  {patient.status || 'Ativo'}
                </span>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Valor sessão:</span>
                  <span className="font-medium text-foreground">
                    {patient.session_value ? `R$ ${patient.session_value}` : '-'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Pagamento:</span>
                  <span className={`font-bold ${getPaymentColor(patient.payment_status)}`}>
                    {patient.payment_status || 'Em dia'}
                  </span>
                </div>
              </div>
              
              <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                <button
                  onClick={e => { e.stopPropagation(); handleSendSessionReminder(patient); }}
                  className="flex-1 flex items-center justify-center gap-2 py-2 bg-muted rounded-xl text-sm font-medium hover:bg-primary/20 hover:text-primary transition"
                >
                  <MessageCircle className="w-4 h-4" /> Lembrar
                </button>
                <button
                  onClick={e => handleEdit(e, patient)}
                  className="p-2 bg-muted rounded-xl hover:bg-amber/20 hover:text-amber transition"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={e => handleDelete(e, patient)}
                  className="p-2 bg-muted rounded-xl hover:bg-destructive/20 hover:text-destructive transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Patient Form Modal */}
      <PatientFormModal
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setEditingPatient(null); }}
        onSave={handleSave}
        patient={editingPatient}
      />

      {/* Patient Detail Modal */}
      {isDetailOpen && selectedPatient && (
        <div className="fixed inset-0 bg-foreground/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-[32px] w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary font-black text-xl">
                  {selectedPatient.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-black text-foreground">{selectedPatient.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedPatient.phone || 'Sem telefone'}</p>
                </div>
              </div>
              <button onClick={() => setIsDetailOpen(false)} className="p-2 hover:bg-muted rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-border">
              {(['dados', 'prontuario', 'financeiro'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-4 text-sm font-bold uppercase tracking-widest transition ${activeTab === tab ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}
                >
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
                      <p className="text-xs font-bold text-muted-foreground uppercase mb-1">CPF</p>
                      <p className="font-medium text-foreground">{selectedPatient.cpf || '-'}</p>
                    </div>
                    <div className="bg-muted/50 p-4 rounded-2xl">
                      <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Data de Nascimento</p>
                      <p className="font-medium text-foreground">
                        {selectedPatient.birth_date ? new Date(selectedPatient.birth_date).toLocaleDateString('pt-BR') : '-'}
                      </p>
                    </div>
                    <div className="bg-muted/50 p-4 rounded-2xl">
                      <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Status</p>
                      <p className="font-medium text-foreground capitalize">{selectedPatient.status || 'Ativo'}</p>
                    </div>
                  </div>
                  
                  {selectedPatient.address && (
                    <div className="bg-muted/50 p-4 rounded-2xl">
                      <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Endereço</p>
                      <p className="font-medium text-foreground">{selectedPatient.address}</p>
                    </div>
                  )}
                  
                  {(selectedPatient.emergency_contact || selectedPatient.emergency_phone) && (
                    <div className="bg-muted/50 p-4 rounded-2xl">
                      <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Contato de Emergência</p>
                      <p className="font-medium text-foreground">
                        {selectedPatient.emergency_contact} {selectedPatient.emergency_phone && `- ${selectedPatient.emergency_phone}`}
                      </p>
                    </div>
                  )}
                  
                  {selectedPatient.notes && (
                    <div className="bg-muted/50 p-4 rounded-2xl">
                      <p className="text-xs font-bold text-muted-foreground uppercase mb-2">Observações</p>
                      <p className="text-foreground">{selectedPatient.notes}</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'prontuario' && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Prontuário eletrônico em desenvolvimento.</p>
                  <p className="text-sm text-muted-foreground mt-2">Em breve você poderá registrar evoluções e consultar o histórico clínico.</p>
                </div>
              )}

              {activeTab === 'financeiro' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-muted/50 p-4 rounded-2xl">
                      <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Valor da Sessão</p>
                      <p className="text-2xl font-black text-foreground">
                        {selectedPatient.session_value ? `R$ ${selectedPatient.session_value}` : '-'}
                      </p>
                    </div>
                    <div className="bg-muted/50 p-4 rounded-2xl">
                      <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Status</p>
                      <p className={`text-2xl font-black ${getPaymentColor(selectedPatient.payment_status)}`}>
                        {selectedPatient.payment_status || 'Em dia'}
                      </p>
                    </div>
                  </div>
                  
                  <div className={`p-4 rounded-2xl flex items-center justify-between ${selectedPatient.payment_status === 'Em dia' ? 'bg-emerald/10' : 'bg-amber/10'}`}>
                    <div className="flex items-center gap-3">
                      {selectedPatient.payment_status === 'Em dia' ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald" />
                      ) : (
                        <AlertCircle className="w-6 h-6 text-amber" />
                      )}
                      <div>
                        <p className="font-bold text-foreground">Situação Financeira</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedPatient.payment_status === 'Em dia' ? 'Todos os pagamentos em dia' : 'Existem pendências'}
                        </p>
                      </div>
                    </div>
                    {selectedPatient.payment_status !== 'Em dia' && (
                      <button
                        onClick={() => handleSendPaymentReminder(selectedPatient)}
                        className="bg-amber text-foreground px-4 py-2 rounded-xl font-bold text-sm"
                      >
                        Enviar Cobrança
                      </button>
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
