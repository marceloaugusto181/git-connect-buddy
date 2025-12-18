import { AISuggestion } from '../types';

// Mock AI service - em produção, integraria com Gemini API
export const getProactiveSuggestions = async (_contextData: string): Promise<AISuggestion[]> => {
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  return [
    {
      id: '1',
      type: 'retention',
      title: 'Paciente Inativa',
      description: 'Beatriz Costa não retorna há 90 dias. Enviar mensagem de acolhimento pode reativar o vínculo.',
      actionLabel: 'Enviar Mensagem',
      impact: 'high'
    },
    {
      id: '2',
      type: 'billing',
      title: 'Cobrança Pendente',
      description: 'Carlos Ferreira tem pagamento pendente há 5 dias. Automação de cobrança disponível.',
      actionLabel: 'Cobrar Agora',
      impact: 'medium'
    },
    {
      id: '3',
      type: 'clinical',
      title: 'Evolução Atrasada',
      description: '3 prontuários aguardam evolução clínica. Complete para manter conformidade.',
      actionLabel: 'Evoluir Agora',
      impact: 'high'
    }
  ];
};

export const getDashboardInsights = async (_contextData: string): Promise<string> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return "Sua clínica apresenta ótima taxa de retenção (94%). Oportunidade: 3 pacientes inativos podem ser reativados com follow-up personalizado.";
};

export const refineClinicalNote = async (rawText: string): Promise<string> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Simula refinamento básico
  const refined = rawText
    .replace(/paciente/gi, 'O(A) paciente')
    .replace(/sessão/gi, 'sessão terapêutica')
    .trim();
  
  return `${refined}\n\nEvolução registrada conforme diretrizes do CFP.`;
};
