import React from 'react';
import { Shield, Lock, FileText, Database, CheckCircle2, Cpu, Key, Eye, EyeOff } from 'lucide-react';
import { securityLog } from '../utils/mockData';

const Security: React.FC = () => {
  const [showKey, setShowKey] = React.useState(false);

  return (
    <div className="space-y-8 animate-flow">
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">Segurança & Configurações</h1>
          <p className="text-muted-foreground font-medium">Proteção de dados, logs e integrações</p>
        </div>
        <div className="bg-emerald/10 border border-emerald/20 px-4 py-2 rounded-xl flex items-center gap-2">
          <Shield className="w-5 h-5 text-emerald" />
          <span className="text-sm font-bold text-emerald uppercase tracking-widest">SSL Ativo</span>
        </div>
      </div>

      {/* Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border border-border p-6 rounded-[32px] flex items-center gap-4">
          <div className="w-14 h-14 bg-emerald/10 rounded-2xl flex items-center justify-center text-emerald">
            <Lock className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-black text-foreground">Criptografia</h3>
            <p className="text-sm text-muted-foreground">AES-256 em repouso</p>
          </div>
        </div>
        <div className="bg-card border border-border p-6 rounded-[32px] flex items-center gap-4">
          <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
            <Database className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-black text-foreground">Backup</h3>
            <p className="text-sm text-muted-foreground">Diário às 03:00</p>
          </div>
        </div>
        <div className="bg-card border border-border p-6 rounded-[32px] flex items-center gap-4">
          <div className="w-14 h-14 bg-purple/10 rounded-2xl flex items-center justify-center text-purple">
            <FileText className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-black text-foreground">LGPD</h3>
            <p className="text-sm text-muted-foreground">100% Conformidade</p>
          </div>
        </div>
      </div>

      {/* API Key Section */}
      <div className="bg-card border border-border rounded-[32px] p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-black text-foreground">Integração com IA</h3>
            <p className="text-sm text-muted-foreground">Configure sua chave de API para funcionalidades de IA</p>
          </div>
        </div>

        <div className="bg-muted/50 p-4 rounded-2xl">
          <label className="text-xs font-bold text-muted-foreground uppercase mb-2 block">Chave de API</label>
          <div className="flex items-center gap-3">
            <div className="flex-1 flex items-center bg-card border border-border rounded-xl px-4 py-3">
              <Key className="w-4 h-4 text-muted-foreground mr-3" />
              <input 
                type={showKey ? 'text' : 'password'} 
                placeholder="Insira sua API Key..." 
                className="flex-1 bg-transparent border-none outline-none font-mono text-sm"
              />
              <button onClick={() => setShowKey(!showKey)} className="p-1 text-muted-foreground hover:text-foreground">
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <button className="bg-primary text-primary-foreground px-5 py-3 rounded-xl font-bold text-sm">Salvar</button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">A chave é armazenada de forma segura e nunca é exposta.</p>
        </div>
      </div>

      {/* Activity Log */}
      <div className="bg-card border border-border rounded-[32px] p-6">
        <h3 className="font-black text-foreground mb-6">Log de Atividades</h3>
        <div className="space-y-3">
          {securityLog.map(log => (
            <div key={log.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-2xl">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald" />
                <div>
                  <p className="font-bold text-foreground">{log.action}</p>
                  <p className="text-xs text-muted-foreground">{log.date}</p>
                </div>
              </div>
              <span className="text-xs font-bold px-2 py-1 rounded-lg bg-emerald/20 text-emerald">{log.status}</span>
            </div>
          ))}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-2xl">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald" />
              <div>
                <p className="font-bold text-foreground">Login Realizado</p>
                <p className="text-xs text-muted-foreground">Agora</p>
              </div>
            </div>
            <span className="text-xs font-bold px-2 py-1 rounded-lg bg-emerald/20 text-emerald">Sucesso</span>
          </div>
        </div>
      </div>

      {/* Data Protection */}
      <div className="bg-foreground rounded-[32px] p-8 text-background">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Shield className="w-12 h-12 text-primary" />
            <div>
              <h3 className="text-xl font-black">Proteção de Dados</h3>
              <p className="text-background/60">Seus dados e de seus pacientes estão protegidos</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="text-center">
              <p className="text-2xl font-black text-primary">256-bit</p>
              <p className="text-xs text-background/60">Criptografia</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-black text-primary">99.9%</p>
              <p className="text-xs text-background/60">Uptime</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Security;
