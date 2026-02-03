import React, { useMemo } from 'react';
import { Cake, Gift, MessageCircle } from 'lucide-react';
import { Patient } from '@/hooks/usePatients';
import { openWhatsApp, generateBirthdayMessage } from '@/services/whatsappService';
import { format, parseISO, isSameMonth, isSameDay, addDays, isWithinInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface BirthdayAlertProps {
  patients: Patient[];
}

interface BirthdayPatient extends Patient {
  daysUntil: number;
  isToday: boolean;
}

const BirthdayAlert: React.FC<BirthdayAlertProps> = ({ patients }) => {
  const upcomingBirthdays = useMemo(() => {
    const today = new Date();
    const nextWeek = addDays(today, 7);

    return patients
      .filter(p => p.birth_date && p.status === 'ativo')
      .map(patient => {
        const birthDate = parseISO(patient.birth_date!);
        const thisYearBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
        
        // Se já passou este ano, considera o próximo
        if (thisYearBirthday < today && !isSameDay(thisYearBirthday, today)) {
          thisYearBirthday.setFullYear(today.getFullYear() + 1);
        }

        const isToday = isSameDay(thisYearBirthday, today);
        const daysUntil = Math.ceil((thisYearBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        return {
          ...patient,
          daysUntil: isToday ? 0 : daysUntil,
          isToday,
        } as BirthdayPatient;
      })
      .filter(p => p.daysUntil >= 0 && p.daysUntil <= 7)
      .sort((a, b) => a.daysUntil - b.daysUntil)
      .slice(0, 5);
  }, [patients]);

  const handleSendMessage = (patient: BirthdayPatient) => {
    if (patient.phone) {
      const message = generateBirthdayMessage(patient.name);
      openWhatsApp(patient.phone, message);
    }
  };

  if (upcomingBirthdays.length === 0) {
    return null;
  }

  const todayBirthdays = upcomingBirthdays.filter(p => p.isToday);
  const upcomingOnly = upcomingBirthdays.filter(p => !p.isToday);

  return (
    <div className="bg-card border border-border rounded-[32px] p-6 card-premium">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-pink-500/10 rounded-xl flex items-center justify-center">
          <Cake className="w-5 h-5 text-pink-500" />
        </div>
        <div>
          <h3 className="font-bold text-foreground">Aniversários</h3>
          <p className="text-xs text-muted-foreground">Próximos 7 dias</p>
        </div>
      </div>

      {/* Aniversariantes de hoje */}
      {todayBirthdays.length > 0 && (
        <div className="mb-4">
          {todayBirthdays.map(patient => (
            <div
              key={patient.id}
              className="flex items-center justify-between p-4 bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-2xl border border-pink-500/20 animate-pulse-slow"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <Gift className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-bold text-foreground">{patient.name}</p>
                  <p className="text-xs font-bold text-pink-500 uppercase tracking-widest">
                    🎉 Aniversário Hoje!
                  </p>
                </div>
              </div>
              {patient.phone && (
                <button
                  onClick={() => handleSendMessage(patient)}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl font-bold text-xs hover:bg-emerald-600 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  Parabenizar
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Próximos aniversários */}
      {upcomingOnly.length > 0 && (
        <div className="space-y-2">
          {upcomingOnly.map(patient => (
            <div
              key={patient.id}
              className="flex items-center justify-between p-3 bg-muted/50 rounded-xl hover:bg-muted transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-pink-500/10 rounded-lg flex items-center justify-center">
                  <Cake className="w-4 h-4 text-pink-500" />
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">{patient.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {patient.birth_date && format(parseISO(patient.birth_date), "dd 'de' MMMM", { locale: ptBR })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-500 bg-amber-500/10 px-2 py-1 rounded-lg">
                  Em {patient.daysUntil} dia{patient.daysUntil > 1 ? 's' : ''}
                </span>
                {patient.phone && (
                  <button
                    onClick={() => handleSendMessage(patient)}
                    className="p-2 text-muted-foreground hover:text-emerald-500 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                    title="Enviar mensagem de aniversário"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BirthdayAlert;
