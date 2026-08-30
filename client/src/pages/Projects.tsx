import React, { useState } from 'react';
import { 
  FolderKanban, 
  Plus, 
  CheckSquare, 
  FileText, 
  Video, 
  GitPullRequest, 
  Sparkles, 
  AlertTriangle, 
  Clock, 
  Users, 
  TrendingUp, 
  ChevronRight,
  Layers,
  ArrowRight
} from 'lucide-react';

interface Project {
  id: string;
  name: string;
  key: string;
  description: string;
  health: 'On Track' | 'At Risk' | 'Needs Attention';
  progress: number;
  membersCount: number;
  tasksCount: { total: number; done: number };
  docsCount: number;
  prsCount: number;
  aiInsight: string;
  milestones: Array<{ name: string; date: string; status: 'done' | 'active' | 'upcoming' }>;
}

const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    name: 'Enterprise Identity & Multi-Tenancy Platform',
    key: 'AUTH',
    description: 'Centralized authentication, role-based access control, and PostgreSQL tenant isolation.',
    health: 'On Track',
    progress: 85,
    membersCount: 4,
    tasksCount: { total: 14, done: 12 },
    docsCount: 3,
    prsCount: 2,
    aiInsight: 'All core database pooling and circuit breakers verified. Deployment ready for Friday.',
    milestones: [
      { name: 'Schema Migration & Indexing', date: 'Aug 20', status: 'done' },
      { name: 'Tenant Middleware & RBAC', date: 'Aug 26', status: 'done' },
      { name: 'Production Staging Audit', date: 'Sep 02', status: 'active' },
    ]
  },
  {
    id: 'proj-2',
    name: 'Customer AI Knowledge Base & RAG Engine',
    key: 'KNOW',
    description: 'High-throughput document indexing, 768-dim embeddings, and citation verification.',
    health: 'On Track',
    progress: 78,
    membersCount: 3,
    tasksCount: { total: 10, done: 7 },
    docsCount: 6,
    prsCount: 1,
    aiInsight: 'Vector search latency reduced to 180ms. Document auto-tagging taxonomy operational.',
    milestones: [
      { name: 'Chunking & Tokenizer Pipeline', date: 'Aug 18', status: 'done' },
      { name: 'Contextual RAG Citations', date: 'Aug 28', status: 'done' },
      { name: 'Policy Conflict Detector', date: 'Sep 05', status: 'active' },
    ]
  },
  {
    id: 'proj-3',
    name: 'Mobile Workforce Application v2.0',
    key: 'MOB',
    description: 'Cross-platform mobile client for standups, time-blocking, and push notifications.',
    health: 'At Risk',
    progress: 58,
    membersCount: 5,
    tasksCount: { total: 19, done: 8 },
    docsCount: 2,
    prsCount: 3,
    aiInsight: 'Warning: 3 blocked tasks detected in push notification handler. Potential 2-day delivery slip.',
    milestones: [
      { name: 'UI Component Kit', date: 'Aug 15', status: 'done' },
      { name: 'Offline State Sync', date: 'Aug 29', status: 'active' },
      { name: 'App Store Submission', date: 'Sep 15', status: 'upcoming' },
    ]
  }
];

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('proj-1');
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'docs' | 'code' | 'ai'>('overview');

  const selectedProject = projects.find(p => p.id === selectedProjectId) || projects[0];

  const navigateTo = (page: string) => {
    window.dispatchEvent(new CustomEvent('change_page', { detail: page }));
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto text-text-primary animate-fade-in font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-brand mb-1">
            <FolderKanban className="w-4 h-4" />
            <span>Connected Project Graph</span>
          </div>
          <h1 className="text-xl font-bold text-text-primary tracking-tight">
            Workspace Projects & Initiatives
          </h1>
          <p className="text-xs text-text-secondary mt-0.5">
            Connect high-level initiatives with tasks, documents, pull requests, and automated AI health risk forecasts.
          </p>
        </div>

        <button
          onClick={() => {
            const name = window.prompt('Enter new Project name:');
            if (!name || !name.trim()) return;
            const newProj: Project = {
              id: `proj_${Date.now()}`,
              name: name.trim(),
              key: name.substring(0, 3).toUpperCase(),
              description: 'Newly created initiative for workspace delivery.',
              health: 'On Track',
              progress: 0,
              membersCount: 1,
              tasksCount: { total: 0, done: 0 },
              docsCount: 0,
              prsCount: 0,
              aiInsight: 'Project initialized. Connect tasks and documents to enable AI tracking.',
              milestones: [{ name: 'Initiative Kickoff', date: 'Today', status: 'active' }]
            };
            setProjects(prev => [newProj, ...prev]);
            setSelectedProjectId(newProj.id);
          }}
          className="btn-primary px-3.5 py-1.5 text-xs flex items-center gap-1.5 shadow-subtle self-start"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Project</span>
        </button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {projects.map((proj) => (
          <div
            key={proj.id}
            onClick={() => setSelectedProjectId(proj.id)}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              selectedProjectId === proj.id
                ? 'bg-surface-elevated border-brand shadow-subtle'
                : 'card-base hover:border-border-active'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono text-text-muted bg-surface px-1.5 py-0.5 rounded border border-border">
                {proj.key}
              </span>
              <span
                className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded ${
                  proj.health === 'On Track'
                    ? 'bg-success/15 text-success border border-success/30'
                    : 'bg-warning/15 text-warning border border-warning/30'
                }`}
              >
                {proj.health}
              </span>
            </div>

            <h3 className="text-xs font-bold text-text-primary leading-snug line-clamp-1">{proj.name}</h3>
            <p className="text-[11px] text-text-secondary mt-1 line-clamp-2">{proj.description}</p>

            {/* Progress line */}
            <div className="mt-3 space-y-1">
              <div className="flex justify-between text-[10px] text-text-muted">
                <span>Velocity</span>
                <span className="font-semibold text-text-primary">{proj.progress}%</span>
              </div>
              <div className="w-full bg-surface h-1.5 rounded-full overflow-hidden border border-border">
                <div className="bg-brand h-full transition-all" style={{ width: `${proj.progress}%` }} />
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-border flex items-center justify-between text-[11px] text-text-muted">
              <span>{proj.tasksCount.done}/{proj.tasksCount.total} tasks</span>
              <span>{proj.docsCount} docs</span>
              <span>{proj.prsCount} PRs</span>
            </div>
          </div>
        ))}
      </div>

      {/* Selected Project Deep-Dive Panel */}
      <div className="card-base p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-brand font-bold">{selectedProject.key}</span>
              <h2 className="text-base font-bold text-text-primary">{selectedProject.name}</h2>
            </div>
            <p className="text-xs text-text-secondary mt-1">{selectedProject.description}</p>
          </div>

          <div className="flex gap-2">
            {(['overview', 'tasks', 'docs', 'code', 'ai'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                  activeTab === tab
                    ? 'bg-brand text-white'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-elevated'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Tab: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* AI Health Alert */}
            <div className="p-4 card-elevated border-l-2 border-l-brand flex items-start gap-3">
              <Sparkles className="w-4 h-4 text-brand flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="text-xs font-bold text-text-primary">AI Delivery Assessment</div>
                <p className="text-xs text-text-secondary leading-relaxed">{selectedProject.aiInsight}</p>
              </div>
            </div>

            {/* Milestones Roadmap */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary">Key Milestones Roadmap</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {selectedProject.milestones.map((m, idx) => (
                  <div key={idx} className="p-3 bg-surface-elevated rounded-lg border border-border space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-text-muted font-mono">{m.date}</span>
                      <span
                        className={`font-semibold uppercase ${
                          m.status === 'done' ? 'text-success' : m.status === 'active' ? 'text-brand' : 'text-text-muted'
                        }`}
                      >
                        {m.status}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-text-primary">{m.name}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions to Other Modules */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <button
                onClick={() => navigateTo('tasks')}
                className="p-3 bg-surface-elevated hover:bg-border rounded-lg border border-border text-left transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-2 text-xs font-semibold text-text-primary">
                  <CheckSquare className="w-4 h-4 text-brand" />
                  <span>Open Tasks Kanban</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-text-muted" />
              </button>

              <button
                onClick={() => navigateTo('documents')}
                className="p-3 bg-surface-elevated hover:bg-border rounded-lg border border-border text-left transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-2 text-xs font-semibold text-text-primary">
                  <FileText className="w-4 h-4 text-brand" />
                  <span>Linked Architecture Docs</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-text-muted" />
              </button>

              <button
                onClick={() => navigateTo('code-hub')}
                className="p-3 bg-surface-elevated hover:bg-border rounded-lg border border-border text-left transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-2 text-xs font-semibold text-text-primary">
                  <GitPullRequest className="w-4 h-4 text-brand" />
                  <span>Review Code & PRs</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-text-muted" />
              </button>
            </div>
          </div>
        )}

        {/* Tab: Tasks */}
        {activeTab === 'tasks' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-secondary">Showing linked tasks for {selectedProject.name}</span>
              <button onClick={() => navigateTo('tasks')} className="text-xs text-brand hover:underline">
                Open full Kanban board →
              </button>
            </div>
            <div className="space-y-2">
              <div className="p-3 bg-surface-elevated rounded-lg border border-border flex items-center justify-between text-xs">
                <span className="font-medium text-text-primary">Implement RBAC Middleware & Security Isolation</span>
                <span className="text-success font-semibold">Done ✓</span>
              </div>
              <div className="p-3 bg-surface-elevated rounded-lg border border-border flex items-center justify-between text-xs">
                <span className="font-medium text-text-primary">PostgreSQL Tenant Isolation Schema Indexing</span>
                <span className="text-brand font-semibold">In Progress</span>
              </div>
              <div className="p-3 bg-surface-elevated rounded-lg border border-border flex items-center justify-between text-xs">
                <span className="font-medium text-text-primary">Automated Regression Test Suite</span>
                <span className="text-warning font-semibold">Pending</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Docs */}
        {activeTab === 'docs' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-secondary">Linked project specifications & handbook references</span>
              <button onClick={() => navigateTo('documents')} className="text-xs text-brand hover:underline">
                Upload new doc →
              </button>
            </div>
            <div className="space-y-2">
              <div className="p-3 bg-surface-elevated rounded-lg border border-border flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-brand" />
                  <span className="font-semibold text-text-primary">MultiTenant_Architecture_Specs.docx</span>
                </div>
                <span className="text-text-muted">12 chunks • Indexed</span>
              </div>
              <div className="p-3 bg-surface-elevated rounded-lg border border-border flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-brand" />
                  <span className="font-semibold text-text-primary">Company_Employee_Handbook_2026.pdf</span>
                </div>
                <span className="text-text-muted">8 chunks • Indexed</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Code & PRs */}
        {activeTab === 'code' && (
          <div className="space-y-3">
            <span className="text-xs text-text-secondary">Active pull requests associated with {selectedProject.key}</span>
            <div className="space-y-2">
              <div className="p-3 bg-surface-elevated rounded-lg border border-border flex items-center justify-between text-xs">
                <div>
                  <div className="font-semibold text-text-primary">PR #184: Multi-tenant database pooling & circuit breaker</div>
                  <div className="text-[11px] text-text-muted">Author: Rahul V. • 2 commits</div>
                </div>
                <button onClick={() => navigateTo('code-hub')} className="btn-secondary px-2.5 py-1 text-xs">
                  Review
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab: AI Insights */}
        {activeTab === 'ai' && (
          <div className="space-y-4">
            <div className="p-4 bg-surface-elevated rounded-xl border border-border space-y-2">
              <div className="text-xs font-bold text-text-primary flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand" />
                <span>Automated Risk Mitigation Strategy</span>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                Based on historical commit velocity and current test coverage (87%), Prodexa predicts project delivery on schedule with zero critical blockers.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
