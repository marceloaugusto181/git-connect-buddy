export interface CalendarEventResult {
  id: string;
  summary: string;
  meetLink: string;
  htmlLink: string;
}

export const createGoogleMeetEvent = async (
  patientName: string,
  date: string,
  time: string
): Promise<CalendarEventResult> => {
  await new Promise(resolve => setTimeout(resolve, 800));

  const randomStr = () => Math.random().toString(36).substring(2, 6);
  const meetCode = `${randomStr()}-${randomStr()}-${randomStr()}`;

  return {
    id: `event_${Date.now()}`,
    summary: `Sessão Terapia - ${patientName}`,
    meetLink: `https://meet.google.com/${meetCode}`,
    htmlLink: `https://calendar.google.com/calendar/event?eid=${randomStr()}`
  };
};

export const checkCalendarIntegration = async (): Promise<boolean> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return true;
};
