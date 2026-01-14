import React, { useState } from 'react';
import { CheckSquare, Clock, User, DollarSign, FileText, CheckCircle, Filter, Plus, Trash2 } from 'lucide-react';
import { useTasks, TaskInsert } from '@/hooks/useTasks';
import TaskFormModal from '@/components/TaskFormModal';
import { format, isToday, isTomorrow, isPast, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Tasks: React.FC = () => {
  const { tasks, isLoading, toggleTaskStatus, createTask, deleteTask } = useTasks();
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const formatDueDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return 'Hoje';
    if (isTomorrow(date)) return 'Amanhã';
    if (isPast(date)) {
      const days = Math.abs(differenceInDays(date, new Date()));
      return `Há ${days} dia${days > 1 ? 's' : ''}`;
    }
    return format(date, "EEEE", { locale: ptBR });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Alta': return 'text-destructive bg-destructive/10 border-destructive/20';
      case 'Média': return 'text-amber bg-amber/10 border-amber/20';
      default: return 'text-primary bg-primary/10 border-primary/20';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Clínica': return <FileText className="w-4 h-4" />;
      case 'Financeira': return <DollarSign className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  const handleCreateTask = (task: TaskInsert) => {
    createTask.mutate(task);
  };

  const handleToggleStatus = (id: string, currentStatus: string, category: string) => {
    toggleTaskStatus.mutate({ id, currentStatus, category });
  };

  const handleDeleteTask = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
      deleteTask.mutate(id);
    }
  };

  const filteredTasks = tasks.filter(t => filterCategory === 'all' || t.category === filterCategory);
  const pendingTasks = filteredTasks.filter(t => t.status === 'Pendente');
  const completedTasks = filteredTasks.filter(t => t.status !== 'Pendente');
  const urgentCount = tasks.filter(t => t.priority === 'Alta' && t.status === 'Pendente').length;
  const progressPercent = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-flow">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">Tarefas</h1>
          <p className="text-muted-foreground font-medium">Organize suas atividades diárias</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-3 rounded-xl font-bold hover:bg-primary/90 transition shadow-lg active:scale-95"
        >
          <Plus className="w-5 h-5" /> Nova Tarefa
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-destructive/10 text-destructive rounded-xl flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-foreground">{urgentCount}</p>
            <p className="text-xs font-bold text-muted-foreground uppercase">Urgentes</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-amber/10 text-amber rounded-xl flex items-center justify-center">
            <CheckSquare className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-foreground">{pendingTasks.length}</p>
            <p className="text-xs font-bold text-muted-foreground uppercase">Pendentes</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald/10 text-emerald rounded-xl flex items-center justify-center">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-foreground">{completedTasks.length}</p>
            <p className="text-xs font-bold text-muted-foreground uppercase">Concluídas</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
            <Filter className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-foreground">{progressPercent}%</p>
            <p className="text-xs font-bold text-muted-foreground uppercase">Progresso</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'Clínica', 'Financeira', 'Administrativa'].map(cat => (
          <button 
            key={cat} 
            onClick={() => setFilterCategory(cat)} 
            className={`px-4 py-2 rounded-xl font-bold text-sm transition ${filterCategory === cat ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-muted-foreground hover:text-foreground'}`}
          >
            {cat === 'all' ? 'Todas' : cat}
          </button>
        ))}
      </div>

      {/* Task Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending */}
        <div className="bg-card border border-border rounded-[32px] p-6">
          <h3 className="text-lg font-black text-foreground mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber" /> Pendentes ({pendingTasks.length})
          </h3>
          <div className="space-y-3">
            {pendingTasks.map(task => (
              <div key={task.id} className="p-4 bg-muted/50 rounded-2xl hover:bg-muted transition group">
                <div className="flex items-start justify-between gap-3">
                  <button 
                    onClick={() => handleToggleStatus(task.id, task.status, task.category)} 
                    className="mt-1 w-5 h-5 rounded-full border-2 border-muted-foreground hover:border-primary hover:bg-primary/20 transition flex-shrink-0"
                  />
                  <div className="flex-1">
                    <p className="font-bold text-foreground">{task.title}</p>
                    {task.patients?.name && (
                      <p className="text-xs text-muted-foreground mt-1">Paciente: {task.patients.name}</p>
                    )}
                    {task.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{task.description}</p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        {getCategoryIcon(task.category)} {task.category}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`text-xs font-bold ${isPast(new Date(task.due_date)) && !isToday(new Date(task.due_date)) ? 'text-destructive' : 'text-muted-foreground'}`}>
                      {formatDueDate(task.due_date)}
                    </span>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {pendingTasks.length === 0 && (
              <p className="text-center text-muted-foreground py-8">Nenhuma tarefa pendente!</p>
            )}
          </div>
        </div>

        {/* Completed */}
        <div className="bg-card border border-border rounded-[32px] p-6">
          <h3 className="text-lg font-black text-foreground mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald" /> Concluídas ({completedTasks.length})
          </h3>
          <div className="space-y-3">
            {completedTasks.map(task => (
              <div key={task.id} className="p-4 bg-emerald/5 rounded-2xl group opacity-70">
                <div className="flex items-start justify-between gap-3">
                  <button 
                    onClick={() => handleToggleStatus(task.id, task.status, task.category)} 
                    className="mt-1 w-5 h-5 rounded-full bg-emerald text-primary-foreground flex items-center justify-center flex-shrink-0"
                  >
                    <CheckCircle className="w-3 h-3" />
                  </button>
                  <div className="flex-1">
                    <p className="font-bold text-foreground line-through">{task.title}</p>
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded mt-2 inline-block ${task.status === 'Pago' ? 'bg-emerald/20 text-emerald' : 'bg-muted text-muted-foreground'}`}>
                      {task.status}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {completedTasks.length === 0 && (
              <p className="text-center text-muted-foreground py-8">Nenhuma tarefa concluída</p>
            )}
          </div>
        </div>
      </div>

      <TaskFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateTask}
      />
    </div>
  );
};

export default Tasks;
