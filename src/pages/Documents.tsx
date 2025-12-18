import React from 'react';
import { FileSignature, Plus, Search, FileText, Download, Wand2, Clock, CheckCircle2 } from 'lucide-react';
import { documentTemplates } from '../utils/mockData';

const Documents: React.FC = () => {
  const getStatusColor = (status: string) => {
    return status === 'Finalizado' ? 'bg-emerald/20 text-emerald' : 'bg-amber/20 text-amber';
  };

  return (
    <div className="space-y-6 animate-flow pb-20">
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">Documentos Clínicos</h1>
          <p className="text-muted-foreground font-medium">Gere atestados, relatórios e contratos com IA</p>
        </div>
        <button className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold text-sm shadow-xl hover:bg-primary/90 transition flex items-center gap-2 active:scale-95">
          <Plus className="w-5 h-5" /> Criar Documento
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Area */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-card p-6 rounded-[32px] border border-border flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input type="text" placeholder="Buscar template ou documento..." className="w-full pl-12 pr-4 py-3 bg-muted rounded-2xl border-none font-medium text-sm outline-none" />
            </div>
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {documentTemplates.map(doc => (
              <div key={doc.id} className="bg-card border border-border rounded-[24px] p-5 hover:shadow-lg hover:border-primary/30 transition group cursor-pointer">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                    <FileText className="w-6 h-6" />
                  </div>
                  <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg ${getStatusColor(doc.status)}`}>{doc.status}</span>
                </div>
                <h3 className="font-bold text-foreground mb-1 group-hover:text-primary transition">{doc.title}</h3>
                <p className="text-xs text-muted-foreground mb-4">{doc.category}</p>
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {doc.lastGenerated}
                  </span>
                  <div className="flex gap-2">
                    <button className="p-2 bg-muted rounded-lg hover:bg-primary/20 hover:text-primary transition">
                      <Download className="w-4 h-4" />
                    </button>
                    <button className="p-2 bg-primary/10 text-primary rounded-lg hover:bg-primary hover:text-primary-foreground transition">
                      <Wand2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-card border border-border rounded-[32px] p-6">
            <h3 className="font-black text-foreground mb-4 flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-primary" /> Gerador com IA
            </h3>
            <p className="text-sm text-muted-foreground mb-4">Crie documentos automaticamente com base nos dados do paciente.</p>
            <div className="space-y-3">
              {['Atestado', 'Relatório', 'Contrato', 'Encaminhamento'].map(type => (
                <button key={type} className="w-full text-left p-3 bg-muted/50 rounded-xl hover:bg-primary/10 hover:text-primary transition font-medium text-sm flex items-center justify-between group">
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
            <p className="text-sm text-muted-foreground">Todos os documentos seguem as diretrizes do CFP e normas LGPD.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Documents;
