import React, { useState } from 'react';
import { Menu, Bell, Search } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Overview from './Overview';
import Agenda from './Agenda';
import Patients from './Patients';
import Financial from './Financial';
import Tasks from './Tasks';
import Leads from './Leads';
import Documents from './Documents';
import Partners from './Partners';
import Automations from './Automations';
import Security from './Security';
import Resources from './Resources';
import { Page } from '../types';

const Dashboard: React.FC = () => {
  const [activePage, setActivePage] = useState<Page>('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const renderContent = () => {
    switch (activePage) {
      case 'overview': return <Overview onNavigate={setActivePage} />;
      case 'agenda': return <Agenda />;
      case 'patients': return <Patients />;
      case 'financial': return <Financial />;
      case 'tasks': return <Tasks />;
      case 'leads': return <Leads />;
      case 'documents': return <Documents />;
      case 'partners': return <Partners />;
      case 'automations': return <Automations />;
      case 'security': return <Security />;
      case 'resources': return <Resources />;
      default: return <Overview onNavigate={setActivePage} />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden selection:bg-primary/20 selection:text-primary">
      <Sidebar activePage={activePage} setPage={setActivePage} isMobileOpen={isMobileMenuOpen} setIsMobileOpen={setIsMobileMenuOpen} />

      <div className="flex-1 flex flex-col relative overflow-hidden">
        <header className="h-20 bg-transparent flex items-center justify-between px-6 lg:px-10 z-20">
          <div className="flex items-center gap-4 flex-1">
            <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-3 bg-card text-muted-foreground rounded-2xl shadow-sm border border-border transition-all">
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden md:flex items-center bg-card border border-border rounded-full px-5 py-3 w-full max-w-md group focus-within:ring-2 focus-within:ring-primary/20 transition-all shadow-sm">
              <Search className="w-4 h-4 text-muted-foreground" />
              <input type="text" placeholder="O que você está procurando?" className="bg-transparent border-none outline-none text-sm font-bold text-foreground ml-3 w-full placeholder-muted-foreground" />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-3 bg-card text-muted-foreground hover:text-primary rounded-2xl shadow-sm border border-border transition-all relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full border-2 border-card"></span>
            </button>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-foreground leading-none">Dra. Helena Souza</p>
                <p className="text-[10px] font-bold text-primary uppercase tracking-widest mt-1">CRP 06/123456</p>
              </div>
              <div className="relative">
                <div className="w-11 h-11 rounded-2xl overflow-hidden shadow-lg border-2 border-card ring-1 ring-border">
                  <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150" className="w-full h-full object-cover" alt="Profile" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald rounded-full border-2 border-card"></span>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 lg:p-10 custom-scrollbar">
          <div className="max-w-[1400px] mx-auto">{renderContent()}</div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
