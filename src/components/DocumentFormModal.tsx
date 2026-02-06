import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileSignature, Wand2, Loader2, Save, CheckCircle } from 'lucide-react';
import { useDocuments, Document, DocumentInsert } from '@/hooks/useDocuments';
import { usePatients } from '@/hooks/usePatients';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DocumentFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document?: Document | null;
  initialType?: 'Atestado' | 'Relatório' | 'Contrato' | 'Encaminhamento';
}

const DOCUMENT_TEMPLATES: Record<string, string> = {
  Atestado: `ATESTADO PSICOLÓGICO

Atesto, para os devidos fins, que [NOME_PACIENTE] encontra-se em acompanhamento psicológico desde [DATA_INICIO].

O paciente apresenta quadro compatível com [DIAGNÓSTICO/CONDIÇÃO], sendo recomendado [RECOMENDAÇÕES].

[CIDADE], [DATA_ATUAL].

____________________________
[NOME_TERAPEUTA]
CRP: [CRP]`,

  Relatório: `RELATÓRIO PSICOLÓGICO

1. IDENTIFICAÇÃO
Nome: [NOME_PACIENTE]
Data de Nascimento: [DATA_NASCIMENTO]
Período de Atendimento: [DATA_INICIO] a [DATA_ATUAL]

2. DEMANDA
[Descrever a demanda inicial do paciente]

3. PROCEDIMENTOS UTILIZADOS
[Descrever técnicas e abordagens utilizadas]

4. ANÁLISE
[Análise do caso]

5. CONCLUSÃO
[Conclusões e encaminhamentos]

[CIDADE], [DATA_ATUAL].

____________________________
[NOME_TERAPEUTA]
CRP: [CRP]`,

  Contrato: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS PSICOLÓGICOS

Pelo presente instrumento particular, as partes:

CONTRATANTE: [NOME_PACIENTE], [DADOS_PACIENTE]

CONTRATADO(A): [NOME_TERAPEUTA], Psicólogo(a), inscrito(a) no CRP sob o nº [CRP]

Celebram o presente contrato de prestação de serviços psicológicos, mediante as seguintes cláusulas:

CLÁUSULA PRIMEIRA - DO OBJETO
O presente contrato tem por objeto a prestação de serviços de psicoterapia.

CLÁUSULA SEGUNDA - DOS HONORÁRIOS
O valor de cada sessão será de R$ [VALOR_SESSAO], com duração de 50 minutos.

CLÁUSULA TERCEIRA - DO SIGILO
O CONTRATADO compromete-se a manter sigilo absoluto sobre todas as informações.

[CIDADE], [DATA_ATUAL].

____________________________          ____________________________
CONTRATANTE                           CONTRATADO(A)`,

  Encaminhamento: `ENCAMINHAMENTO

Encaminho o(a) paciente [NOME_PACIENTE], em acompanhamento psicológico desde [DATA_INICIO], para avaliação e acompanhamento com [ESPECIALIDADE].

Motivo do encaminhamento: [MOTIVO]

Observações relevantes: [OBSERVAÇÕES]

Coloco-me à disposição para maiores esclarecimentos.

[CIDADE], [DATA_ATUAL].

____________________________
[NOME_TERAPEUTA]
CRP: [CRP]
Contato: [CONTATO]`,
};

const DocumentFormModal: React.FC<DocumentFormModalProps> = ({ 
  open, 
  onOpenChange, 
  document,
  initialType 
}) => {
  const { createDocument, updateDocument } = useDocuments();
  const { patients } = usePatients();
  
  const [formData, setFormData] = useState<DocumentInsert>({
    title: '',
    type: initialType || 'Atestado',
    category: 'Clínico',
    content: '',
    patient_id: null,
    status: 'Rascunho',
  });

  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (document) {
      setFormData({
        title: document.title,
        type: document.type,
        category: document.category,
        content: document.content || '',
        patient_id: document.patient_id,
        status: document.status,
      });
    } else if (initialType) {
      setFormData(prev => ({
        ...prev,
        type: initialType,
        title: `${initialType} - ${format(new Date(), "dd/MM/yyyy")}`,
        content: DOCUMENT_TEMPLATES[initialType] || '',
      }));
    } else {
      setFormData({
        title: '',
        type: 'Atestado',
        category: 'Clínico',
        content: '',
        patient_id: null,
        status: 'Rascunho',
      });
    }
  }, [document, initialType, open]);

  const handleTypeChange = (type: DocumentInsert['type']) => {
    setFormData(prev => ({
      ...prev,
      type,
      title: `${type} - ${format(new Date(), "dd/MM/yyyy")}`,
      content: DOCUMENT_TEMPLATES[type] || prev.content,
    }));
  };

  const handleGenerateTemplate = () => {
    setIsGenerating(true);
    
    // Simulate AI generation with template
    setTimeout(() => {
      const selectedPatient = patients.find(p => p.id === formData.patient_id);
      let content = DOCUMENT_TEMPLATES[formData.type] || '';
      
      // Replace placeholders
      content = content.replace(/\[NOME_PACIENTE\]/g, selectedPatient?.name || '[Nome do Paciente]');
      content = content.replace(/\[DATA_ATUAL\]/g, format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR }));
      content = content.replace(/\[CIDADE\]/g, 'São Paulo');
      content = content.replace(/\[DATA_INICIO\]/g, selectedPatient ? format(new Date(selectedPatient.created_at), "dd/MM/yyyy") : '[Data]');
      
      setFormData(prev => ({ ...prev, content }));
      setIsGenerating(false);
    }, 1000);
  };

  const handleSubmit = async (status: 'Rascunho' | 'Finalizado') => {
    try {
      const dataToSave = { ...formData, status };
      
      if (document) {
        await updateDocument.mutateAsync({ id: document.id, ...dataToSave });
      } else {
        await createDocument.mutateAsync(dataToSave);
      }
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving document:', error);
    }
  };

  const isLoading = createDocument.isPending || updateDocument.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSignature className="w-5 h-5 text-primary" />
            {document ? 'Editar Documento' : 'Novo Documento'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo de Documento</Label>
              <Select
                value={formData.type}
                onValueChange={(value: any) => handleTypeChange(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Atestado">Atestado</SelectItem>
                  <SelectItem value="Relatório">Relatório</SelectItem>
                  <SelectItem value="Contrato">Contrato</SelectItem>
                  <SelectItem value="Encaminhamento">Encaminhamento</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Paciente (opcional)</Label>
              <Select
                value={formData.patient_id || 'none'}
                onValueChange={(value) => setFormData(prev => ({ 
                  ...prev, 
                  patient_id: value === 'none' ? null : value 
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um paciente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum paciente</SelectItem>
                  {patients.map(patient => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Título do documento"
              required
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="content">Conteúdo</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleGenerateTemplate}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Wand2 className="w-4 h-4 mr-2" />
                )}
                Gerar Template
              </Button>
            </div>
            <Textarea
              id="content"
              value={formData.content || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Conteúdo do documento..."
              className="min-h-[300px] font-mono text-sm"
            />
          </div>
          
          <div className="flex gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => handleSubmit('Rascunho')}
              disabled={isLoading || !formData.title}
              className="flex-1"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Salvar Rascunho
            </Button>
            <Button
              type="button"
              onClick={() => handleSubmit('Finalizado')}
              disabled={isLoading || !formData.title || !formData.content}
              className="flex-1"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4 mr-2" />
              )}
              Finalizar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentFormModal;
