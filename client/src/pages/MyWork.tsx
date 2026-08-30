import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, 
  Clock, 
  GitPullRequest, 
  Video, 
  Sparkles, 
  AlertTriangle, 
  ArrowRight, 
  CheckCircle2, 
  UserCheck, 
  Calendar,
  Layers,
  ChevronRight
} from 'lucide-react';
import { api } from '../lib/api';

export default function MyWork() {
  const [userName] = useState(localStorage.getItem('user_name') || 'Parth');
  const [tasks, setTasks] = useState<any[]>([
    { id: 't-1', title: 'Implement RBAC Middleware & Security Isolation', project: 'Identity Platform', deadline: 'Today (17:00)', priority: 'High', status: 'in-progress' },
    { id: 't-2', title: 'Review Sprint Velocity & Capacity Allocation', project: 'Core Workspace', deadline: 'Today (18:30)', priority: 'Medium', status: 'pending' },
    { id: 't-3', title: 'Verify Gemini RAG Grounded Vector Responses', project: 'Knowledge Base', deadline: 'Tomorrow', priority: 'High', status: 'pending' },
  ]);

  const [prReviews, setPrReviews] = useState<any[]>([
    { id: 'pr-184', title: 'PR #184: Multi-tenant database pooling & circuit breaker', author: 'Rahul V.', status: 'Waiting for your review', time: '1h ago', critical: false },
    { id: 'pr-189', title: 'PR #189: Strict TypeScript schemas & Zod validators', author: 'Ananya S.', status: 'Changes requested', time: '3h ago', critical: true },
  ]);

  const [aiActions, setAiActions] = useState<any[]>([
    { id: 'act-1', text: 'Move task TASK-249 to next sprint to prevent team overload', reason: 'Developer capacity is at 92%', applied: false },
    { id: 'act-2', text: 'Attach Employee Handbook 2026 citation to HR leave inquiry', reason: 'High confidence RAG match found', applied: false },
  ]);

  const handleCompleteTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: 'done' } : t));
  };

  const handleApplyAiAction = (id: string) => {
    setAiActions(prev => prev.map(a => a.id === id ? { ...a, applied: true } : a));
  };

  const navigateTo = (page: string) => {
    window.dispatchEvent(new CustomEvent('change_page', { detail: page }));
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Good morning';
    if (hour >= 12 && hour < 17) return 'Good afternoon';
    if (hour >= 17 && hour < 22) return 'Good evening';
    return 'Good night';
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto text-text-primary animate-fade-in font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-brand mb-1">
            <UserCheck className="w-4 h-4" />
            <span>Personal Command Center</span>
          </div>
          <h1 className="text-xl font-bold text-text-primary tracking-tight">
            {getGreeting()}, {userName.split(' ')[0]} 👋
          </h1>
          <p className="text-xs text-text-secondary mt-0.5">
            Here is your curated priority list, assigned work, code reviews, and AI recommendations for today.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateTo('tasks')}
            className="btn-secondary px-3.5 py-1.5 text-xs flex items-center gap-1.5"
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>View Kanban</span>
          </button>
          <button
            onClick={() => navigateTo('dashboard')}
            className="btn-primary px-3.5 py-1.5 text-xs flex items-center gap-1.5 shadow-subtle"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Schedule Focus Time</span>
          </button>
        </div>
      </div>

      {/* Focus Status Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="card-base p-3.5">
          <span className="text-[11px] text-text-muted font-medium">Tasks Due Today</span>
          <div className="text-xl font-bold text-text-primary mt-1">2 <span className="text-xs font-normal text-text-secondary">active</span></div>
        </div>
        <div className="card-base p-3.5">
          <span className="text-[11px] text-text-muted font-medium">PR Reviews Waiting</span>
          <div className="text-xl font-bold text-text-primary mt-1">2 <span className="text-xs font-normal text-text-secondary">pull requests</span></div>
        </div>
        <div className="card-base p-3.5">
          <span className="text-[11px] text-text-muted font-medium">Next Meeting</span>
          <div className="text-sm font-bold text-text-primary mt-1 truncate">14:00 • Sprint Sync</div>
        </div>
        <div className="card-base p-3.5">
          <span className="text-[11px] text-text-muted font-medium">Deep Work Velocity</span>
          <div className="text-xl font-bold text-success mt-1">94% <span className="text-xs font-normal text-text-secondary">optimal</span></div>
        </div>
      </div>

      {/* AI Suggested Actions Bar (P0: AI Actions, not only AI answers) */}
      <div className="card-elevated p-4 border-l-2 border-l-brand space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand" />
            <h3 className="text-xs font-bold text-text-primary">AI Action Recommendations</h3>
          </div>
          <span className="text-[10px] text-text-muted uppercase tracking-wider">Automated Triaging</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {aiActions.map((act) => (
            <div key={act.id} className="p-3 bg-surface rounded-lg border border-border flex items-start justify-between gap-3">
              <div>
                <p className="text-xs text-text-primary font-medium">{act.text}</p>
                <span className="text-[10px] text-text-muted mt-1 block">Reason: {act.reason}</span>
              </div>
              <button
                disabled={act.applied}
                onClick={() => handleApplyAiAction(act.id)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-all flex-shrink-0 ${
                  act.applied
                    ? 'bg-success/15 text-success border border-success/30'
                    : 'btn-primary text-xs'
                }`}
              >
                {act.applied ? 'Applied ✓' : 'Apply Action'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Two Column Workfeed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: My Assigned Tasks */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-text-secondary flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-brand" />
              Assigned Tasks Requiring Attention
            </h2>
            <span className="text-xs text-text-muted">{tasks.filter(t => t.status !== 'done').length} remaining</span>
          </div>

          <div className="space-y-2.5">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={`p-4 card-base hover:border-border-active transition-colors flex items-start justify-between gap-4 ${
                  task.status === 'done' ? 'opacity-60 bg-surface/40' : ''
                }`}
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-text-muted bg-surface-elevated px-1.5 py-0.5 rounded border border-border">
                      {task.project}
                    </span>
                    <span
                      className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded ${
                        task.priority === 'High' ? 'bg-danger/15 text-danger border border-danger/30' : 'bg-warning/15 text-warning border border-warning/30'
                      }`}
                    >
                      {task.priority}
                    </span>
                  </div>
                  <h3 className={`text-xs font-semibold text-text-primary ${task.status === 'done' ? 'line-through text-text-muted' : ''}`}>
                    {task.title}
                  </h3>
                  <div className="flex items-center gap-2 text-[11px] text-text-muted">
                    <Clock className="w-3 h-3" />
                    <span>Due {task.deadline}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleCompleteTask(task.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    task.status === 'done'
                      ? 'bg-success/15 text-success border border-success/30'
                      : 'btn-secondary hover:border-success/50 hover:text-success'
                  }`}
                >
                  {task.status === 'done' ? 'Completed ✓' : 'Mark Done'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Pull Requests & Standups */}
        <div className="space-y-6">
          {/* PR Reviews */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-text-secondary flex items-center gap-2">
                <GitPullRequest className="w-4 h-4 text-purple-400" />
                Code Reviews Waiting
              </h2>
            </div>

            <div className="space-y-2">
              {prReviews.map((pr) => (
                <div
                  key={pr.id}
                  onClick={() => navigateTo('code-hub')}
                  className="p-3 card-base hover:border-border-active cursor-pointer transition-colors space-y-1 group"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-text-primary group-hover:text-brand transition-colors">{pr.id}</span>
                    <span className="text-text-muted">{pr.time}</span>
                  </div>
                  <p className="text-xs text-text-secondary leading-snug">{pr.title}</p>
                  <div className="text-[10px] text-text-muted flex items-center justify-between pt-1">
                    <span>By {pr.author}</span>
                    <span className="text-brand font-medium">Review Code →</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Meeting Card */}
          <div className="card-elevated p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4 text-brand" />
                <h3 className="text-xs font-bold text-text-primary">Next Synchronous Sync</h3>
              </div>
              <span className="text-[10px] text-brand bg-brand/10 px-2 py-0.5 rounded border border-brand/20">In 35m</span>
            </div>
            <p className="text-xs font-semibold text-text-primary">Engineering Architecture & Auth Discussion</p>
            <p className="text-[11px] text-text-secondary">Verify Supabase database migration and JWT refresh token flows.</p>
            <button
              onClick={() => navigateTo('meetings')}
              className="w-full mt-2 py-1.5 btn-secondary text-xs flex items-center justify-center gap-1.5"
            >
              <span>Open Meeting Notes & Transcript</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
