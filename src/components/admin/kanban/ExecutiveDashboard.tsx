'use client';

import { useMemo } from 'react';
import { TacticalTask, TacticalColumn } from '@/app/web-admin/actions/tactical-tasks';
import { TacticalObjective } from '@/app/web-admin/actions/tactical-strategic';
import { CheckCircle2, Clock, AlertTriangle, TrendingUp, TrendingDown, Zap, Target, BarChart3, ArrowRight } from 'lucide-react';

const STRATEGIC_STAGES = ['Aquisição', 'Conversão', 'Retenção', 'Receita'];

interface Props {
  tasks: TacticalTask[];
  columns: TacticalColumn[];
  objectives: TacticalObjective[];
}

function iceScore(t: TacticalTask) {
  const i = t.ice_impact ?? 5;
  const c = t.ice_confidence ?? 5;
  const e = t.ice_ease ?? 5;
  return i * c * e;
}

export function ExecutiveDashboard({ tasks, columns, objectives }: Props) {
  const now = new Date();

  const metrics = useMemo(() => {
    const total = tasks.length;
    const doneStatus = columns.find(c =>
      c.title.toLowerCase().includes('complet') || c.title.toLowerCase().includes('conclu')
    )?.title;
    const done = tasks.filter(t => t.status === doneStatus).length;
    const overdue = tasks.filter(t => {
      if (!t.due_date || t.status === doneStatus) return false;
      return new Date(t.due_date) < now;
    }).length;

    const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;

    // Lead time: days from created_at to now for completed tasks (approx)
    const completedTasks = tasks.filter(t => t.status === doneStatus && t.due_date);
    const avgLeadTime = completedTasks.length > 0
      ? Math.round(completedTasks.reduce((acc, t) => {
          const created = new Date(t.created_at);
          const due = t.due_date ? new Date(t.due_date) : now;
          return acc + Math.max(0, (due.getTime() - created.getTime()) / 86400000);
        }, 0) / completedTasks.length)
      : 0;

    // Bottlenecks: columns with > 4 tasks that aren't "done"
    const bottlenecks = columns.filter(col => {
      if (col.title === doneStatus) return false;
      return tasks.filter(t => t.status === col.title).length > 4;
    }).map(c => c.title);

    // By priority
    const highPriority = tasks.filter(t => t.priority === 'Alta');
    const highDone = highPriority.filter(t => t.status === doneStatus).length;
    const highRate = highPriority.length > 0
      ? Math.round((highDone / highPriority.length) * 100)
      : 0;

    // Avg ICE score
    const avgICE = tasks.length > 0
      ? Math.round(tasks.reduce((acc, t) => acc + iceScore(t), 0) / tasks.length)
      : 0;

    return { total, done, overdue, completionRate, avgLeadTime, bottlenecks, highRate, avgICE };
  }, [tasks, columns]);

  // OKR overall progress
  const okrProgress = useMemo(() => {
    if (!objectives.length) return 0;
    const all = objectives.flatMap(o => o.key_results || []);
    if (!all.length) return 0;
    return Math.round(all.reduce((acc, kr) => acc + (kr.progress ?? 0), 0) / all.length);
  }, [objectives]);

  // Tasks per strategic stage
  const stageData = useMemo(() => {
    return STRATEGIC_STAGES.map(stage => ({
      stage,
      count: tasks.filter(t => t.strategic_stage === stage).length,
    }));
  }, [tasks]);

  const kpiCard = (
    icon: React.ReactNode,
    label: string,
    value: string | number,
    sub: string,
    color: string,
    trend?: 'up' | 'down' | 'neutral'
  ) => (
    <div className={`bg-white dark:bg-[#1A1A1A] rounded-2xl p-5 border ${color} shadow-sm flex flex-col gap-2`}>
      <div className="flex items-center justify-between">
        <div className="p-2 rounded-lg bg-gray-50 dark:bg-[#111111]">{icon}</div>
        {trend === 'up' && <TrendingUp size={16} className="text-emerald-500" />}
        {trend === 'down' && <TrendingDown size={16} className="text-red-500" />}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{label}</p>
      </div>
      <p className="text-[11px] text-gray-400 dark:text-gray-500">{sub}</p>
    </div>
  );

  const progressColor = (pct: number) => {
    if (pct >= 70) return 'bg-emerald-500';
    if (pct >= 40) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const statusColor = (pct: number) => {
    if (pct >= 70) return 'text-emerald-500';
    if (pct >= 40) return 'text-amber-500';
    return 'text-red-500';
  };

  return (
    <div className="h-full overflow-y-auto custom-scrollbar pr-2 space-y-6">

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpiCard(
          <CheckCircle2 size={18} className="text-emerald-500" />,
          '% Tarefas Concluídas',
          `${metrics.completionRate}%`,
          `${metrics.done} de ${metrics.total} tarefas`,
          'border-gray-200 dark:border-[#222222]',
          metrics.completionRate >= 60 ? 'up' : 'down'
        )}
        {kpiCard(
          <Clock size={18} className="text-blue-500" />,
          'Lead Time Médio',
          `${metrics.avgLeadTime}d`,
          'dias do início até prazo',
          'border-gray-200 dark:border-[#222222]',
          'neutral'
        )}
        {kpiCard(
          <AlertTriangle size={18} className="text-red-500" />,
          'Tarefas Atrasadas',
          metrics.overdue,
          'passaram do prazo',
          metrics.overdue > 0
            ? 'border-red-200 dark:border-red-500/20'
            : 'border-gray-200 dark:border-[#222222]',
          metrics.overdue > 0 ? 'down' : 'up'
        )}
        {kpiCard(
          <Zap size={18} className="text-[#A0792E]" />,
          'ICE Score Médio',
          metrics.avgICE,
          'prioridade ponderada das tarefas',
          'border-gray-200 dark:border-[#222222]',
          'neutral'
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* OKR Progress */}
        <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl p-5 border border-gray-200 dark:border-[#222222] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Target size={16} className="text-[#A0792E]" /> Progresso OKRs
            </h3>
            <span className={`text-sm font-bold ${statusColor(okrProgress)}`}>{okrProgress}%</span>
          </div>

          {objectives.length === 0 ? (
            <p className="text-sm text-gray-400">Nenhum objetivo cadastrado. Acesse a aba OKRs.</p>
          ) : (
            <div className="space-y-4">
              {objectives.slice(0, 4).map(obj => {
                const krs = obj.key_results || [];
                const objProgress = krs.length > 0
                  ? Math.round(krs.reduce((acc, kr) => acc + (kr.progress ?? 0), 0) / krs.length)
                  : 0;
                return (
                  <div key={obj.id}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: obj.color }} />
                        <span className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate max-w-[180px]">{obj.title}</span>
                      </div>
                      <span className={`text-xs font-bold ${statusColor(objProgress)}`}>{objProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-[#111111] rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${progressColor(objProgress)}`}
                        style={{ width: `${objProgress}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Bottlenecks & Priority Rate */}
        <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl p-5 border border-gray-200 dark:border-[#222222] shadow-sm space-y-4">
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <BarChart3 size={16} className="text-[#A0792E]" /> Saúde da Execução
          </h3>

          {/* Priority completion */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600 dark:text-gray-400">Taxa de conclusão (Alta Prioridade)</span>
              <span className={`font-bold ${statusColor(metrics.highRate)}`}>{metrics.highRate}%</span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-[#111111] rounded-full h-2">
              <div
                className={`h-2 rounded-full ${progressColor(metrics.highRate)}`}
                style={{ width: `${metrics.highRate}%` }}
              />
            </div>
          </div>

          {/* Bottlenecks */}
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Gargalos detectados ({metrics.bottlenecks.length})
            </p>
            {metrics.bottlenecks.length === 0 ? (
              <p className="text-xs text-emerald-500 font-medium">Nenhum gargalo — fluxo saudável!</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {metrics.bottlenecks.map(col => (
                  <span key={col} className="px-2 py-1 text-xs font-medium bg-red-50 text-red-600 border border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20 rounded-md">
                    {col} (congestionado)
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Tasks by priority */}
          <div className="pt-2 border-t border-gray-100 dark:border-[#222222]">
            <p className="text-xs text-gray-500 mb-2">Distribuição por prioridade</p>
            <div className="flex gap-2">
              {(['Alta', 'Média', 'Baixa'] as const).map(p => {
                const count = tasks.filter(t => t.priority === p).length;
                const colors = {
                  Alta: 'bg-red-50 text-red-600 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20',
                  Média: 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
                  Baixa: 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
                };
                return (
                  <div key={p} className={`flex-1 text-center p-2 rounded-lg border text-xs font-bold ${colors[p]}`}>
                    <div className="text-lg">{count}</div>
                    <div>{p}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Strategic Funnel */}
      <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl p-5 border border-gray-200 dark:border-[#222222] shadow-sm">
        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
          <TrendingUp size={16} className="text-[#A0792E]" /> Visão Estratégica — Funil de Negócio
        </h3>
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {stageData.map((s, i) => (
            <div key={s.stage} className="flex items-center gap-2 shrink-0">
              <div className="text-center min-w-[100px]">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{s.count}</div>
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400">{s.stage}</div>
                <div className="mt-1 w-full h-1.5 bg-gray-100 dark:bg-[#111111] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#A0792E] to-[#D4A85C] rounded-full"
                    style={{ width: `${Math.min(100, s.count * 10)}%` }}
                  />
                </div>
              </div>
              {i < stageData.length - 1 && (
                <ArrowRight size={18} className="text-gray-300 dark:text-gray-600 shrink-0" />
              )}
            </div>
          ))}
          {stageData.every(s => s.count === 0) && (
            <p className="text-sm text-gray-400">
              Nenhuma tarefa vinculada a etapas estratégicas. Edite uma tarefa para definir a etapa.
            </p>
          )}
        </div>
      </div>

      {/* Stale Tasks Warning */}
      {(() => {
        const staleDays = 7;
        const staleTasks = tasks.filter(t => {
          const ref = t.status_changed_at || t.created_at;
          const days = (now.getTime() - new Date(ref).getTime()) / 86400000;
          const doneStatus = columns.find(c =>
            c.title.toLowerCase().includes('complet') || c.title.toLowerCase().includes('conclu')
          )?.title;
          return days > staleDays && t.status !== doneStatus;
        });
        if (!staleTasks.length) return null;
        return (
          <div className="bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20 rounded-2xl p-5">
            <h3 className="font-semibold text-amber-800 dark:text-amber-400 flex items-center gap-2 mb-3">
              <AlertTriangle size={16} /> {staleTasks.length} tarefa{staleTasks.length > 1 ? 's' : ''} parada{staleTasks.length > 1 ? 's' : ''} há mais de {staleDays} dias
            </h3>
            <div className="flex flex-wrap gap-2">
              {staleTasks.slice(0, 6).map(t => (
                <span key={t.id} className="px-2.5 py-1 text-xs font-medium bg-amber-100 dark:bg-amber-500/10 text-amber-800 dark:text-amber-300 rounded-lg border border-amber-200 dark:border-amber-500/20">
                  {t.title}
                </span>
              ))}
              {staleTasks.length > 6 && (
                <span className="px-2.5 py-1 text-xs text-amber-600 dark:text-amber-400">+{staleTasks.length - 6} mais</span>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
