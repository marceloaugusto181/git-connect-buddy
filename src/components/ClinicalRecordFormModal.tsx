import React, { useState, useEffect } from 'react';
import { X, Smile, Meh, Frown, Calendar } from 'lucide-react';
import { ClinicalRecordInsert, ClinicalRecord } from '@/hooks/useClinicalRecords';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Appointment {
  id: string;
  date: string;
  time: string;
  status: string | null;
}

interface ClinicalRecordFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ClinicalRecordInsert) => void;
  patientId: string;
  record?: ClinicalRecord | null;
  availableAppointments?: Appointment[];
}

const ClinicalRecordFormModal: React.FC<ClinicalRecordFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  patientId,
  record,
  availableAppointments = [],
}) => {
  const [formData, setFormData] = useState({
    session_date: new Date().toISOString().split('T')[0],
    appointment_id: null as string | null,
    content: '',
    observations: '',
    goals: '',
    wellbeing_score: 5,
    sentiment: 'neutral',
  });

  useEffect(() => {
    if (record) {
      setFormData({
        session_date: record.session_date,
        appointment_id: record.appointment_id,
        content: record.content || '',
        observations: record.observations || '',
        goals: record.goals || '',
        wellbeing_score: record.wellbeing_score || 5,
        sentiment: record.sentiment || 'neutral',
      });
    } else {
      setFormData({
        session_date: new Date().toISOString().split('T')[0],
        appointment_id: null,
        content: '',
        observations: '',
        goals: '',
        wellbeing_score: 5,
        sentiment: 'neutral',
      });
    }
  }, [record, isOpen]);

  const handleAppointmentSelect = (appointmentId: string) => {
    if (appointmentId === '') {
      setFormData({ ...formData, appointment_id: null });
    } else {
      const appointment = availableAppointments.find(a => a.id === appointmentId);
      if (appointment) {
        setFormData({
          ...formData,
          appointment_id: appointmentId,
          session_date: appointment.date,
        });
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      patient_id: patientId,
      appointment_id: formData.appointment_id,
      session_date: formData.session_date,
      content: formData.content || null,
      observations: formData.observations || null,
      goals: formData.goals || null,
      wellbeing_score: formData.wellbeing_score,
      sentiment: formData.sentiment,
    });
    onClose();
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return <Smile className="w-6 h-6" />;
      case 'negative': return <Frown className="w-6 h-6" />;
      default: return <Meh className="w-6 h-6" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-foreground/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-[32px] w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl animate-fade-in">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h3 className="text-xl font-black text-foreground">
              {record ? 'Editar Registro' : 'Nova Evolução'}
            </h3>
            <p className="text-sm text-muted-foreground">Registre as informações da sessão</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-120px)] custom-scrollbar">
          {availableAppointments.length > 0 && !record && (
            <div>
              <label className="block text-sm font-bold text-foreground mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Vincular a Agendamento
              </label>
              <select
                value={formData.appointment_id || ''}
                onChange={e => handleAppointmentSelect(e.target.value)}
                className="w-full bg-muted border-0 rounded-xl px-4 py-3 text-foreground font-medium focus:ring-2 focus:ring-primary"
              >
                <option value="">Sem vínculo com agendamento</option>
                {availableAppointments.map(apt => (
                  <option key={apt.id} value={apt.id}>
                    {format(new Date(apt.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })} às {apt.time.slice(0, 5)}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground mt-1">
                Vincule este registro a uma consulta confirmada
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-foreground mb-2">Data da Sessão</label>
            <input
              type="date"
              value={formData.session_date}
              onChange={e => setFormData({ ...formData, session_date: e.target.value })}
              className="w-full bg-muted border-0 rounded-xl px-4 py-3 text-foreground font-medium focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-foreground mb-2">Escala de Bem-estar (1-10)</label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="1"
                max="10"
                value={formData.wellbeing_score}
                onChange={e => setFormData({ ...formData, wellbeing_score: parseInt(e.target.value) })}
                className="flex-1 accent-primary"
              />
              <span className={`text-2xl font-black ${formData.wellbeing_score >= 7 ? 'text-emerald' : formData.wellbeing_score >= 4 ? 'text-amber' : 'text-destructive'}`}>
                {formData.wellbeing_score}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-foreground mb-2">Sentimento Geral</label>
            <div className="flex gap-3">
              {[
                { value: 'positive', label: 'Positivo', icon: Smile, color: 'emerald' },
                { value: 'neutral', label: 'Neutro', icon: Meh, color: 'amber' },
                { value: 'negative', label: 'Negativo', icon: Frown, color: 'destructive' },
              ].map(option => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, sentiment: option.value })}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition ${
                    formData.sentiment === option.value
                      ? option.value === 'positive'
                        ? 'bg-emerald/20 text-emerald border-2 border-emerald'
                        : option.value === 'neutral'
                        ? 'bg-amber/20 text-amber border-2 border-amber'
                        : 'bg-destructive/20 text-destructive border-2 border-destructive'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  <option.icon className="w-5 h-5" />
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-foreground mb-2">Conteúdo da Sessão</label>
            <textarea
              value={formData.content}
              onChange={e => setFormData({ ...formData, content: e.target.value })}
              placeholder="Descreva o que foi trabalhado na sessão..."
              rows={4}
              className="w-full bg-muted border-0 rounded-xl px-4 py-3 text-foreground font-medium focus:ring-2 focus:ring-primary resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-foreground mb-2">Observações Clínicas</label>
            <textarea
              value={formData.observations}
              onChange={e => setFormData({ ...formData, observations: e.target.value })}
              placeholder="Observações relevantes sobre o comportamento, humor, insights..."
              rows={3}
              className="w-full bg-muted border-0 rounded-xl px-4 py-3 text-foreground font-medium focus:ring-2 focus:ring-primary resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-foreground mb-2">Metas e Próximos Passos</label>
            <textarea
              value={formData.goals}
              onChange={e => setFormData({ ...formData, goals: e.target.value })}
              placeholder="Metas acordadas e ações para próximas sessões..."
              rows={2}
              className="w-full bg-muted border-0 rounded-xl px-4 py-3 text-foreground font-medium focus:ring-2 focus:ring-primary resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl font-bold text-muted-foreground bg-muted hover:bg-muted/80 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-xl font-bold text-primary-foreground bg-primary hover:bg-primary/90 transition"
            >
              {record ? 'Atualizar' : 'Salvar Registro'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClinicalRecordFormModal;
