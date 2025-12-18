import React from 'react';
import { Target, Users, Zap, Plus, Clock, MessageSquare, Instagram, Search as SearchIcon, Phone } from 'lucide-react';
import { leadList } from '../utils/mockData';
import StatCard from '../components/StatCard';

const Leads: React.FC = () => {
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

  return (
    <div className="space-y-6 animate-flow pb-20">
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">Funil de Captação</h1>
          <p className="text-muted-foreground font-medium">Gerencie interessados e aumente conversão</p>
        </div>
        <button className="btn-primary-flow px-6 py-3 rounded-xl font-bold text-sm shadow-xl active:scale-95 flex items-center gap-2">
          <Plus className="w-5 h-5" /> Adicionar Lead
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard kpi={{ label: "Leads Totais", value: "48", icon: Target, change: "+12", trend: "up", color: "bg-primary text-primary-foreground" }} />
        <StatCard kpi={{ label: "Triagens Hoje", value: "02", icon: Users, change: "Meta: 05", trend: "neutral", color: "bg-emerald text-primary-foreground" }} />
        <StatCard kpi={{ label: "Tempo de Resposta", value: "14 min", icon: Clock, change: "-5 min", trend: "up", color: "bg-amber text-foreground" }} />
        <StatCard kpi={{ label: "Taxa de Conversão", value: "62%", icon: Zap, change: "+4%", trend: "up", color: "bg-purple text-primary-foreground" }} />
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {columns.map((column, idx) => (
          <div key={column} className="bg-card border border-border rounded-[24px] p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-foreground">{column}</h3>
              <span className="text-xs font-bold bg-muted text-muted-foreground px-2 py-1 rounded-lg">
                {leadList.filter(l => l.status === column || (column === 'Lead' && l.status === 'Lead')).length}
              </span>
            </div>
            <div className="space-y-3">
              {leadList.filter(l => l.status === column || (column === 'Lead' && l.status === 'Lead')).map(lead => (
                <div key={lead.id} className="bg-muted/50 p-4 rounded-2xl hover:bg-muted transition cursor-pointer group">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-bold text-foreground group-hover:text-primary transition">{lead.name}</h4>
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${getUrgencyColor(lead.urgency)}`}>
                      {lead.urgency === 'high' ? 'Urgente' : lead.urgency === 'medium' ? 'Médio' : 'Baixo'}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
                    <Phone className="w-3 h-3" /> {lead.phone}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      {getSourceIcon(lead.source)} {lead.source}
                    </span>
                    <button className="p-1.5 bg-primary/10 text-primary rounded-lg opacity-0 group-hover:opacity-100 transition">
                      <MessageSquare className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              {leadList.filter(l => l.status === column).length === 0 && idx > 0 && (
                <p className="text-center text-muted-foreground text-sm py-4">Nenhum lead</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Leads;
