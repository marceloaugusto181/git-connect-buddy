import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreditCard, Receipt, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { usePatients } from '@/hooks/usePatients';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose }) => {
  const { patients } = usePatients();
  const [paymentType, setPaymentType] = useState<'single' | 'subscription'>('single');
  const [selectedPatient, setSelectedPatient] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const selectedPatientData = patients.find(p => p.id === selectedPatient);

  const handleCreatePayment = async () => {
    if (!selectedPatient) {
      toast.error('Selecione um paciente');
      return;
    }

    if (paymentType === 'single' && !amount) {
      toast.error('Informe o valor da sessão');
      return;
    }

    setIsLoading(true);
    try {
      const functionName = paymentType === 'single' ? 'create-payment' : 'create-subscription';
      
      const payload = paymentType === 'single' 
        ? {
            patientName: selectedPatientData?.name,
            patientEmail: selectedPatientData?.email,
            amount: parseFloat(amount),
            description: description || `Sessão - ${selectedPatientData?.name}`,
          }
        : {
            patientName: selectedPatientData?.name,
            patientEmail: selectedPatientData?.email,
          };

      const { data, error } = await supabase.functions.invoke(functionName, {
        body: payload,
      });

      if (error) throw error;

      if (data?.url) {
        // Open Stripe checkout in a new tab
        window.open(data.url, '_blank');
        toast.success('Link de pagamento gerado! Enviando para o paciente...');
        onClose();
      }
    } catch (error: unknown) {
      console.error('Erro ao criar pagamento:', error);
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error(`Erro ao gerar link de pagamento: ${message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    if (!selectedPatientData?.email) {
      toast.error('Paciente não possui email cadastrado');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal', {
        body: { customerEmail: selectedPatientData.email },
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
        toast.success('Portal de gerenciamento aberto!');
      }
    } catch (error: unknown) {
      console.error('Erro ao abrir portal:', error);
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error(`Erro ao abrir portal: ${message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-black">Gerar Cobrança</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Payment Type Toggle */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-muted rounded-xl">
            <button
              onClick={() => setPaymentType('single')}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-bold text-sm transition ${
                paymentType === 'single'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Receipt className="w-4 h-4" />
              Avulso
            </button>
            <button
              onClick={() => setPaymentType('subscription')}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-bold text-sm transition ${
                paymentType === 'subscription'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              Assinatura
            </button>
          </div>

          {/* Patient Selection */}
          <div className="space-y-2">
            <Label>Paciente</Label>
            <Select value={selectedPatient} onValueChange={setSelectedPatient}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o paciente" />
              </SelectTrigger>
              <SelectContent>
                {patients.map(patient => (
                  <SelectItem key={patient.id} value={patient.id}>
                    {patient.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Amount (only for single payment) */}
          {paymentType === 'single' && (
            <>
              <div className="space-y-2">
                <Label>Valor (R$)</Label>
                <Input
                  type="number"
                  placeholder="150.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Descrição (opcional)</Label>
                <Input
                  placeholder="Sessão de terapia"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </>
          )}

          {/* Subscription Info */}
          {paymentType === 'subscription' && (
            <div className="bg-muted/50 rounded-xl p-4">
              <p className="text-sm font-medium text-foreground mb-1">Plano Mensal</p>
              <p className="text-2xl font-black text-primary">R$ 600,00/mês</p>
              <p className="text-xs text-muted-foreground mt-1">4 sessões inclusas no plano</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              onClick={handleCreatePayment}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  Gerar Link de Pagamento
                </>
              )}
            </Button>
          </div>

          {/* Manage Subscription Button */}
          {selectedPatient && selectedPatientData?.email && (
            <Button
              variant="outline"
              onClick={handleManageSubscription}
              disabled={isLoading}
              className="w-full"
            >
              Gerenciar Assinatura Existente
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;
