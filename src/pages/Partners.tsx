import React from 'react';
import { Share2, Plus, Search, Mail, Award, TrendingUp, Phone, Activity } from 'lucide-react';
import { partnerList } from '../utils/mockData';
import StatCard from '../components/StatCard';

const Partners: React.FC = () => {
  return (
    <div className="space-y-6 animate-flow pb-20">
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">Parceiros & Indicações</h1>
          <p className="text-muted-foreground font-medium">Fortaleça sua rede de encaminhamentos</p>
        </div>
        <button className="btn-primary-flow px-6 py-3 rounded-xl font-bold text-sm shadow-xl active:scale-95 flex items-center gap-2">
          <Plus className="w-5 h-5" /> Novo Parceiro
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard kpi={{ label: "Rede Ativa", value: "14", icon: Share2, change: "Parceiros", trend: "up", color: "bg-primary text-primary-foreground" }} />
        <StatCard kpi={{ label: "Indicações Mês", value: "08", icon: TrendingUp, change: "+25%", trend: "up", color: "bg-emerald text-primary-foreground" }} />
        <StatCard kpi={{ label: "Taxa Retorno", value: "92%", icon: Activity, change: "Excelência", trend: "up", color: "bg-purple text-primary-foreground" }} />
        <StatCard kpi={{ label: "Top Indicações", value: "Dr. Faro", icon: Award, change: "Psiquiatria", trend: "neutral", color: "bg-foreground text-background" }} />
      </div>

      {/* Search */}
      <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3">
        <Search className="w-5 h-5 text-muted-foreground" />
        <input type="text" placeholder="Buscar parceiro..." className="flex-1 bg-transparent border-none outline-none font-medium" />
      </div>

      {/* Partners List */}
      <div className="bg-card rounded-[32px] border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 text-xs font-black text-muted-foreground uppercase">Parceiro</th>
                <th className="text-left p-4 text-xs font-black text-muted-foreground uppercase">Especialidade</th>
                <th className="text-left p-4 text-xs font-black text-muted-foreground uppercase">Indicações</th>
                <th className="text-left p-4 text-xs font-black text-muted-foreground uppercase">Status</th>
                <th className="text-left p-4 text-xs font-black text-muted-foreground uppercase">Contato</th>
              </tr>
            </thead>
            <tbody>
              {partnerList.map(partner => (
                <tr key={partner.id} className="border-b border-border/50 hover:bg-muted/50 transition">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-bold">
                        {partner.name.charAt(0)}
                      </div>
                      <span className="font-bold text-foreground">{partner.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-muted-foreground">{partner.specialty}</td>
                  <td className="p-4">
                    <span className="font-black text-foreground">{partner.referralsCount}</span>
                    <span className="text-muted-foreground text-sm"> pacientes</span>
                  </td>
                  <td className="p-4">
                    <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg ${partner.status === 'Ativo' ? 'bg-emerald/20 text-emerald' : 'bg-muted text-muted-foreground'}`}>
                      {partner.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button className="p-2 bg-muted rounded-lg hover:bg-primary/20 hover:text-primary transition">
                        <Mail className="w-4 h-4" />
                      </button>
                      <button className="p-2 bg-muted rounded-lg hover:bg-emerald/20 hover:text-emerald transition">
                        <Phone className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Partners;
