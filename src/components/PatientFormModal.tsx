import React, { useState, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { Patient, PatientInsert, PatientUpdate } from '@/hooks/usePatients';

interface PatientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (patient: PatientInsert | PatientUpdate) => Promise<any>;
  patient?: Patient | null;
}

const PatientFormModal: React.FC<PatientFormModalProps> = ({ isOpen, onClose, onSave, patient }) => {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    cpf: '',
    birth_date: '',
    address: '',
    emergency_contact: '',
    emergency_phone: '',
    notes: '',
    status: 'ativo',
    payment_status: 'Em dia',
    session_value: '',
  });

  useEffect(() => {
    if (patient) {
      setFormData({
        name: patient.name || '',
        email: patient.email || '',
        phone: patient.phone || '',
        cpf: patient.cpf || '',
        birth_date: patient.birth_date || '',
        address: patient.address || '',
        emergency_contact: patient.emergency_contact || '',
        emergency_phone: patient.emergency_phone || '',
        notes: patient.notes || '',
        status: patient.status || 'ativo',
        payment_status: patient.payment_status || 'Em dia',
        session_value: patient.session_value?.toString() || '',
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        cpf: '',
        birth_date: '',
        address: '',
        emergency_contact: '',
        emergency_phone: '',
        notes: '',
        status: 'ativo',
        payment_status: 'Em dia',
        session_value: '',
      });
    }
  }, [patient, isOpen]);

  const handleSubmit = async () => {
    if (!formData.name.trim()) return;

    setSaving(true);
    const patientData = {
      name: formData.name,
      email: formData.email || null,
      phone: formData.phone || null,
      cpf: formData.cpf || null,
      birth_date: formData.birth_date || null,
      address: formData.address || null,
      emergency_contact: formData.emergency_contact || null,
      emergency_phone: formData.emergency_phone || null,
      notes: formData.notes || null,
      status: formData.status,
      payment_status: formData.payment_status,
      session_value: formData.session_value ? parseFloat(formData.session_value) : null,
    };

    const result = await onSave(patientData);
    setSaving(false);
    if (result) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-foreground/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-[32px] w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl animate-fade-in">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h3 className="text-xl font-black text-foreground">
            {patient ? 'Editar Paciente' : 'Novo Paciente'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)] custom-scrollbar space-y-4">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase block mb-2">Nome *</label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-3 bg-muted rounded-xl border-none font-medium outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Nome completo"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase block mb-2">Telefone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className="w-full p-3 bg-muted rounded-xl border-none font-medium outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="(00) 00000-0000"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase block mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-3 bg-muted rounded-xl border-none font-medium outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="email@exemplo.com"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase block mb-2">CPF</label>
              <input
                type="text"
                value={formData.cpf}
                onChange={e => setFormData({ ...formData, cpf: e.target.value })}
                className="w-full p-3 bg-muted rounded-xl border-none font-medium outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="000.000.000-00"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase block mb-2">Data de Nascimento</label>
              <input
                type="date"
                value={formData.birth_date}
                onChange={e => setFormData({ ...formData, birth_date: e.target.value })}
                className="w-full p-3 bg-muted rounded-xl border-none font-medium outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase block mb-2">Valor da Sessão (R$)</label>
              <input
                type="number"
                value={formData.session_value}
                onChange={e => setFormData({ ...formData, session_value: e.target.value })}
                className="w-full p-3 bg-muted rounded-xl border-none font-medium outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="200"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase block mb-2">Endereço</label>
            <input
              type="text"
              value={formData.address}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
              className="w-full p-3 bg-muted rounded-xl border-none font-medium outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="Rua, número, bairro, cidade"
            />
          </div>

          {/* Emergency Contact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase block mb-2">Contato de Emergência</label>
              <input
                type="text"
                value={formData.emergency_contact}
                onChange={e => setFormData({ ...formData, emergency_contact: e.target.value })}
                className="w-full p-3 bg-muted rounded-xl border-none font-medium outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Nome do contato"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase block mb-2">Telefone Emergência</label>
              <input
                type="tel"
                value={formData.emergency_phone}
                onChange={e => setFormData({ ...formData, emergency_phone: e.target.value })}
                className="w-full p-3 bg-muted rounded-xl border-none font-medium outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="(00) 00000-0000"
              />
            </div>
          </div>

          {/* Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase block mb-2">Status</label>
              <select
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value })}
                className="w-full p-3 bg-muted rounded-xl border-none font-medium outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
                <option value="pendente">Pendente</option>
                <option value="lista de espera">Lista de Espera</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase block mb-2">Status Pagamento</label>
              <select
                value={formData.payment_status}
                onChange={e => setFormData({ ...formData, payment_status: e.target.value })}
                className="w-full p-3 bg-muted rounded-xl border-none font-medium outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="Em dia">Em dia</option>
                <option value="Pendente">Pendente</option>
                <option value="Atrasado">Atrasado</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase block mb-2">Observações</label>
            <textarea
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              className="w-full p-3 bg-muted rounded-xl border-none font-medium outline-none focus:ring-2 focus:ring-primary/20 min-h-[100px] resize-none"
              placeholder="Anotações sobre o paciente..."
            />
          </div>
        </div>

        <div className="p-6 border-t border-border">
          <button
            onClick={handleSubmit}
            disabled={saving || !formData.name.trim()}
            className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {saving ? 'Salvando...' : patient ? 'Salvar Alterações' : 'Cadastrar Paciente'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PatientFormModal;
