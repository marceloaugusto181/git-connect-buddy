import React, { useState, useMemo } from 'react';
import { Calendar as CalendarIcon, Clock, Plus, X, Save, CalendarPlus, Check, Video, MessageCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import StatCard from '../components/StatCard';
import { patientList } from '../utils/mockData';
import { createGoogleMeetEvent } from '../services/googleCalendarService';
import { generateReminderMessage, openWhatsApp, simulateSending } from '../services/whatsappService';

interface AgendaItem {
  id: string;
  patientName: string;
  patientPhone?: string;
  date: string;
  time: string;
  type: 'Presencial' | 'Online';
  meetLink?: string;
  status: 'Confirmado' | 'Pendente';
  reminderSent?: boolean;
}

const Agenda: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [sendingReminderId, setSendingReminderId] = useState<string | null>(null);

  const [agendaItems, setAgendaItems] = useState<AgendaItem[]>([
    { id: '1', patientName: 'Ana Silva', patientPhone: '(11) 99876-5432', date: new Date().toISOString().split('T')[0], time: '14:00', type: 'Online', meetLink: 'https://meet.google.com/abc-defg-hij', status: 'Confirmado', reminderSent: false },
    { id: '2', patientName: 'Carlos Ferreira', patientPhone: '(21) 98888-7777', date: new Date().toISOString().split('T')[0], time: '16:00', type: 'Presencial', status: 'Pendente', reminderSent: false },
    { id: '3', patientName: 'Beatriz Costa', patientPhone: '(31) 97777-6666', date: new Date(Date.now() + 86400000).toISOString().split('T')[0], time: '10:00', type: 'Online', status: 'Confirmado', reminderSent: true }
  ]);

  const [newAppointment, setNewAppointment] = useState({ patientId: '', date: '', time: '', type: 'Presencial' as 'Presencial' | 'Online' });

  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  });

  const weekDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < 6; i++) {
      const d = new Date(currentWeekStart);
      d.setDate(currentWeekStart.getDate() + i);
      days.push(d);
    }
    return days;
  }, [currentWeekStart]);

  const hours = Array.from({ length: 12 }, (_, i) => i + 8);

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const handleWeekChange = (direction: 'next' | 'prev') => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(currentWeekStart.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeekStart(newStart);
  };

  const handleSendReminder = async (item: AgendaItem) => {
    if (!item.patientPhone) return;
    setSendingReminderId(item.id);
    const message = generateReminderMessage(item.patientName, item.date, item.time, item.meetLink);
    await simulateSending();
    openWhatsApp(item.patientPhone, message);
    setSendingReminderId(null);
    setAgendaItems(prev => prev.map(i => i.id === item.id ? { ...i, reminderSent: true } : i));
  };

  const handleSaveAppointment = async () => {
    if (!newAppointment.patientId || !newAppointment.date || !newAppointment.time) return;
    
    const patient = patientList.find(p => p.id === newAppointment.patientId);
    if (!patient) return;

    let meetLink;
    if (newAppointment.type === 'Online') {
      const event = await createGoogleMeetEvent(patient.name, newAppointment.date, newAppointment.time);
      meetLink = event.meetLink;
    }

    setAgendaItems(prev => [...prev, {
      id: Date.now().toString(),
      patientName: patient.name,
      patientPhone: patient.phone,
      date: newAppointment.date,
      time: newAppointment.time,
      type: newAppointment.type === 'Online' ? 'Online' : 'Presencial',
      meetLink,
      status: 'Confirmado',
      reminderSent: false
    }]);

    setIsModalOpen(false);
    setNewAppointment({ patientId: '', date: '', time: '', type: 'Presencial' });
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const getAppointmentsForSlot = (date: Date, hour: number) => {
    const dateStr = date.toISOString().split('T')[0];
    return agendaItems.filter(item => item.date === dateStr && parseInt(item.time.split(':')[0]) === hour);
  };

  return (
    <div className="space-y-6 animate-flow">
      {showSuccess && (
        <div className="fixed top-24 right-10 bg-emerald text-primary-foreground px-6 py-3 rounded-xl shadow-2xl z-50 animate-fade-in flex items-center gap-2">
          <Check className="w-5 h-5" /> Agendamento salvo!
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">Agenda Semanal</h1>
          <p className="text-muted-foreground font-medium">Gerencie horários e sessões</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-foreground text-background px-5 py-3 rounded-xl font-bold hover:bg-foreground/90 transition shadow-lg active:scale-95">
          <CalendarPlus className="w-5 h-5" /> Novo Agendamento
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard kpi={{ label: "Hoje", value: agendaItems.filter(a => a.date === new Date().toISOString().split('T')[0]).length.toString(), icon: CalendarIcon, change: "sessões", trend: "neutral", color: "bg-primary text-primary-foreground" }} />
        <StatCard kpi={{ label: "Semana", value: "18", icon: Clock, change: "+3", trend: "up", color: "bg-emerald text-primary-foreground" }} />
        <StatCard kpi={{ label: "Online", value: agendaItems.filter(a => a.type === 'Online').length.toString(), icon: Video, change: "sessões", trend: "neutral", color: "bg-purple text-primary-foreground" }} />
        <StatCard kpi={{ label: "Confirmados", value: agendaItems.filter(a => a.status === 'Confirmado').length.toString(), icon: Check, change: "de " + agendaItems.length, trend: "up", color: "bg-amber text-foreground" }} />
      </div>

      {/* Calendar Grid */}
      <div className="bg-card rounded-[32px] border border-border overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <button onClick={() => handleWeekChange('prev')} className="p-2 hover:bg-muted rounded-lg transition"><ChevronLeft className="w-5 h-5" /></button>
          <span className="font-bold text-foreground">{currentWeekStart.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</span>
          <button onClick={() => handleWeekChange('next')} className="p-2 hover:bg-muted rounded-lg transition"><ChevronRight className="w-5 h-5" /></button>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            <div className="grid grid-cols-7 border-b border-border">
              <div className="p-3 text-center text-xs font-bold text-muted-foreground uppercase">Hora</div>
              {weekDays.map((day, i) => (
                <div key={i} className={`p-3 text-center border-l border-border ${isToday(day) ? 'bg-primary/10' : ''}`}>
                  <p className="text-xs font-bold text-muted-foreground uppercase">{day.toLocaleDateString('pt-BR', { weekday: 'short' })}</p>
                  <p className={`text-lg font-black ${isToday(day) ? 'text-primary' : 'text-foreground'}`}>{day.getDate()}</p>
                </div>
              ))}
            </div>

            <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
              {hours.map(hour => (
                <div key={hour} className="grid grid-cols-7 border-b border-border/50">
                  <div className="p-3 text-xs font-bold text-muted-foreground text-center">{hour}:00</div>
                  {weekDays.map((day, i) => {
                    const appointments = getAppointmentsForSlot(day, hour);
                    return (
                      <div key={i} className={`p-1 border-l border-border/50 min-h-[60px] ${isToday(day) ? 'bg-primary/5' : ''}`}>
                        {appointments.map(apt => (
                          <div key={apt.id} className={`text-xs p-2 rounded-lg mb-1 ${apt.type === 'Online' ? 'bg-purple/20 text-purple' : 'bg-primary/20 text-primary'}`}>
                            <p className="font-bold truncate">{apt.patientName}</p>
                            <p className="opacity-70">{apt.time}</p>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Today's List */}
      <div className="bg-card rounded-[32px] border border-border p-6">
        <h3 className="text-lg font-black text-foreground mb-4">Atendimentos de Hoje</h3>
        <div className="space-y-3">
          {agendaItems.filter(a => a.date === new Date().toISOString().split('T')[0]).map(item => (
            <div key={item.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-2xl">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold ${item.status === 'Confirmado' ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>{item.time}</div>
                <div>
                  <p className="font-bold text-foreground">{item.patientName}</p>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${item.type === 'Online' ? 'bg-purple/20 text-purple' : 'bg-primary/20 text-primary'}`}>{item.type}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => handleSendReminder(item)} disabled={sendingReminderId === item.id || item.reminderSent} className={`p-2 rounded-lg transition ${item.reminderSent ? 'bg-emerald/20 text-emerald' : 'bg-muted hover:bg-primary/20 hover:text-primary'}`}>
                  <MessageCircle className="w-4 h-4" />
                </button>
                {item.type === 'Online' && item.meetLink && (
                  <a href={item.meetLink} target="_blank" rel="noopener noreferrer" className="p-2 bg-primary text-primary-foreground rounded-lg"><Video className="w-4 h-4" /></a>
                )}
              </div>
            </div>
          ))}
          {agendaItems.filter(a => a.date === new Date().toISOString().split('T')[0]).length === 0 && (
            <p className="text-center text-muted-foreground py-8">Nenhum atendimento para hoje</p>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-foreground/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-card rounded-[32px] p-8 w-full max-w-md shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-foreground">Novo Agendamento</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-muted rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase">Paciente</label>
                <select value={newAppointment.patientId} onChange={e => setNewAppointment({ ...newAppointment, patientId: e.target.value })} className="w-full mt-1 p-3 bg-muted rounded-xl border-none font-medium">
                  <option value="">Selecione...</option>
                  {patientList.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase">Data</label>
                  <input type="date" value={newAppointment.date} onChange={e => setNewAppointment({ ...newAppointment, date: e.target.value })} className="w-full mt-1 p-3 bg-muted rounded-xl border-none font-medium" />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase">Hora</label>
                  <input type="time" value={newAppointment.time} onChange={e => setNewAppointment({ ...newAppointment, time: e.target.value })} className="w-full mt-1 p-3 bg-muted rounded-xl border-none font-medium" />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase">Tipo</label>
                <div className="grid grid-cols-2 gap-3 mt-1">
                  {(['Presencial', 'Online'] as const).map(type => (
                    <button key={type} onClick={() => setNewAppointment({ ...newAppointment, type })} className={`p-3 rounded-xl font-bold text-sm transition ${newAppointment.type === type ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{type}</button>
                  ))}
                </div>
              </div>
              <button onClick={handleSaveAppointment} className="w-full bg-foreground text-background py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-foreground/90 transition active:scale-95">
                <Save className="w-5 h-5" /> Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Agenda;
