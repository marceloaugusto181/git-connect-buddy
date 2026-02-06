import React, { useState } from 'react';
import { Upload, FileText, Trash2, Plus, Cloud, Search, HardDrive, Eye, Download, FileVideo, FileAudio, Link as LinkIcon, Clock, Zap, Loader2 } from 'lucide-react';
import { useResources, Resource } from '@/hooks/useResources';
import StatCard from '../components/StatCard';
import ResourceFormModal from '@/components/ResourceFormModal';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
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

const Resources: React.FC = () => {
  const { resources, isLoading, deleteResource, incrementSharedCount } = useResources();
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [resourceToDelete, setResourceToDelete] = useState<Resource | null>(null);

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

  const getIconColor = (type: Resource['type']) => {
    switch (type) {
      case 'PDF': return 'bg-destructive/10 text-destructive';
      case 'Vídeo': return 'bg-purple/10 text-purple';
      case 'Áudio': return 'bg-amber/10 text-amber';
      case 'Drive': return 'bg-primary/10 text-primary';
      case 'Link': return 'bg-emerald/10 text-emerald';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const filteredResources = resources.filter(r => {
    const matchesCategory = activeCategory === 'Todos' || r.category === activeCategory;
    const matchesSearch = r.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const totalShared = resources.reduce((acc, r) => acc + (r.shared_count || 0), 0);
  const autoSendCount = resources.filter(r => r.auto_send).length;

  const handleView = (resource: Resource) => {
    const url = resource.file_url || resource.cloud_url;
    if (url) {
      window.open(url, '_blank');
      incrementSharedCount.mutate(resource.id);
    }
  };

  const handleDownload = async (resource: Resource) => {
    if (resource.file_url) {
      const link = document.createElement('a');
      link.href = resource.file_url;
      link.download = resource.title;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      incrementSharedCount.mutate(resource.id);
    } else if (resource.cloud_url) {
      window.open(resource.cloud_url, '_blank');
    }
  };

  const handleDelete = async () => {
    if (resourceToDelete) {
      await deleteResource.mutateAsync(resourceToDelete);
      setResourceToDelete(null);
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
          <h1 className="text-3xl font-black text-foreground tracking-tight">Biblioteca de Arquivos</h1>
          <p className="text-muted-foreground font-medium">Materiais educativos e documentos para pacientes</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold text-sm shadow-xl hover:bg-primary/90 transition flex items-center gap-2 active:scale-95"
        >
          <Upload className="w-5 h-5" /> Upload
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard kpi={{ label: "Total Arquivos", value: resources.length.toString(), icon: FileText, change: "ativos", trend: "neutral", color: "bg-primary text-primary-foreground" }} />
        <StatCard kpi={{ label: "Compartilhados", value: totalShared.toString(), icon: Cloud, change: "vezes", trend: "up", color: "bg-emerald text-primary-foreground" }} />
        <StatCard kpi={{ label: "Auto-Envio", value: autoSendCount.toString(), icon: Zap, change: "configurados", trend: "neutral", color: "bg-amber text-foreground" }} />
        <StatCard kpi={{ label: "Armazenamento", value: `${resources.length} itens`, icon: HardDrive, change: "na biblioteca", trend: "neutral", color: "bg-purple text-primary-foreground" }} />
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          {categories.map(cat => (
            <button 
              key={cat} 
              onClick={() => setActiveCategory(cat)} 
              className={`px-4 py-2 rounded-xl font-bold text-sm transition ${activeCategory === cat ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-muted-foreground hover:text-foreground'}`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="flex items-center bg-card border border-border rounded-xl px-4 py-2">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Buscar arquivo..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none outline-none ml-2 font-medium text-sm w-40" 
          />
        </div>
      </div>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredResources.map(resource => (
          <div key={resource.id} className="bg-card border border-border rounded-[24px] p-5 hover:shadow-lg hover:border-primary/30 transition group">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${getIconColor(resource.type)}`}>
                {getIcon(resource.type)}
              </div>
              {resource.auto_send && (
                <span className="text-[9px] font-black uppercase px-2 py-1 rounded-lg bg-emerald/20 text-emerald flex items-center gap-1">
                  <Zap className="w-3 h-3" /> Auto
                </span>
              )}
            </div>

            <h3 className="font-bold text-foreground mb-1 group-hover:text-primary transition">{resource.title}</h3>
            <p className="text-xs text-muted-foreground mb-3">
              {resource.category} {resource.file_size && `• ${resource.file_size}`}
            </p>

            {resource.auto_send && resource.trigger_event && (
              <p className="text-xs text-primary bg-primary/10 px-2 py-1 rounded-lg mb-3 inline-block">
                Gatilho: {resource.trigger_event}
              </p>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-border">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                {formatDate(resource.created_at)}
              </div>
              <div className="flex gap-1">
                <button 
                  onClick={() => handleView(resource)}
                  className="p-2 bg-muted rounded-lg hover:bg-primary/20 hover:text-primary transition"
                  title="Visualizar"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDownload(resource)}
                  className="p-2 bg-muted rounded-lg hover:bg-primary/20 hover:text-primary transition"
                  title="Download"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setResourceToDelete(resource)}
                  className="p-2 bg-muted rounded-lg hover:bg-destructive/20 hover:text-destructive transition"
                  title="Excluir"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <p className="text-xs text-muted-foreground mt-2">Compartilhado {resource.shared_count || 0}x</p>
          </div>
        ))}

        {/* Add New Card */}
        <div 
          onClick={() => setIsModalOpen(true)}
          className="bg-muted/30 border-2 border-dashed border-border rounded-[24px] p-5 flex flex-col items-center justify-center min-h-[250px] hover:border-primary/50 hover:bg-primary/5 transition cursor-pointer group"
        >
          <div className="w-12 h-12 bg-muted rounded-2xl flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition mb-3">
            <Plus className="w-6 h-6" />
          </div>
          <p className="font-bold text-muted-foreground group-hover:text-primary transition">Adicionar Arquivo</p>
          <p className="text-xs text-muted-foreground mt-1">PDF, Vídeo, Áudio ou Link</p>
        </div>
      </div>

      {filteredResources.length === 0 && resources.length > 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Nenhum arquivo encontrado com os filtros selecionados.</p>
        </div>
      )}

      {resources.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Você ainda não tem arquivos na biblioteca.</p>
          <p className="text-sm text-muted-foreground">Clique em "Upload" para adicionar seu primeiro arquivo.</p>
        </div>
      )}

      <ResourceFormModal open={isModalOpen} onOpenChange={setIsModalOpen} />

      <AlertDialog open={!!resourceToDelete} onOpenChange={(open) => !open && setResourceToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir arquivo?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir "{resourceToDelete?.title}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteResource.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Resources;
