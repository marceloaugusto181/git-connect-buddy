import React, { useState, useMemo } from 'react';
import { Calendar as CalendarIcon, Clock, Plus, X, Save, CalendarPlus, Check, Video, MessageCircle, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import StatCard from '../components/StatCard';
import { usePatients } from '@/hooks/usePatients';
import { useAppointments } from '@/hooks/useAppointments';
import { createGoogleMeetEvent } from '../services/googleCalendarService';
import { generateReminderMessage, openWhatsApp, simulateSending } from '../services/whatsappService';

const Agenda: React.FC = () => {
  const { patients } = usePatients();
  const { appointments, isLoading, createAppointment, markReminderSent } = useAppointments();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [sendingReminderId, setSendingReminderId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

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

  const handleSendReminder = async (appointment: typeof appointments[0]) => {
    if (!appointment.patient?.phone) return;
    setSendingReminderId(appointment.id);
    
    const message = generateReminderMessage(
      appointment.patient.name, 
      appointment.date, 
      appointment.time, 
      appointment.meet_link || undefined
    );
    await simulateSending();
    openWhatsApp(appointment.patient.phone, message);
    
    await markReminderSent.mutateAsync(appointment.id);
    setSendingReminderId(null);
  };

  const handleSaveAppointment = async () => {
    if (!newAppointment.patientId || !newAppointment.date || !newAppointment.time) return;
    
    const patient = patients.find(p => p.id === newAppointment.patientId);
    if (!patient) return;

    setIsSaving(true);
    
    try {
      let meetLink: string | undefined;
      if (newAppointment.type === 'Online') {
        const event = await createGoogleMeetEvent(patient.name, newAppointment.date, newAppointment.time);
        meetLink = event.meetLink;
      }

      await createAppointment.mutateAsync({
        patient_id: newAppointment.patientId,
        date: newAppointment.date,
        time: newAppointment.time,
        type: newAppointment.type,
        status: 'confirmado',
        meet_link: meetLink,
      });

      setIsModalOpen(false);
      setNewAppointment({ patientId: '', date: '', time: '', type: 'Presencial' });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Erro ao salvar agendamento:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const getAppointmentsForSlot = (date: Date, hour: number) => {
    const dateStr = date.toISOString().split('T')[0];
    return appointments.filter(item => item.date === dateStr && parseInt(item.time.split(':')[0]) === hour);
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter(a => a.date === todayStr);
  const weekAppointments = appointments.filter(a => {
    const aptDate = new Date(a.date);
    return aptDate >= weekDays[0] && aptDate <= weekDays[weekDays.length - 1];
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

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
        <StatCard kpi={{ label: "Hoje", value: todayAppointments.length.toString(), icon: CalendarIcon, change: "sessões", trend: "neutral", color: "bg-primary text-primary-foreground" }} />
        <StatCard kpi={{ label: "Semana", value: weekAppointments.length.toString(), icon: Clock, change: "agendamentos", trend: "up", color: "bg-emerald text-primary-foreground" }} />
        <StatCard kpi={{ label: "Online", value: appointments.filter(a => a.type === 'Online').length.toString(), icon: Video, change: "sessões", trend: "neutral", color: "bg-purple text-primary-foreground" }} />
        <StatCard kpi={{ label: "Confirmados", value: appointments.filter(a => a.status === 'confirmado').length.toString(), icon: Check, change: "de " + appointments.length, trend: "up", color: "bg-amber text-foreground" }} />
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
                    const dayAppointments = getAppointmentsForSlot(day, hour);
                    return (
                      <div key={i} className={`p-1 border-l border-border/50 min-h-[60px] ${isToday(day) ? 'bg-primary/5' : ''}`}>
                        {dayAppointments.map(apt => (
                          <div key={apt.id} className={`text-xs p-2 rounded-lg mb-1 ${apt.type === 'Online' ? 'bg-purple/20 text-purple' : 'bg-primary/20 text-primary'}`}>
                            <p className="font-bold truncate">{apt.patient?.name || 'Paciente'}</p>
                            <p className="opacity-70">{apt.time.slice(0, 5)}</p>
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
          {todayAppointments.map(item => (
            <div key={item.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-2xl">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold ${item.status === 'confirmado' ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                  {item.time.slice(0, 5)}
                </div>
                <div>
                  <p className="font-bold text-foreground">{item.patient?.name || 'Paciente'}</p>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${item.type === 'Online' ? 'bg-purple/20 text-purple' : 'bg-primary/20 text-primary'}`}>{item.type}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleSendReminder(item)} 
                  disabled={sendingReminderId === item.id || item.reminder_sent} 
                  className={`p-2 rounded-lg transition ${item.reminder_sent ? 'bg-emerald/20 text-emerald' : 'bg-muted hover:bg-primary/20 hover:text-primary'}`}
                >
                  {sendingReminderId === item.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <MessageCircle className="w-4 h-4" />
                  )}
                </button>
                {item.type === 'Online' && item.meet_link && (
                  <a href={item.meet_link} target="_blank" rel="noopener noreferrer" className="p-2 bg-primary text-primary-foreground rounded-lg">
                    <Video className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          ))}
          {todayAppointments.length === 0 && (
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
                <select 
                  value={newAppointment.patientId} 
                  onChange={e => setNewAppointment({ ...newAppointment, patientId: e.target.value })} 
                  className="w-full mt-1 p-3 bg-muted rounded-xl border-none font-medium"
                >
                  <option value="">Selecione...</option>
                  {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase">Data</label>
                  <input 
                    type="date" 
                    value={newAppointment.date} 
                    onChange={e => setNewAppointment({ ...newAppointment, date: e.target.value })} 
                    className="w-full mt-1 p-3 bg-muted rounded-xl border-none font-medium" 
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase">Hora</label>
                  <input 
                    type="time" 
                    value={newAppointment.time} 
                    onChange={e => setNewAppointment({ ...newAppointment, time: e.target.value })} 
                    className="w-full mt-1 p-3 bg-muted rounded-xl border-none font-medium" 
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase">Tipo</label>
                <div className="grid grid-cols-2 gap-3 mt-1">
                  {(['Presencial', 'Online'] as const).map(type => (
                    <button 
                      key={type} 
                      onClick={() => setNewAppointment({ ...newAppointment, type })} 
                      className={`p-3 rounded-xl font-bold text-sm transition ${newAppointment.type === type ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
              <button 
                onClick={handleSaveAppointment} 
                disabled={isSaving || !newAppointment.patientId || !newAppointment.date || !newAppointment.time}
                className="w-full bg-foreground text-background py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-foreground/90 transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Agenda;
