import React, { useState, useMemo } from 'react';
import { Plus, Smile, Meh, Frown, Trash2, Edit, Loader2, FileText, TrendingUp, TrendingDown, Minus, Link, Activity } from 'lucide-react';
import { useClinicalRecords, ClinicalRecordInsert, ClinicalRecord } from '@/hooks/useClinicalRecords';
import { useAppointments } from '@/hooks/useAppointments';
import ClinicalRecordFormModal from './ClinicalRecordFormModal';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

interface PatientClinicalRecordsProps {
  patientId: string;
  patientName: string;
}

const PatientClinicalRecords: React.FC<PatientClinicalRecordsProps> = ({ patientId, patientName }) => {
  const { records, isLoading, createRecord, updateRecord, deleteRecord } = useClinicalRecords(patientId);
  const { appointments } = useAppointments();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ClinicalRecord | null>(null);

  // Filter appointments for this patient that are confirmed and don't have a clinical record yet
  const availableAppointments = useMemo(() => {
    const linkedAppointmentIds = new Set(records.map(r => r.appointment_id).filter(Boolean));
    return appointments
      .filter(apt => 
        apt.patient_id === patientId && 
        (apt.status === 'confirmado' || apt.status === 'realizado') &&
        !linkedAppointmentIds.has(apt.id)
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [appointments, patientId, records]);

  // Chart data - reverse to show chronological order (oldest first)
  const chartData = useMemo(() => {
    return [...records]
      .reverse()
      .filter(r => r.wellbeing_score !== null)
      .map(record => ({
        date: format(new Date(record.session_date), 'dd/MM'),
        fullDate: format(new Date(record.session_date), "dd 'de' MMMM", { locale: ptBR }),
        score: record.wellbeing_score,
        sentiment: record.sentiment,
      }));
  }, [records]);

  const averageScore = useMemo(() => {
    const scores = records.filter(r => r.wellbeing_score !== null).map(r => r.wellbeing_score!);
    if (scores.length === 0) return 0;
    return Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10;
  }, [records]);

  const handleSubmit = (data: ClinicalRecordInsert) => {
    if (editingRecord) {
      updateRecord.mutate({ id: editingRecord.id, ...data });
    } else {
      createRecord.mutate(data);
    }
    setEditingRecord(null);
  };

  const handleEdit = (record: ClinicalRecord) => {
    setEditingRecord(record);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este registro?')) {
      deleteRecord.mutate(id);
    }
  };

  const getSentimentIcon = (sentiment: string | null) => {
    switch (sentiment) {
      case 'positive': return <Smile className="w-5 h-5 text-emerald" />;
      case 'negative': return <Frown className="w-5 h-5 text-destructive" />;
      default: return <Meh className="w-5 h-5 text-amber" />;
    }
  };

  const getScoreColor = (score: number | null) => {
    if (!score) return 'text-muted-foreground';
    if (score >= 7) return 'text-emerald';
    if (score >= 4) return 'text-amber';
    return 'text-destructive';
  };

  const getTrendIcon = (index: number) => {
    if (index >= records.length - 1) return null;
    const current = records[index].wellbeing_score || 5;
    const previous = records[index + 1].wellbeing_score || 5;
    
    if (current > previous) return <TrendingUp className="w-4 h-4 text-emerald" />;
    if (current < previous) return <TrendingDown className="w-4 h-4 text-destructive" />;
    return <Minus className="w-4 h-4 text-muted-foreground" />;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{records.length} registro(s)</p>
        </div>
        <button
          onClick={() => { setEditingRecord(null); setIsModalOpen(true); }}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl font-bold text-sm hover:bg-primary/90 transition"
        >
          <Plus className="w-4 h-4" /> Nova Evolução
        </button>
      </div>

      {/* Wellbeing Evolution Chart */}
      {chartData.length >= 2 && (
        <div className="bg-card rounded-2xl p-5 border border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-foreground">Evolução do Bem-estar</h3>
            </div>
            <div className="flex items-center gap-2 bg-muted px-3 py-1.5 rounded-lg">
              <span className="text-xs text-muted-foreground">Média:</span>
              <span className={`font-black ${averageScore >= 7 ? 'text-emerald' : averageScore >= 4 ? 'text-amber' : 'text-destructive'}`}>
                {averageScore}
              </span>
            </div>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                  tickLine={{ stroke: 'hsl(var(--border))' }}
                />
                <YAxis 
                  domain={[0, 10]} 
                  ticks={[0, 2, 4, 6, 8, 10]}
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                  tickLine={{ stroke: 'hsl(var(--border))' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                  formatter={(value: number) => [`Bem-estar: ${value}`, '']}
                  labelFormatter={(label, payload) => payload[0]?.payload?.fullDate || label}
                />
                <ReferenceLine y={5} stroke="hsl(var(--muted-foreground))" strokeDasharray="5 5" opacity={0.5} />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 5 }}
                  activeDot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-6 mt-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-emerald" />
              <span>Bom (7-10)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-amber" />
              <span>Neutro (4-6)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-destructive" />
              <span>Baixo (1-3)</span>
            </div>
          </div>
        </div>
      )}

      {records.length === 0 ? (
        <div className="text-center py-8 bg-muted/30 rounded-2xl">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground font-medium">Nenhum registro encontrado</p>
          <p className="text-sm text-muted-foreground">Clique em "Nova Evolução" para adicionar</p>
        </div>
      ) : (
        <div className="space-y-3">
          {records.map((record, index) => (
            <div key={record.id} className="bg-muted/50 rounded-2xl p-4 hover:bg-muted transition group">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {getSentimentIcon(record.sentiment)}
                    <span className={`text-xl font-black ${getScoreColor(record.wellbeing_score)}`}>
                      {record.wellbeing_score || '-'}
                    </span>
                    {getTrendIcon(index)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-foreground">
                        {format(new Date(record.session_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                      </p>
                      {record.appointment_id && (
                        <span className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                          <Link className="w-3 h-3" />
                          Vinculado
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Registrado em {format(new Date(record.created_at), "dd/MM/yyyy 'às' HH:mm")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                  <button
                    onClick={() => handleEdit(record)}
                    className="p-2 hover:bg-amber/20 hover:text-amber rounded-lg transition"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(record.id)}
                    className="p-2 hover:bg-destructive/20 hover:text-destructive rounded-lg transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {record.content && (
                <div className="mb-3">
                  <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Conteúdo da Sessão</p>
                  <p className="text-sm text-foreground">{record.content}</p>
                </div>
              )}

              {record.observations && (
                <div className="mb-3">
                  <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Observações</p>
                  <p className="text-sm text-foreground">{record.observations}</p>
                </div>
              )}

              {record.goals && (
                <div className="bg-primary/5 rounded-xl p-3">
                  <p className="text-xs font-bold text-primary uppercase mb-1">Metas e Próximos Passos</p>
                  <p className="text-sm text-foreground">{record.goals}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <ClinicalRecordFormModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingRecord(null); }}
        onSubmit={handleSubmit}
        patientId={patientId}
        record={editingRecord}
        availableAppointments={availableAppointments}
      />
    </div>
  );
};

export default PatientClinicalRecords;
