import React, { useState, useEffect } from 'react';
import { Users, Calendar, Sparkles, PenLine, Zap, BrainCircuit, ArrowRight, Lightbulb, TrendingUp, DollarSign, X, Video, MessageCircle, Clock } from 'lucide-react';
import StatCard from '../components/StatCard';
import { Page, AISuggestion } from '../types';
import { getDashboardInsights, getProactiveSuggestions } from '../services/geminiService';

interface OverviewProps {
  onNavigate: (page: Page) => void;
}

const Overview: React.FC<OverviewProps> = ({ onNavigate }) => {
  const [aiInsights, setAiInsights] = useState<string>("Analisando sua clínica...");
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [isLoadingAi, setIsLoadingAi] = useState(true);
  const [isAiOpen, setIsAiOpen] = useState(false);

  useEffect(() => {
    const fetchAiData = async () => {
      setIsLoadingAi(true);
      const dashboardContext = "24 pacientes ativos, 86 sessões no mês, faturamento R$ 12.450, 5 sessões hoje.";
      const [insights, proactive] = await Promise.all([
        getDashboardInsights(dashboardContext),
        getProactiveSuggestions(dashboardContext)
      ]);
      setAiInsights(insights);
      setSuggestions(proactive);
      setIsLoadingAi(false);
    };
    fetchAiData();
  }, []);

  const appointments = [
    { id: 1, name: "Ana Silva", time: "14:00", type: "Online", status: "Confirmado" },
    { id: 2, name: "Carlos Ferreira", time: "15:30", type: "Presencial", status: "Confirmado" },
    { id: 3, name: "Beatriz Costa", time: "17:00", type: "Online", status: "Pendente" }
  ];

  return (
    <div className="space-y-8 pb-12 animate-flow relative">
      {/* AI Assistant Panel */}
      <div className="fixed bottom-10 right-10 z-50">
        {isAiOpen ? (
          <div className="w-96 bg-card rounded-[32px] shadow-2xl border border-border overflow-hidden animate-fade-in">
            <div className="bg-foreground p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BrainCircuit className="w-6 h-6 text-primary" />
                <span className="font-bold text-background">Assistente IA</span>
              </div>
              <button onClick={() => setIsAiOpen(false)} className="text-background/60 hover:text-background">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {isLoadingAi ? <span className="status-pulse">Analisando dados...</span> : aiInsights}
              </p>
              <button onClick={() => onNavigate('automations')} className="w-full flex items-center justify-center gap-3 py-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl font-bold text-xs uppercase tracking-widest transition-all active:scale-95">
                Configurar Automações <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <button onClick={() => setIsAiOpen(true)} className="w-16 h-16 bg-foreground text-background rounded-[22px] shadow-xl flex items-center justify-center hover:bg-primary hover:scale-110 transition-all duration-300 relative">
            <BrainCircuit className="w-8 h-8" />
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-destructive rounded-full flex items-center justify-center text-[10px] font-bold text-destructive-foreground border-2 border-background animate-bounce">2</div>
          </button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard kpi={{ label: "Ativos", value: "24", icon: Users, change: "+12%", trend: "up", color: "bg-primary text-primary-foreground", description: "Pacientes em acompanhamento" }} />
        <StatCard kpi={{ label: "Sessões/Mês", value: "86", icon: Calendar, change: "+5%", trend: "up", color: "bg-primary/80 text-primary-foreground", description: "Total de sessões no mês" }} />
        <StatCard kpi={{ label: "Pendências", value: "03", icon: Clock, change: "-2", trend: "up", color: "bg-amber text-foreground", description: "Pagamentos pendentes" }} />
        <StatCard kpi={{ label: "Retenção", value: "94%", icon: TrendingUp, change: "+2%", trend: "up", color: "bg-emerald text-primary-foreground", description: "Taxa de retorno" }} />

        {/* Appointments Section */}
        <div className="lg:col-span-3 bg-card p-8 rounded-[40px] card-premium border border-border/50 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-black text-foreground tracking-tight">Próximos Atendimentos</h3>
              <p className="text-muted-foreground font-medium text-sm">Sua agenda para hoje</p>
            </div>
            <div className="bg-primary/10 px-4 py-2 rounded-xl">
              <span className="text-xs font-black text-primary uppercase tracking-widest">{new Date().toLocaleDateString('pt-BR', { weekday: 'long' })}</span>
            </div>
          </div>

          <div className="space-y-4">
            {appointments.map((apt) => (
              <div key={apt.id} className="flex items-center justify-between p-5 bg-muted/50 rounded-[28px] border border-transparent hover:border-primary/20 hover:bg-card transition-all group">
                <div className="flex items-center gap-5">
                  <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-black ${apt.status === 'Confirmado' ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                    <span className="text-lg">{apt.time}</span>
                  </div>
                  <div>
                    <p className="font-bold text-foreground text-lg">{apt.name}</p>
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest ${apt.type === 'Online' ? 'bg-purple/20 text-purple' : 'bg-primary/20 text-primary'}`}>{apt.type}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-3 bg-card text-muted-foreground hover:text-primary rounded-xl shadow-sm border border-border transition-all opacity-0 group-hover:opacity-100"><MessageCircle className="w-5 h-5" /></button>
                  {apt.type === 'Online' && <button className="p-3 bg-primary text-primary-foreground rounded-xl shadow-md transition-all opacity-0 group-hover:opacity-100"><Video className="w-5 h-5" /></button>}
                  <button className="p-3 bg-card text-muted-foreground hover:text-foreground rounded-xl shadow-sm border border-border transition-all"><PenLine className="w-5 h-5" /></button>
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => onNavigate('agenda')} className="mt-6 w-full py-4 border-2 border-dashed border-border rounded-[28px] text-muted-foreground font-bold text-xs uppercase tracking-widest hover:border-primary/30 hover:text-primary transition-all">Ver agenda completa</button>
        </div>

        {/* Finance Widget */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-foreground rounded-[40px] p-8 text-background shadow-2xl relative overflow-hidden h-1/2 min-h-[220px] flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4" /> Finanças</h4>
              <p className="text-4xl font-extrabold tracking-tighter">R$ 12.450</p>
              <p className="text-primary/80 mt-1 font-bold">Faturamento Junho</p>
            </div>
            <div className="pt-4 border-t border-background/10 flex items-center justify-between">
              <div><span className="text-[9px] font-black text-background/50 uppercase">Recebido</span><br /><span className="font-bold">R$ 10.2k</span></div>
              <div className="text-right"><span className="text-[9px] font-black text-background/50 uppercase">Pendente</span><br /><span className="font-bold text-amber">R$ 2.2k</span></div>
            </div>
          </div>

          <div className="bg-primary rounded-[40px] p-8 text-primary-foreground shadow-2xl relative overflow-hidden h-1/2 min-h-[220px] flex flex-col justify-between">
            <Zap className="w-10 h-10 text-primary-foreground/50 mb-2" />
            <div>
              <h4 className="text-xl font-extrabold mb-2">Sugestão Proativa</h4>
              <p className="text-primary-foreground/80 font-medium text-sm mb-4">Ana Silva não retorna há 15 dias. Enviar mensagem?</p>
            </div>
            <button className="w-full bg-background text-primary py-4 rounded-[22px] font-bold text-[10px] uppercase tracking-widest shadow-xl active:scale-95 transition-all">Executar Agora</button>
          </div>
        </div>

        {/* AI Suggestions */}
        <div className="lg:col-span-4 space-y-6">
          <h3 className="text-xs font-black text-muted-foreground uppercase tracking-[0.3em] flex items-center gap-2"><Lightbulb className="w-4 h-4 text-amber" /> Ações Sugeridas pela IA</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {suggestions.length > 0 ? suggestions.map((s) => (
              <div key={s.id} className="bg-card p-6 rounded-[32px] border border-border card-premium hover:border-primary/20 transition-all flex flex-col justify-between group">
                <div>
                  <div className={`w-10 h-10 rounded-xl mb-4 flex items-center justify-center ${s.impact === 'high' ? 'bg-rose/10 text-rose' : 'bg-amber/10 text-amber'}`}>
                    {s.type === 'billing' ? <DollarSign className="w-5 h-5" /> : <Zap className="w-5 h-5" />}
                  </div>
                  <h4 className="font-extrabold text-foreground mb-2 group-hover:text-primary transition-colors">{s.title}</h4>
                  <p className="text-sm text-muted-foreground font-medium leading-relaxed">{s.description}</p>
                </div>
                <button className="mt-6 text-xs font-black uppercase tracking-widest text-primary hover:text-primary/80 flex items-center gap-2">{s.actionLabel} <ArrowRight className="w-4 h-4" /></button>
              </div>
            )) : [1, 2, 3].map(i => <div key={i} className="bg-card h-48 rounded-[32px] animate-pulse border-2 border-border"></div>)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
