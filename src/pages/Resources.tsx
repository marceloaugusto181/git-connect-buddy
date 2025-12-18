import React, { useState } from 'react';
import { Upload, FileText, Trash2, Plus, Cloud, Search, HardDrive, Eye, Download, FileVideo, FileAudio, Link as LinkIcon, Clock, Zap } from 'lucide-react';
import { Resource } from '../types';
import StatCard from '../components/StatCard';

const Resources: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeCategory, setActiveCategory] = useState('Todos');

  const [resources] = useState<(Resource & { sharedCount: number, date: string })[]>([
    { id: '1', title: 'Guia de Respiração Diafragmática', type: 'PDF', size: '1.2 MB', autoSend: true, trigger: 'Pós 1ª Sessão', category: 'Exercício', sharedCount: 45, date: '12 Mai 2024' },
    { id: '2', title: 'Vídeo: Ciclo da Ansiedade', type: 'Vídeo', autoSend: true, trigger: 'No Cadastro', category: 'Educativo', sharedCount: 128, date: '10 Mai 2024' },
    { id: '3', title: 'Contrato Terapêutico 2024', type: 'Drive', cloudUrl: '#', autoSend: false, category: 'Administrativo', sharedCount: 12, date: '01 Mai 2024' },
    { id: '4', title: 'Diário de Emoções (TCC)', type: 'PDF', size: '850 KB', autoSend: true, trigger: 'Semanal', category: 'Exercício', sharedCount: 89, date: '28 Abr 2024' },
  ]);

  const categories = ['Todos', 'Exercício', 'Educativo', 'Administrativo'];

  const getIcon = (type: Resource['type']) => {
    switch (type) {
      case 'PDF': return <FileText className="w-6 h-6" />;
      case 'Vídeo': return <FileVideo className="w-6 h-6" />;
      case 'Áudio': return <FileAudio className="w-6 h-6" />;
      case 'Drive': return <HardDrive className="w-6 h-6" />;
      case 'Link': return <LinkIcon className="w-6 h-6" />;
      default: return <FileText className="w-6 h-6" />;
    }
  };

  const filteredResources = resources.filter(r => activeCategory === 'Todos' || r.category === activeCategory);

  return (
    <div className="space-y-6 animate-flow pb-20">
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">Biblioteca de Arquivos</h1>
          <p className="text-muted-foreground font-medium">Materiais educativos e documentos para pacientes</p>
        </div>
        <button className="btn-primary-flow px-6 py-3 rounded-xl font-bold text-sm shadow-xl active:scale-95 flex items-center gap-2">
          <Upload className="w-5 h-5" /> Upload
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard kpi={{ label: "Total Arquivos", value: resources.length.toString(), icon: FileText, change: "ativos", trend: "neutral", color: "bg-primary text-primary-foreground" }} />
        <StatCard kpi={{ label: "Compartilhados", value: resources.reduce((acc, r) => acc + r.sharedCount, 0).toString(), icon: Cloud, change: "vezes", trend: "up", color: "bg-emerald text-primary-foreground" }} />
        <StatCard kpi={{ label: "Auto-Envio", value: resources.filter(r => r.autoSend).length.toString(), icon: Zap, change: "configurados", trend: "neutral", color: "bg-amber text-foreground" }} />
        <StatCard kpi={{ label: "Armazenamento", value: "2.4 GB", icon: HardDrive, change: "de 10 GB", trend: "neutral", color: "bg-purple text-primary-foreground" }} />
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          {categories.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-4 py-2 rounded-xl font-bold text-sm transition ${activeCategory === cat ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-muted-foreground hover:text-foreground'}`}>
              {cat}
            </button>
          ))}
        </div>
        <div className="flex items-center bg-card border border-border rounded-xl px-4 py-2">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="Buscar arquivo..." className="bg-transparent border-none outline-none ml-2 font-medium text-sm w-40" />
        </div>
      </div>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredResources.map(resource => (
          <div key={resource.id} className="bg-card border border-border rounded-[24px] p-5 hover:shadow-lg hover:border-primary/30 transition group">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                resource.type === 'PDF' ? 'bg-destructive/10 text-destructive' :
                resource.type === 'Vídeo' ? 'bg-purple/10 text-purple' :
                resource.type === 'Drive' ? 'bg-primary/10 text-primary' :
                'bg-muted text-muted-foreground'
              }`}>
                {getIcon(resource.type)}
              </div>
              {resource.autoSend && (
                <span className="text-[9px] font-black uppercase px-2 py-1 rounded-lg bg-emerald/20 text-emerald flex items-center gap-1">
                  <Zap className="w-3 h-3" /> Auto
                </span>
              )}
            </div>

            <h3 className="font-bold text-foreground mb-1 group-hover:text-primary transition">{resource.title}</h3>
            <p className="text-xs text-muted-foreground mb-3">{resource.category} {resource.size && `• ${resource.size}`}</p>

            {resource.autoSend && resource.trigger && (
              <p className="text-xs text-primary bg-primary/10 px-2 py-1 rounded-lg mb-3 inline-block">
                Gatilho: {resource.trigger}
              </p>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-border">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                {resource.date}
              </div>
              <div className="flex gap-1">
                <button className="p-2 bg-muted rounded-lg hover:bg-primary/20 hover:text-primary transition">
                  <Eye className="w-4 h-4" />
                </button>
                <button className="p-2 bg-muted rounded-lg hover:bg-primary/20 hover:text-primary transition">
                  <Download className="w-4 h-4" />
                </button>
                <button className="p-2 bg-muted rounded-lg hover:bg-destructive/20 hover:text-destructive transition">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <p className="text-xs text-muted-foreground mt-2">Compartilhado {resource.sharedCount}x</p>
          </div>
        ))}

        {/* Add New Card */}
        <div className="bg-muted/30 border-2 border-dashed border-border rounded-[24px] p-5 flex flex-col items-center justify-center min-h-[250px] hover:border-primary/50 hover:bg-primary/5 transition cursor-pointer group">
          <div className="w-12 h-12 bg-muted rounded-2xl flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition mb-3">
            <Plus className="w-6 h-6" />
          </div>
          <p className="font-bold text-muted-foreground group-hover:text-primary transition">Adicionar Arquivo</p>
          <p className="text-xs text-muted-foreground mt-1">PDF, Vídeo, Áudio ou Link</p>
        </div>
      </div>
    </div>
  );
};

export default Resources;
