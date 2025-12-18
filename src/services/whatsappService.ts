export const formatPhoneForAPI = (phone: string): string => {
  const cleanPhone = phone.replace(/\D/g, '');
  return `55${cleanPhone}`;
};

export const generateReminderMessage = (patientName: string, date: string, time: string, meetLink?: string): string => {
  const greeting = "Olá";
  let msg = `${greeting}, ${patientName}! Tudo bem? ✨\n\nPassando para lembrar da nossa sessão de terapia agendada para:\n🗓️ *${date}*\n⏰ *${time}*`;

  if (meetLink) {
    msg += `\n\nLink para a videochamada: ${meetLink}`;
  } else {
    msg += `\n\nTe aguardo no consultório.`;
  }

  msg += `\n\nQualquer imprevisto, por favor me avise. Até lá!`;
  return encodeURIComponent(msg);
};

export const generatePaymentMessage = (patientName: string, amount: string = "R$ 150,00"): string => {
  const msg = `Olá, ${patientName}. Espero que esteja bem!\n\nEste é um lembrete automático sobre o pagamento da sua última sessão (${amount}).\n\nChave Pix: 123.456.789-00\n\nSe já realizou o pagamento, por favor desconsidere. Obrigado(a)!`;
  return encodeURIComponent(msg);
};

export const generateConfirmationMessage = (patientName: string): string => {
  const msg = `Olá, ${patientName}! ✨\n\nRecebi seu pagamento. Muito obrigado(a)! Já registrei aqui no sistema.\n\nNos vemos na próxima sessão!`;
  return encodeURIComponent(msg);
};

export const generateFollowUpMessage = (patientName: string): string => {
  const msg = `Oi, ${patientName}. Como você está se sentindo após a nossa última sessão?\n\nPassando apenas para dizer que estou à disposição caso precise de algo antes do nosso próximo encontro. 🌿`;
  return encodeURIComponent(msg);
};

export const generateBirthdayMessage = (patientName: string): string => {
  const msg = `Parabéns, ${patientName}! 🎉✨\n\nDesejo um dia iluminado, cheio de paz e alegria. Que este novo ciclo seja de muito crescimento e realizações. Feliz aniversário! 🎂🎈`;
  return encodeURIComponent(msg);
};

export const generateWelcomeMessage = (patientName: string): string => {
  const msg = `Seja bem-vindo(a), ${patientName}! ✨\n\nFico muito feliz em iniciar essa jornada com você. Se tiver qualquer dúvida sobre o processo ou horários, pode me chamar por aqui. Até nossa primeira sessão! 🌿`;
  return encodeURIComponent(msg);
};

export const openWhatsApp = (phone: string, text: string) => {
  const formattedPhone = formatPhoneForAPI(phone);
  window.open(`https://wa.me/${formattedPhone}?text=${text}`, '_blank');
};

export const simulateSending = async (): Promise<boolean> => {
  await new Promise(resolve => setTimeout(resolve, 1500));
  return true;
};
