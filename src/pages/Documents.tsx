import React, { useState } from 'react';
import { FileSignature, Plus, Search, FileText, Download, Wand2, Clock, CheckCircle2, Trash2, Edit, Loader2 } from 'lucide-react';
import { useDocuments, Document } from '@/hooks/useDocuments';
import DocumentFormModal from '@/components/DocumentFormModal';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { jsPDF } from 'jspdf';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const Documents: React.FC = () => {
  const { documents, isLoading, deleteDocument } = useDocuments();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [initialType, setInitialType] = useState<Document['type'] | undefined>();
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);

  const getStatusColor = (status: string) => {
    return status === 'Finalizado' ? 'bg-emerald/20 text-emerald' : 'bg-amber/20 text-amber';
  };

  const filteredDocuments = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleNewDocument = (type?: Document['type']) => {
    setSelectedDocument(null);
    setInitialType(type);
    setIsModalOpen(true);
  };

  const handleEditDocument = (doc: Document) => {
    setSelectedDocument(doc);
    setInitialType(undefined);
    setIsModalOpen(true);
  };

  const handleDownloadPdf = (doc: Document) => {
    const pdf = new jsPDF();
    
    pdf.setFontSize(16);
    pdf.text(doc.title, 20, 20);
    
    pdf.setFontSize(10);
    pdf.setTextColor(100);
    pdf.text(`Tipo: ${doc.type} | Status: ${doc.status}`, 20, 30);
    pdf.text(`Data: ${format(new Date(doc.updated_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`, 20, 36);
    
    pdf.setFontSize(12);
    pdf.setTextColor(0);
    
    if (doc.content) {
      const lines = pdf.splitTextToSize(doc.content, 170);
      pdf.text(lines, 20, 50);
    }
    
    pdf.save(`${doc.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
  };

  const handleDelete = async () => {
    if (documentToDelete) {
      await deleteDocument.mutateAsync(documentToDelete.id);
      setDocumentToDelete(null);
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd MMM yyyy", { locale: ptBR });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-flow pb-20">
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">Documentos Clínicos</h1>
          <p className="text-muted-foreground font-medium">Gere atestados, relatórios e contratos</p>
        </div>
        <button 
          onClick={() => handleNewDocument()}
          className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold text-sm shadow-xl hover:bg-primary/90 transition flex items-center gap-2 active:scale-95"
        >
          <Plus className="w-5 h-5" /> Criar Documento
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Area */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-card p-6 rounded-[32px] border border-border flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Buscar documento..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-muted rounded-2xl border-none font-medium text-sm outline-none" 
              />
            </div>
          </div>

          {/* Documents Grid */}
          {filteredDocuments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredDocuments.map(doc => (
                <div key={doc.id} className="bg-card border border-border rounded-[24px] p-5 hover:shadow-lg hover:border-primary/30 transition group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                      <FileText className="w-6 h-6" />
                    </div>
                    <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg ${getStatusColor(doc.status)}`}>
                      {doc.status}
                    </span>
                  </div>
                  <h3 className="font-bold text-foreground mb-1 group-hover:text-primary transition">{doc.title}</h3>
                  <p className="text-xs text-muted-foreground mb-2">{doc.type}</p>
                  {doc.patient && (
                    <p className="text-xs text-primary/80 mb-4">Paciente: {doc.patient.name}</p>
                  )}
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {formatDate(doc.updated_at)}
                    </span>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleEditDocument(doc)}
                        className="p-2 bg-muted rounded-lg hover:bg-primary/20 hover:text-primary transition"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDownloadPdf(doc)}
                        className="p-2 bg-muted rounded-lg hover:bg-primary/20 hover:text-primary transition"
                        title="Download PDF"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setDocumentToDelete(doc)}
                        className="p-2 bg-muted rounded-lg hover:bg-destructive/20 hover:text-destructive transition"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-card border border-border rounded-[24px] p-12 text-center">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground font-medium">
                {searchTerm ? 'Nenhum documento encontrado.' : 'Nenhum documento criado ainda.'}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Use o painel ao lado para criar seu primeiro documento.
              </p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-card border border-border rounded-[32px] p-6">
            <h3 className="font-black text-foreground mb-4 flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-primary" /> Criar Documento
            </h3>
            <p className="text-sm text-muted-foreground mb-4">Selecione um tipo para começar com um template pronto.</p>
            <div className="space-y-3">
              {(['Atestado', 'Relatório', 'Contrato', 'Encaminhamento'] as const).map(type => (
                <button 
                  key={type} 
                  onClick={() => handleNewDocument(type)}
                  className="w-full text-left p-3 bg-muted/50 rounded-xl hover:bg-primary/10 hover:text-primary transition font-medium text-sm flex items-center justify-between group"
                >
                  {type}
                  <FileSignature className="w-4 h-4 opacity-0 group-hover:opacity-100 transition" />
                </button>
              ))}
            </div>
          </div>

          <div className="bg-primary/10 border border-primary/20 rounded-[32px] p-6">
            <div className="flex items-center gap-3 mb-3">
              <CheckCircle2 className="w-6 h-6 text-primary" />
              <h3 className="font-black text-foreground">Conformidade</h3>
            </div>
            <p className="text-sm text-muted-foreground">Todos os templates seguem as diretrizes do CFP e normas LGPD.</p>
          </div>

          <div className="bg-card border border-border rounded-[32px] p-6">
            <h3 className="font-black text-foreground mb-2">Estatísticas</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total de documentos</span>
                <span className="font-bold">{documents.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Finalizados</span>
                <span className="font-bold text-emerald">{documents.filter(d => d.status === 'Finalizado').length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Rascunhos</span>
                <span className="font-bold text-amber">{documents.filter(d => d.status === 'Rascunho').length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <DocumentFormModal 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen}
        document={selectedDocument}
        initialType={initialType}
      />

      <AlertDialog open={!!documentToDelete} onOpenChange={(open) => !open && setDocumentToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir documento?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir "{documentToDelete?.title}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteDocument.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Documents;
