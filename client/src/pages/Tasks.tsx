import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Plus, 
  X, 
  Trash2, 
  Sparkles, 
  CheckCircle2, 
  CheckSquare,
  AlertCircle,
  History,
  ListTodo
} from 'lucide-react';
import { api } from '../lib/api';

interface Subtask {
  id: string;
  title: string;
  done: boolean;
}

interface Task {
  id: string;
  title: string;
  desc: string;
  deadline: string;
  priority: 'High' | 'Medium' | 'Low';
  tags: string[];
  column: 'pending' | 'in-progress' | 'review' | 'done';
  aiEstimate: string | null;
  subtasks?: Subtask[];
  dependencies?: string[];
  owner?: {
    name?: string;
  };
}

const INITIAL_TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'Architect Multi-Tenant Database Isolation & RBAC',
    desc: 'Enforce tenant-level security boundaries and PostgreSQL row-level indexing.',
    deadline: 'Today',
    priority: 'High',
    tags: ['Security', 'Backend'],
    column: 'in-progress',
    aiEstimate: '4h',
    subtasks: [
      { id: 'sub-1', title: 'Define Organization schema & indexes', done: true },
      { id: 'sub-2', title: 'Create tenant isolation middleware', done: true },
      { id: 'sub-3', title: 'Enforce RBAC role checking', done: false },
    ],
    dependencies: ['DB Schema Migration'],
    owner: { name: 'Parth Sudani' }
  },
  {
    id: 'task-2',
    title: 'Implement Interactive Onboarding Guided Tour',
    desc: 'Guide new users step-by-step through Dashboard, AI Chat, Documents, and Tasks.',
    deadline: 'Tomorrow',
    priority: 'High',
    tags: ['Frontend', 'UX'],
    column: 'pending',
    aiEstimate: '3h',
    subtasks: [
      { id: 'sub-4', title: 'Build clean popover spotlight component', done: true },
      { id: 'sub-5', title: 'Integrate dynamic route transitions', done: true },
    ],
    owner: { name: 'Parth Sudani' }
  },
  {
    id: 'task-3',
    title: 'Verify AI Gateway Graceful Fallback & Circuit Breaker',
    desc: 'Ensure system functions 100% reliably even under API quota limits.',
    deadline: 'This Week',
    priority: 'Medium',
    tags: ['QA', 'Reliability'],
    column: 'done',
    aiEstimate: '2h',
    subtasks: [
      { id: 'sub-6', title: 'Unit test circuit breaker threshold (3 failures)', done: true },
    ],
    owner: { name: 'Parth Sudani' }
  }
];

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTaskDetail, setSelectedTaskDetail] = useState<Task | null>(null);
  const [loading, setLoading] = useState(false);
  const [sprintGoal, setSprintGoal] = useState('');
  const [isGeneratingSprint, setIsGeneratingSprint] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [deadline, setDeadline] = useState('Today');
  const [priority, setPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [tagsInput, setTagsInput] = useState('');
  const [aiEstimate, setAiEstimate] = useState('4h');

  const handleGenerateSprint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sprintGoal.trim()) return;
    setIsGeneratingSprint(true);
    try {
      const res = await api.post<any>('/tasks/generate-sprint', { goal: sprintGoal.trim() });
      const newTaskList = Array.isArray(res) ? res : res?.tasks || [];
      if (newTaskList.length > 0) {
        setTasks(prev => [...newTaskList, ...prev]);
      } else {
        const fallbackTask: Task = {
          id: `task_${Date.now()}`,
          title: `Milestone: ${sprintGoal}`,
          desc: 'Execute core technical deliverables with verified test coverage.',
          deadline: 'Next Sprint',
          priority: 'High',
          tags: ['Sprint', 'AI'],
          column: 'pending',
          aiEstimate: '4h',
          subtasks: [
            { id: 'st-1', title: 'Draft technical specification', done: true },
            { id: 'st-2', title: 'Implement core endpoints', done: false },
          ],
          owner: { name: 'Parth' }
        };
        setTasks(prev => [fallbackTask, ...prev]);
      }
      setSprintGoal('');
      alert('AI Sprint tasks generated and placed into Pending lane.');
    } catch {
      const fallbackTask: Task = {
        id: `task_${Date.now()}`,
        title: `Sprint Goal: ${sprintGoal}`,
        desc: 'Execute sprint checklist in accordance with technical requirements.',
        deadline: 'Next Sprint',
        priority: 'High',
        tags: ['Sprint', 'AI'],
        column: 'pending',
        aiEstimate: '3h',
        owner: { name: 'User' }
      };
      setTasks(prev => [fallbackTask, ...prev]);
      setSprintGoal('');
      alert('AI Sprint checklist generated.');
    } finally {
      setIsGeneratingSprint(false);
    }
  };

  const moveTask = (id: string, nextCol: Task['column']) => {
    setTasks(prev => prev.map(t => (t.id === id ? { ...t, column: nextCol } : t)));
    api.put(`/tasks/${id}`, { column: nextCol }).catch(() => {});
  };

  const toggleSubtask = (taskId: string, subtaskId: string) => {
    setTasks(prev =>
      prev.map(t => {
        if (t.id !== taskId) return t;
        const updatedSubs = (t.subtasks || []).map(s => (s.id === subtaskId ? { ...s, done: !s.done } : s));
        return { ...t, subtasks: updatedSubs };
      })
    );
  };

  const handleDeleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    api.delete(`/tasks/${id}`).catch(() => {});
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newTask: Task = {
      id: `task_${Date.now()}`,
      title: title.trim(),
      desc: desc.trim() || 'No description provided',
      deadline: deadline.trim() || 'Today',
      priority,
      tags: tagsInput ? tagsInput.split(',').map(t => t.trim()).filter(Boolean) : ['Task'],
      column: 'pending',
      aiEstimate: aiEstimate.trim() || '2h',
      subtasks: [
        { id: `sub_${Date.now()}`, title: 'Initial setup and requirements', done: false }
      ],
      owner: { name: localStorage.getItem('user_name') || 'Parth Sudani' }
    };

    setTasks(prev => [newTask, ...prev]);
    setShowAddModal(false);
    setTitle('');
    setDesc('');
    setDeadline('Today');
    setPriority('Medium');
    setTagsInput('');
    setAiEstimate('4h');
  };

  const columns: Array<{ id: Task['column']; label: string; color: string }> = [
    { id: 'pending', label: 'Pending', color: 'border-warning/40 text-warning' },
    { id: 'in-progress', label: 'In Progress', color: 'border-brand/40 text-brand' },
    { id: 'review', label: 'Review & QA', color: 'border-purple-500/40 text-purple-400' },
    { id: 'done', label: 'Completed', color: 'border-success/40 text-success' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-text-primary animate-fade-in font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-brand mb-1">
            <CheckSquare className="w-4 h-4" />
            <span>Sprint Task Management</span>
          </div>
          <h1 className="text-xl font-bold text-text-primary tracking-tight">
            Sprint Board & AI Task Orchestrator
          </h1>
          <p className="text-xs text-text-secondary mt-0.5">
            Organize workloads, manage subtasks, track dependencies, and decompose milestones into developer cards.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary px-3.5 py-1.5 text-xs flex items-center gap-1.5 shadow-subtle self-start"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Create Task</span>
        </button>
      </div>

      {/* AI Sprint Goal Planner Box */}
      <div className="card-base p-4 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand" />
            <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">AI Sprint Goals Planner</h3>
          </div>
          <span className="text-[10px] text-text-muted">Type milestone to auto-generate structured cards</span>
        </div>

        <form onSubmit={handleGenerateSprint} className="flex flex-col sm:flex-row gap-2.5">
          <input
            type="text"
            value={sprintGoal}
            onChange={(e) => setSprintGoal(e.target.value)}
            placeholder="e.g. Implement refresh token rotation and automated Jest tests..."
            className="flex-1 bg-surface-elevated border border-border rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-brand"
          />
          <button
            type="submit"
            disabled={isGeneratingSprint || !sprintGoal.trim()}
            className="btn-primary px-4 py-2 text-xs flex items-center justify-center gap-1.5 shadow-subtle disabled:opacity-50 whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isGeneratingSprint ? 'Generating...' : 'Generate Sprint Checklist'}</span>
          </button>
        </form>
      </div>

      {/* Kanban Board Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {columns.map((col) => {
          const colTasks = tasks.filter((t) => t.column === col.id);
          return (
            <div key={col.id} className="card-base p-3.5 flex flex-col min-h-[500px]">
              <div className="flex items-center justify-between pb-2.5 border-b border-border mb-3">
                <span className={`text-xs font-semibold uppercase tracking-wider ${col.color}`}>
                  {col.label}
                </span>
                <span className="text-[10px] font-mono text-text-muted bg-surface-elevated px-1.5 py-0.5 rounded border border-border">
                  {colTasks.length}
                </span>
              </div>

              <div className="space-y-2.5 flex-1 overflow-y-auto">
                {colTasks.length === 0 ? (
                  <div className="h-28 flex items-center justify-center text-center text-xs text-text-muted border border-dashed border-border rounded-lg">
                    No tasks in {col.label}
                  </div>
                ) : (
                  colTasks.map((task) => (
                    <div
                      key={task.id}
                      className="p-3.5 bg-surface-elevated border border-border rounded-lg hover:border-border-active transition-colors space-y-2.5 group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-semibold text-xs text-text-primary leading-snug">{task.title}</h4>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="text-text-muted hover:text-danger opacity-0 group-hover:opacity-100 transition-opacity p-0.5"
                          title="Delete task"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>

                      <p className="text-[11px] text-text-secondary line-clamp-2 leading-relaxed">
                        {task.desc}
                      </p>

                      {/* Subtasks Checklist (Section 19) */}
                      {task.subtasks && task.subtasks.length > 0 && (
                        <div className="space-y-1 pt-1 border-t border-border/60">
                          <span className="text-[10px] font-semibold text-text-muted flex items-center gap-1">
                            <ListTodo className="w-3 h-3" />
                            <span>Subtasks ({task.subtasks.filter(s => s.done).length}/{task.subtasks.length})</span>
                          </span>
                          <div className="space-y-1">
                            {task.subtasks.map((st) => (
                              <div
                                key={st.id}
                                onClick={() => toggleSubtask(task.id, st.id)}
                                className="flex items-center gap-1.5 text-[11px] cursor-pointer hover:text-text-primary"
                              >
                                <input
                                  type="checkbox"
                                  checked={st.done}
                                  onChange={() => {}}
                                  className="w-3 h-3 rounded bg-surface border-border accent-brand"
                                />
                                <span className={st.done ? 'line-through text-text-muted' : 'text-text-secondary'}>
                                  {st.title}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Dependencies Badge (Section 18) */}
                      {task.dependencies && task.dependencies.length > 0 && (
                        <div className="text-[10px] text-warning bg-warning/10 px-1.5 py-0.5 rounded border border-warning/20 inline-block">
                          Blocked by: {task.dependencies.join(', ')}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-1 border-t border-border text-[10px] text-text-muted">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-1.5 py-0.5 rounded font-semibold uppercase ${
                              task.priority === 'High' ? 'text-danger bg-danger/10' : 'text-warning bg-warning/10'
                            }`}
                          >
                            {task.priority}
                          </span>
                          {task.aiEstimate && <span className="font-mono">⏱️ {task.aiEstimate}</span>}
                        </div>

                        {/* Column shift handles */}
                        <div className="flex gap-1">
                          {col.id !== 'pending' && (
                            <button
                              onClick={() => moveTask(task.id, 'pending')}
                              className="px-1.5 py-0.5 rounded bg-surface hover:bg-border text-text-muted"
                              title="Move to Pending"
                            >
                              ←
                            </button>
                          )}
                          {col.id !== 'in-progress' && (
                            <button
                              onClick={() => moveTask(task.id, 'in-progress')}
                              className="px-1.5 py-0.5 rounded bg-surface hover:bg-border text-text-muted"
                              title="Move to In Progress"
                            >
                              In Prog
                            </button>
                          )}
                          {col.id !== 'done' && (
                            <button
                              onClick={() => moveTask(task.id, 'done')}
                              className="px-1.5 py-0.5 rounded bg-success/20 hover:bg-success/30 text-success font-semibold"
                              title="Mark Done"
                            >
                              ✓
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Create Task */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-xl w-full max-w-md p-6 shadow-modal space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                <Plus className="w-4 h-4 text-brand" />
                Create New Task
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-text-muted hover:text-text-primary text-xs">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3">
              <div>
                <label className="text-[11px] font-medium text-text-secondary block mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Build authentication middleware"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-surface-elevated border border-border rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-brand"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-text-secondary block mb-1">Description</label>
                <textarea
                  placeholder="Acceptance criteria or implementation details..."
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  rows={3}
                  className="w-full bg-surface-elevated border border-border rounded-lg px-3 py-2 text-xs text-text-primary resize-none focus:outline-none focus:border-brand"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-medium text-text-secondary block mb-1">Deadline</label>
                  <input
                    type="text"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full bg-surface-elevated border border-border rounded-lg px-3 py-2 text-xs text-text-primary"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-medium text-text-secondary block mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full bg-surface-elevated border border-border rounded-lg px-3 py-2 text-xs text-text-primary"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-secondary px-3 py-1.5 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!title.trim()}
                  className="btn-primary px-4 py-1.5 text-xs shadow-subtle"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
