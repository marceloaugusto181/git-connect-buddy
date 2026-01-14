import React, { useState } from 'react';
import { Target, Users, Zap, Plus, Clock, MessageSquare, Instagram, Search as SearchIcon, Phone, Trash2, ChevronRight, Mail } from 'lucide-react';
import { useLeads, LeadInsert } from '@/hooks/useLeads';
import LeadFormModal from '@/components/LeadFormModal';
import StatCard from '../components/StatCard';
import { format, differenceInMinutes } from 'date-fns';

const Leads: React.FC = () => {
  const { leads, isLoading, createLead, moveLeadToStatus, deleteLead } = useLeads();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const columns = ['Lead', 'Triagem', 'Aguardando 1ª', 'Convertido'];

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-destructive/20 text-destructive';
      case 'medium': return 'bg-amber/20 text-amber';
      default: return 'bg-primary/20 text-primary';
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'Instagram': return <Instagram className="w-4 h-4" />;
      case 'Google': return <SearchIcon className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  const handleCreateLead = (lead: LeadInsert) => {
    createLead.mutate(lead);
  };

  const handleMoveToNextStatus = (id: string, currentStatus: string) => {
    const currentIndex = columns.indexOf(currentStatus);
    if (currentIndex < columns.length - 1) {
      moveLeadToStatus.mutate({ id, status: columns[currentIndex + 1] });
    }
  };

  const handleDeleteLead = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este lead?')) {
      deleteLead.mutate(id);
    }
  };

  // Calculate stats
  const totalLeads = leads.length;
  const triagensHoje = leads.filter(l => {
    const today = new Date().toDateString();
    return l.status === 'Triagem' && new Date(l.updated_at).toDateString() === today;
  }).length;
  
  const avgResponseTime = leads.length > 0 
    ? Math.round(leads.reduce((acc, lead) => {
        return acc + differenceInMinutes(new Date(lead.updated_at), new Date(lead.created_at));
      }, 0) / leads.length)
    : 0;
  
  const convertedCount = leads.filter(l => l.status === 'Convertido').length;
  const conversionRate = totalLeads > 0 ? Math.round((convertedCount / totalLeads) * 100) : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-flow pb-20">
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">Funil de Captação</h1>
          <p className="text-muted-foreground font-medium">Gerencie interessados e aumente conversão</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-primary-flow px-6 py-3 rounded-xl font-bold text-sm shadow-xl active:scale-95 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> Adicionar Lead
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard kpi={{ label: "Leads Totais", value: totalLeads.toString(), icon: Target, change: `+${leads.filter(l => new Date(l.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length} esta semana`, trend: "up", color: "bg-primary text-primary-foreground" }} />
        <StatCard kpi={{ label: "Triagens Hoje", value: triagensHoje.toString().padStart(2, '0'), icon: Users, change: "Meta: 05", trend: "neutral", color: "bg-emerald text-primary-foreground" }} />
        <StatCard kpi={{ label: "Tempo de Resposta", value: `${avgResponseTime} min`, icon: Clock, trend: "up", color: "bg-amber text-foreground" }} />
        <StatCard kpi={{ label: "Taxa de Conversão", value: `${conversionRate}%`, icon: Zap, trend: conversionRate >= 50 ? "up" : "down", color: "bg-purple text-primary-foreground" }} />
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {columns.map((column, idx) => {
          const columnLeads = leads.filter(l => l.status === column);
          
          return (
            <div key={column} className="bg-card border border-border rounded-[24px] p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-black text-foreground">{column}</h3>
                <span className="text-xs font-bold bg-muted text-muted-foreground px-2 py-1 rounded-lg">
                  {columnLeads.length}
                </span>
              </div>
              <div className="space-y-3">
                {columnLeads.map(lead => (
                  <div key={lead.id} className="bg-muted/50 p-4 rounded-2xl hover:bg-muted transition cursor-pointer group">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-bold text-foreground group-hover:text-primary transition">{lead.name}</h4>
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${getUrgencyColor(lead.urgency)}`}>
                        {lead.urgency === 'high' ? 'Urgente' : lead.urgency === 'medium' ? 'Médio' : 'Baixo'}
                      </span>
                    </div>
                    {lead.phone && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                        <Phone className="w-3 h-3" /> {lead.phone}
                      </p>
                    )}
                    {lead.email && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
                        <Mail className="w-3 h-3" /> {lead.email}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        {getSourceIcon(lead.source)} {lead.source}
                      </span>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                        {idx < columns.length - 1 && (
                          <button 
                            onClick={() => handleMoveToNextStatus(lead.id, lead.status)}
                            className="p-1.5 bg-primary/10 text-primary rounded-lg hover:bg-primary/20"
                            title="Mover para próxima etapa"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        )}
                        <button 
                          onClick={() => handleDeleteLead(lead.id)}
                          className="p-1.5 bg-destructive/10 text-destructive rounded-lg hover:bg-destructive/20"
                          title="Excluir lead"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {columnLeads.length === 0 && (
                  <p className="text-center text-muted-foreground text-sm py-4">Nenhum lead</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <LeadFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateLead}
      />
    </div>
  );
};

export default Leads;
