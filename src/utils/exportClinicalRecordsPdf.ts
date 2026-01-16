import jsPDF from 'jspdf';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ClinicalRecord } from '@/hooks/useClinicalRecords';

interface ExportOptions {
  patientName: string;
  records: ClinicalRecord[];
  averageScore: number;
}

const getSentimentLabel = (sentiment: string | null): string => {
  switch (sentiment) {
    case 'positive': return 'Positivo';
    case 'negative': return 'Negativo';
    default: return 'Neutro';
  }
};

export const exportClinicalRecordsToPdf = ({ patientName, records, averageScore }: ExportOptions) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let yPosition = margin;

  // Helper to add new page if needed
  const checkPageBreak = (requiredHeight: number) => {
    if (yPosition + requiredHeight > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      yPosition = margin;
      return true;
    }
    return false;
  };

  // Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Prontuário Eletrônico', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 10;

  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text(`Paciente: ${patientName}`, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 8;

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Gerado em: ${format(new Date(), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}`, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 5;

  // Divider line
  doc.setDrawColor(200);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 10;

  // Summary
  doc.setTextColor(0);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Resumo', margin, yPosition);
  yPosition += 7;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Total de registros: ${records.length}`, margin, yPosition);
  yPosition += 5;

  if (averageScore > 0) {
    doc.text(`Média de bem-estar: ${averageScore}/10`, margin, yPosition);
    yPosition += 5;
  }

  const firstRecord = records.length > 0 ? records[records.length - 1] : null;
  const lastRecord = records.length > 0 ? records[0] : null;

  if (firstRecord) {
    doc.text(`Primeira sessão: ${format(new Date(firstRecord.session_date), "dd/MM/yyyy")}`, margin, yPosition);
    yPosition += 5;
  }

  if (lastRecord && lastRecord !== firstRecord) {
    doc.text(`Última sessão: ${format(new Date(lastRecord.session_date), "dd/MM/yyyy")}`, margin, yPosition);
    yPosition += 5;
  }

  yPosition += 10;

  // Divider
  doc.setDrawColor(200);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 10;

  // Records
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Registros de Evolução', margin, yPosition);
  yPosition += 10;

  // Sort records chronologically (oldest first for reading)
  const sortedRecords = [...records].reverse();

  sortedRecords.forEach((record, index) => {
    checkPageBreak(50);

    // Record header
    doc.setFillColor(245, 245, 245);
    doc.roundedRect(margin, yPosition - 5, contentWidth, 12, 2, 2, 'F');

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0);
    const dateText = format(new Date(record.session_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    doc.text(`${index + 1}. ${dateText}`, margin + 3, yPosition + 2);

    // Wellbeing score badge
    if (record.wellbeing_score) {
      const scoreText = `Bem-estar: ${record.wellbeing_score}/10`;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(scoreText, pageWidth - margin - 3 - doc.getTextWidth(scoreText), yPosition + 2);
    }

    yPosition += 12;

    // Sentiment
    if (record.sentiment) {
      doc.setFontSize(9);
      doc.setTextColor(100);
      doc.text(`Sentimento: ${getSentimentLabel(record.sentiment)}`, margin, yPosition);
      yPosition += 6;
    }

    // Content
    if (record.content) {
      checkPageBreak(20);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(80);
      doc.text('Conteúdo da Sessão:', margin, yPosition);
      yPosition += 5;

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0);
      const contentLines = doc.splitTextToSize(record.content, contentWidth - 5);
      contentLines.forEach((line: string) => {
        checkPageBreak(5);
        doc.text(line, margin + 2, yPosition);
        yPosition += 4.5;
      });
      yPosition += 3;
    }

    // Observations
    if (record.observations) {
      checkPageBreak(20);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(80);
      doc.text('Observações:', margin, yPosition);
      yPosition += 5;

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0);
      const obsLines = doc.splitTextToSize(record.observations, contentWidth - 5);
      obsLines.forEach((line: string) => {
        checkPageBreak(5);
        doc.text(line, margin + 2, yPosition);
        yPosition += 4.5;
      });
      yPosition += 3;
    }

    // Goals
    if (record.goals) {
      checkPageBreak(20);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(80);
      doc.text('Metas e Próximos Passos:', margin, yPosition);
      yPosition += 5;

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0);
      const goalsLines = doc.splitTextToSize(record.goals, contentWidth - 5);
      goalsLines.forEach((line: string) => {
        checkPageBreak(5);
        doc.text(line, margin + 2, yPosition);
        yPosition += 4.5;
      });
      yPosition += 3;
    }

    yPosition += 8;

    // Separator between records
    if (index < sortedRecords.length - 1) {
      doc.setDrawColor(220);
      doc.setLineDashPattern([2, 2], 0);
      doc.line(margin + 10, yPosition - 4, pageWidth - margin - 10, yPosition - 4);
      doc.setLineDashPattern([], 0);
    }
  });

  // Footer on all pages
  const totalPages = doc.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Página ${i} de ${totalPages} - Documento confidencial`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  // Save the PDF
  const fileName = `prontuario_${patientName.replace(/\s+/g, '_').toLowerCase()}_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
  doc.save(fileName);
};
