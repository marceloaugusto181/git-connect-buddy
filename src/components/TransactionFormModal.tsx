import React, { useState } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { usePatients } from '@/hooks/usePatients';
import { TransactionInsert } from '@/hooks/useTransactions';

interface TransactionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaction: TransactionInsert) => Promise<void>;
}

const categories = {
  income: ['Sessão', 'Consulta', 'Avaliação', 'Grupo', 'Outro'],
  expense: ['Aluguel', 'Material', 'Software', 'Supervisão', 'Marketing', 'Impostos', 'Outro'],
};

const TransactionFormModal: React.FC<TransactionFormModalProps> = ({ isOpen, onClose, onSave }) => {
  const { patients } = usePatients();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<TransactionInsert>({
    description: '',
    category: 'Sessão',
    amount: 0,
    type: 'income',
    status: 'confirmado',
    date: new Date().toISOString().split('T')[0],
    patient_id: null,
  });

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!formData.description || !formData.amount || !formData.date) return;
    
    setIsSaving(true);
    try {
      await onSave(formData);
      onClose();
      setFormData({
        description: '',
        category: 'Sessão',
        amount: 0,
        type: 'income',
        status: 'confirmado',
        date: new Date().toISOString().split('T')[0],
        patient_id: null,
      });
    } catch (error) {
      console.error('Erro ao salvar transação:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTypeChange = (type: 'income' | 'expense') => {
    setFormData(prev => ({
      ...prev,
      type,
      category: categories[type][0],
      patient_id: type === 'expense' ? null : prev.patient_id,
    }));
  };

  return (
    <div className="fixed inset-0 bg-foreground/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-card rounded-[32px] p-8 w-full max-w-md shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-black text-foreground">Nova Transação</h3>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Type Selection */}
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase">Tipo</label>
            <div className="grid grid-cols-2 gap-3 mt-1">
              <button
                type="button"
                onClick={() => handleTypeChange('income')}
                className={`p-3 rounded-xl font-bold text-sm transition ${
                  formData.type === 'income'
                    ? 'bg-emerald text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                Receita
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('expense')}
                className={`p-3 rounded-xl font-bold text-sm transition ${
                  formData.type === 'expense'
                    ? 'bg-destructive text-destructive-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                Despesa
              </button>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase">Descrição</label>
            <input
              type="text"
              value={formData.description}
              onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Ex: Sessão de terapia"
              className="w-full mt-1 p-3 bg-muted rounded-xl border-none font-medium"
            />
          </div>

          {/* Category */}
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase">Categoria</label>
            <select
              value={formData.category}
              onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="w-full mt-1 p-3 bg-muted rounded-xl border-none font-medium"
            >
              {categories[formData.type].map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Patient (only for income) */}
          {formData.type === 'income' && (
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase">Paciente (opcional)</label>
              <select
                value={formData.patient_id || ''}
                onChange={e => setFormData(prev => ({ ...prev, patient_id: e.target.value || null }))}
                className="w-full mt-1 p-3 bg-muted rounded-xl border-none font-medium"
              >
                <option value="">Selecione...</option>
                {patients.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Amount and Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase">Valor (R$)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.amount || ''}
                onChange={e => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                placeholder="0,00"
                className="w-full mt-1 p-3 bg-muted rounded-xl border-none font-medium"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase">Data</label>
              <input
                type="date"
                value={formData.date}
                onChange={e => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className="w-full mt-1 p-3 bg-muted rounded-xl border-none font-medium"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase">Status</label>
            <div className="grid grid-cols-2 gap-3 mt-1">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, status: 'confirmado' }))}
                className={`p-3 rounded-xl font-bold text-sm transition ${
                  formData.status === 'confirmado'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                Confirmado
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, status: 'pendente' }))}
                className={`p-3 rounded-xl font-bold text-sm transition ${
                  formData.status === 'pendente'
                    ? 'bg-amber text-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                Pendente
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={isSaving || !formData.description || !formData.amount}
            className="w-full bg-foreground text-background py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-foreground/90 transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionFormModal;
