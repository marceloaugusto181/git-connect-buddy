import React from 'react';
import { LayoutDashboard, Calendar, DollarSign, Users, Zap, LogOut, FileText, CheckSquare, Sparkles, BrainCircuit, Settings, Target, FileSignature, Share2 } from 'lucide-react';
import { Page } from '../types';

interface SidebarProps {
  activePage: Page;
  setPage: (page: Page) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activePage, setPage, isMobileOpen, setIsMobileOpen }) => {
  const menuItems = [
    { id: 'overview', label: 'Início', icon: LayoutDashboard },
    { id: 'patients', label: 'Pacientes', icon: Users },
    { id: 'agenda', label: 'Agenda', icon: Calendar },
    { id: 'leads', label: 'Prospecção', icon: Target },
    { id: 'tasks', label: 'Tarefas', icon: CheckSquare },
    { id: 'financial', label: 'Finanças', icon: DollarSign },
    { id: 'documents', label: 'Documentos', icon: FileSignature },
    { id: 'resources', label: 'Arquivos', icon: FileText },
    { id: 'partners', label: 'Parceiros', icon: Share2 },
    { id: 'automations', label: 'Automações', icon: Zap, isSpecial: true },
  ];

  return (
    <>
      {isMobileOpen && (
        <div className="fixed inset-0 bg-foreground/10 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsMobileOpen(false)} />
      )}

      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-72 bg-card sidebar-shape flex flex-col border-r border-border/50
        transition-all duration-300 ease-in-out
        ${isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="h-28 flex items-center px-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
              <BrainCircuit className="text-primary-foreground w-7 h-7" />
            </div>
            <span className="text-2xl font-extrabold text-foreground tracking-tight">PsyFlow</span>
          </div>
        </div>

        <nav className="flex-1 px-6 py-4 space-y-1 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            const isAutomations = item.id === 'automations';

            return (
              <button
                key={item.id}
                onClick={() => { setPage(item.id as Page); setIsMobileOpen(false); }}
                className={`
                  w-full flex items-center justify-between px-6 py-3.5 rounded-[22px] text-sm font-bold transition-all group
                  ${isActive
                    ? 'active-nav-item text-primary-foreground'
                    : isAutomations
                      ? 'text-primary bg-primary/10 hover:bg-primary hover:text-primary-foreground mt-4 border border-primary/20'
                      : 'text-muted-foreground hover:text-primary hover:bg-primary/10'}
                `}
              >
                <div className="flex items-center gap-4">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-primary-foreground' : isAutomations ? 'text-primary group-hover:text-primary-foreground' : 'text-muted-foreground group-hover:text-primary'}`} />
                  <span>{item.label}</span>
                </div>
                {isActive ? (
                  <Sparkles className="w-3.5 h-3.5 text-primary-foreground/60" />
                ) : isAutomations ? (
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse group-hover:bg-primary-foreground"></div>
                ) : null}
              </button>
            );
          })}
        </nav>

        <div className="p-8 mt-auto space-y-4">
          <button
            onClick={() => { setPage('security'); setIsMobileOpen(false); }}
            className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-sm font-bold transition-all ${activePage === 'security' ? 'bg-foreground text-background shadow-lg' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
          >
            <Settings className="w-5 h-5" />
            Configurações
          </button>

          <button
            className="w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-sm font-bold text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all"
          >
            <LogOut className="w-5 h-5" />
            Sair da conta
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
