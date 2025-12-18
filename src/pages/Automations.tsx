import React, { useState } from 'react';
import { Zap, MessageSquare, Plus, Bot, Play, Sparkles, CheckCircle2, Wand2 } from 'lucide-react';
import { automationSettings } from '../utils/mockData';
import { AutomationConfig } from '../types';

const Automations: React.FC = () => {
  const [configs, setConfigs] = useState<AutomationConfig[]>(automationSettings);

  const templates = [
    { title: "Boas-vindas", desc: "Primeiro contato pós-cadastro.", icon: Sparkles, color: "text-primary bg-primary/10" },
    { title: "Recuperação", desc: "Mensagem para inativos (30 dias).", icon: Wand2, color: "text-purple bg-purple/10" },
    { title: "Pesquisa NPS", desc: "Avaliação após 4 sessões.", icon: MessageSquare, color: "text-emerald bg-emerald/10" },
  ];

  const toggleAutomation = (id: string) => {
    setConfigs(prev => prev.map(c => c.id === id ? { ...c, active: !c.active } : c));
  };

  return (
    <div className="space-y-8 animate-flow pb-20">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-black text-foreground tracking-tight">Workflow Studio</h1>
          <p className="text-muted-foreground mt-2 font-medium">
            Seus processos em piloto automático. <span className="text-primary">IA proativa</span> cuidando do operacional.
          </p>
        </div>

        <div className="flex gap-4 items-center">
          <div className="bg-foreground p-5 rounded-[24px] text-background flex items-center gap-4 shadow-xl">
            <div>
              <p className="text-3xl font-black">{configs.filter(c => c.active).length}</p>
              <p className="text-xs font-bold text-background/60 uppercase">Ativas</p>
            </div>
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-primary-foreground" />
            </div>
          </div>
        </div>
      </div>

      {/* Templates */}
      <div>
        <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-4">Templates Prontos</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {templates.map((t, i) => (
            <div key={i} className="bg-card border border-border rounded-[24px] p-5 hover:shadow-lg hover:border-primary/30 transition cursor-pointer group">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${t.color}`}>
                <t.icon className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-foreground mb-1 group-hover:text-primary transition">{t.title}</h4>
              <p className="text-sm text-muted-foreground">{t.desc}</p>
              <button className="mt-4 text-xs font-black uppercase tracking-widest text-primary flex items-center gap-1">
                <Plus className="w-4 h-4" /> Usar Template
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Active Automations */}
      <div>
        <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-4">Automações Configuradas</h3>
        <div className="space-y-4">
          {configs.map(config => (
            <div key={config.id} className="bg-card border border-border rounded-[24px] p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${config.active ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                  {config.icon === 'whatsapp' ? <MessageSquare className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
                </div>
                <div>
                  <h4 className="font-bold text-foreground">{config.title}</h4>
                  <p className="text-sm text-muted-foreground">{config.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-muted text-muted-foreground">Gatilho: {config.trigger}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button onClick={() => toggleAutomation(config.id)} className={`px-4 py-2 rounded-xl font-bold text-sm transition flex items-center gap-2 ${config.active ? 'bg-emerald/20 text-emerald' : 'bg-muted text-muted-foreground'}`}>
                  {config.active ? <CheckCircle2 className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  {config.active ? 'Ativa' : 'Pausada'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-primary to-purple rounded-[32px] p-8 text-primary-foreground">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl font-black mb-2">Crie fluxos personalizados</h3>
            <p className="text-primary-foreground/80">Automatize qualquer processo repetitivo da sua clínica</p>
          </div>
          <button className="bg-background text-primary px-6 py-4 rounded-2xl font-bold shadow-xl hover:scale-105 transition flex items-center gap-2">
            <Zap className="w-5 h-5" /> Criar Automação
          </button>
        </div>
      </div>
    </div>
  );
};

export default Automations;
