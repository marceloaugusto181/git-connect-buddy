import React, { forwardRef } from 'react';
import { KPI } from '../types';
import { ArrowUpRight, ArrowDownRight, Info } from 'lucide-react';

interface StatCardProps {
  kpi: KPI;
}

const StatCard = forwardRef<HTMLDivElement, StatCardProps>(({ kpi }, ref) => {
  return (
    <div
      ref={ref}
      className="group bg-card p-7 rounded-[32px] border border-border/60 hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 relative overflow-hidden cursor-default shadow-sm min-h-[220px] flex flex-col justify-between"
      title={kpi.description}
    >
      <div className="flex justify-between items-start">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${kpi.color || 'bg-primary text-primary-foreground'}`}>
          <kpi.icon className="w-6 h-6" />
        </div>

        {kpi.change && (
          <div className={`flex items-center justify-center gap-1 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest leading-none border ${
            kpi.trend === 'up' ? 'bg-emerald-light text-emerald border-emerald/20' :
            kpi.trend === 'down' ? 'bg-rose-light text-rose border-rose/20' :
            'bg-muted text-muted-foreground border-border'
          }`}>
            {kpi.trend === 'up' && <ArrowUpRight className="w-3 h-3 stroke-[3]" />}
            {kpi.trend === 'down' && <ArrowDownRight className="w-3 h-3 stroke-[3]" />}
            <span className="whitespace-nowrap">{kpi.change}</span>
          </div>
        )}
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-1.5">
            {kpi.label}
            {kpi.description && (
              <Info className="w-3.5 h-3.5 opacity-20 group-hover:opacity-100 transition-all cursor-help" />
            )}
          </p>
        </div>
        <h3 className="text-4xl font-black text-foreground tracking-tighter">
          {kpi.value}
        </h3>
      </div>

      <div className={`absolute bottom-0 left-0 h-1 transition-all duration-700 opacity-20 group-hover:w-full w-10 ${
        kpi.trend === 'up' ? 'bg-emerald' : kpi.trend === 'down' ? 'bg-rose' : 'bg-primary'
      }`}></div>
    </div>
  );
});

StatCard.displayName = 'StatCard';

export default StatCard;
