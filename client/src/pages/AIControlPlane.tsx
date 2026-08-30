import React, { useState } from 'react';
import { 
  Sparkles, 
  Bot, 
  CheckCircle2, 
  XCircle, 
  Sliders, 
  Zap, 
  ShieldAlert, 
  History, 
  ArrowRight, 
  Play, 
  DollarSign, 
  Clock, 
  AlertTriangle,
  FileText,
  UserCheck,
  CheckSquare
} from 'lucide-react';

interface ApprovalItem {
  id: string;
  agent: string;
  action: string;
  target: string;
  reason: string;
  impact: string;
  timestamp: string;
  status: 'pending' | 'approved' | 'rejected';
}

export default function AIControlPlane() {
  const [activeTab, setActiveTab] = useState<'pulse' | 'agents' | 'approvals' | 'automations' | 'policies'>('pulse');

  // Approvals State
  const [approvals, setApprovals] = useState<ApprovalItem[]>([
    {
      id: 'app-1',
      agent: 'Project Manager Agent',
      action: 'Reallocate Sprint 25 Lane',
      target: 'Move TASK-249 to Sprint 26',
      reason: 'Developer workload is at 94% capacity; mitigates 2-day delivery slip risk.',
      impact: '+ 1 Task Deferred, 0 Blocker Overhead',
      timestamp: '12m ago',
      status: 'pending'
    },
    {
      id: 'app-2',
      agent: 'Security Remediation Agent',
      action: 'Apply Parameterized Query Patch',
      target: 'server/src/routes/auth.ts:42',
      reason: 'SQL injection hazard detected in raw request body concatenation.',
      impact: 'Eliminates critical auth vulnerability',
      timestamp: '35m ago',
      status: 'pending'
    },
    {
      id: 'app-3',
      agent: 'Documentation Agent',
      action: 'Update Knowledge Base Citation',
      target: 'Employee Handbook 2026 (v4)',
      reason: 'Synchronize authoritative leave policy (24 days) across vector embeddings.',
      impact: 'RAG confidence upgraded to 99%',
      timestamp: '1h ago',
      status: 'approved'
    }
  ]);

  // Policy States
  const [externalWebAccess, setExternalWebAccess] = useState(false);
  const [requireHighRiskApproval, setRequireHighRiskApproval] = useState(true);
  const [monthlyBudget, setMonthlyBudget] = useState(500);
  const [currentSpent] = useState(184);

  const handleApprove = (id: string) => {
    setApprovals(prev => prev.map(a => a.id === id ? { ...a, status: 'approved' } : a));
    alert('AI action approved and executed across the workspace.');
  };

  const handleReject = (id: string) => {
    setApprovals(prev => prev.map(a => a.id === id ? { ...a, status: 'rejected' } : a));
  };

  const navigateTo = (page: string) => {
    window.dispatchEvent(new CustomEvent('change_page', { detail: page }));
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto text-text-primary animate-fade-in font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-brand mb-1">
            <Bot className="w-4 h-4" />
            <span>Autonomous Intelligence & Governance</span>
          </div>
          <h1 className="text-xl font-bold text-text-primary tracking-tight">
            AI Control Plane & Prodexa Pulse
          </h1>
          <p className="text-xs text-text-secondary mt-0.5">
            Monitor autonomous agent workflows, review approval queues, configure safety policies, and track measurable ROI.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex p-0.5 bg-surface-elevated rounded-lg border border-border self-start">
          {(['pulse', 'agents', 'approvals', 'automations', 'policies'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 text-xs font-medium rounded capitalize transition-all ${
                activeTab === tab
                  ? 'bg-brand text-white shadow-subtle'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {tab === 'pulse' ? '⚡ Prodexa Pulse' : tab}
            </button>
          ))}
        </div>
      </div>

      {/* ─── TAB 1: FLAGSHIP PRODEXA PULSE (Part 21) ────────────────────── */}
      {activeTab === 'pulse' && (
        <div className="space-y-6">
          {/* Daily Briefing Banner */}
          <div className="card-elevated p-6 border-l-2 border-l-brand space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-brand uppercase tracking-widest">
                Daily Workspace Intelligence Brief
              </span>
              <span className="text-xs font-mono text-text-muted">
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • System Live
              </span>
            </div>

            <h2 className="text-base font-bold text-text-primary leading-snug">
              {new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : new Date().getHours() < 22 ? 'Good evening' : 'Good night'}, Parth. Here is what changed across your workspace.
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
              <div className="p-3 bg-surface rounded-lg border border-border space-y-1">
                <span className="text-[10px] text-warning font-semibold uppercase">Project Delivery Risk</span>
                <p className="text-xs font-bold text-text-primary">Identity Platform: +8h work added</p>
                <span className="text-[11px] text-text-muted">Sprint deadline may slip ~1.5 days if unmitigated.</span>
              </div>

              <div className="p-3 bg-surface rounded-lg border border-border space-y-1">
                <span className="text-[10px] text-success font-semibold uppercase">Sprint Output</span>
                <p className="text-xs font-bold text-text-primary">18 Tasks Completed</p>
                <span className="text-[11px] text-text-muted">7 AI autonomous actions executed safely.</span>
              </div>

              <div className="p-3 bg-surface rounded-lg border border-border space-y-1">
                <span className="text-[10px] text-danger font-semibold uppercase">Team Blocker Alert</span>
                <p className="text-xs font-bold text-text-primary">Rahul is blocked on AUTH-104</p>
                <span className="text-[11px] text-text-muted">Awaiting staging DB connection string review.</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-border/70 text-xs">
              <div className="flex items-center gap-2 text-text-secondary">
                <Clock className="w-3.5 h-3.5 text-brand" />
                <span>Today's Focus: 09:30 Standup Sync • 11:00 Deep Work • 14:00 PR Review</span>
              </div>
              <button
                onClick={() => navigateTo('my-work')}
                className="btn-primary px-3 py-1 text-xs flex items-center gap-1 shadow-subtle"
              >
                <span>Open My Work</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* AI Impact & ROI Breakdown (Part 15) */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="card-base p-4">
              <span className="text-[11px] text-text-muted font-medium">Estimated Time Saved</span>
              <div className="text-xl font-bold text-success mt-1">126 hours</div>
              <span className="text-[10px] text-text-muted mt-0.5 block">Across 482 AI tasks</span>
            </div>
            <div className="card-base p-4">
              <span className="text-[11px] text-text-muted font-medium">Meetings Summarized</span>
              <div className="text-xl font-bold text-text-primary mt-1">38 meetings</div>
              <span className="text-[10px] text-text-muted mt-0.5 block">100% action items converted</span>
            </div>
            <div className="card-base p-4">
              <span className="text-[11px] text-text-muted font-medium">Security Vulnerabilities Caught</span>
              <div className="text-xl font-bold text-brand mt-1">64 issues</div>
              <span className="text-[10px] text-text-muted mt-0.5 block">Zero production regressions</span>
            </div>
            <div className="card-base p-4">
              <span className="text-[11px] text-text-muted font-medium">Monthly AI Budget</span>
              <div className="text-xl font-bold text-text-primary mt-1">${currentSpent} <span className="text-xs font-normal text-text-secondary">/ ${monthlyBudget}</span></div>
              <span className="text-[10px] text-success mt-0.5 block">36% of limit utilized</span>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 2: SPECIALIZED AGENTS (Part 4, Change 13) ────────────────── */}
      {activeTab === 'agents' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                name: 'Project Manager Agent',
                role: 'Sprint Planning & Dependency Triaging',
                status: 'Active',
                capabilities: ['Deconstructs PRD goals into Kanban cards', 'Identifies blocked developer dependencies', 'Predicts sprint delivery slip risks'],
                recentOutput: 'Analyzed Sprint 25 backlog. Proposed deferring 1 task to prevent overload.'
              },
              {
                name: 'Security Remediation Agent',
                role: 'Static Code & Vulnerability Scanning',
                status: 'Active',
                capabilities: ['Audits SQL query parameterization', 'Checks JWT expiration and secret exposure', 'Suggests side-by-side refactoring diffs'],
                recentOutput: 'Scanned 8 files. Generated 2 parameterized query patches.'
              },
              {
                name: 'Documentation & RAG Agent',
                role: 'Knowledge Indexing & Policy Verification',
                status: 'Active',
                capabilities: ['Chunks PDF and DOCX files into 768-dim vectors', 'Resolves conflicting handbook policy versions', 'Attaches verified section citations'],
                recentOutput: 'Reconciled Employee Handbook 2026 Section 5.2.'
              },
              {
                name: 'Meeting Synthesis Agent',
                role: 'Action Item & Decision Extraction',
                status: 'Active',
                capabilities: ['Extracts decisions and action items from transcripts', 'Assigns developer owners automatically', 'Dispatches cards into Kanban pending lanes'],
                recentOutput: 'Synthesized Engineering Sync. Created 3 tasks.'
              }
            ].map((agent, idx) => (
              <div key={idx} className="card-base p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bot className="w-4 h-4 text-brand" />
                    <h3 className="text-xs font-bold text-text-primary">{agent.name}</h3>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-success/15 text-success border border-success/30">
                    {agent.status}
                  </span>
                </div>

                <p className="text-[11px] text-text-muted">{agent.role}</p>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-text-muted uppercase">Capabilities:</span>
                  <ul className="space-y-0.5 text-xs text-text-secondary">
                    {agent.capabilities.map((c, i) => (
                      <li key={i} className="flex items-center gap-1.5 text-[11px]">
                        <CheckCircle2 className="w-3 h-3 text-brand" />
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-2.5 bg-surface-elevated rounded border border-border text-[11px] text-text-secondary">
                  <span className="font-semibold text-text-primary">Recent Run: </span>
                  {agent.recentOutput}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── TAB 3: APPROVAL INBOX (Part 4, Changes 14, 15) ──────────────── */}
      {activeTab === 'approvals' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-secondary">
              High-impact AI recommendations requiring human review before execution.
            </span>
            <span className="text-xs font-mono text-text-muted">
              {approvals.filter(a => a.status === 'pending').length} pending approvals
            </span>
          </div>

          <div className="space-y-3">
            {approvals.map((app) => (
              <div
                key={app.id}
                className={`p-4 card-base border ${
                  app.status === 'approved' ? 'border-success/30 bg-success/5' : 'border-border'
                } space-y-3`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-brand bg-brand-muted px-1.5 py-0.5 rounded">
                        {app.agent}
                      </span>
                      <span className="text-xs font-bold text-text-primary">{app.action}</span>
                      <span className="text-[10px] text-text-muted">• {app.timestamp}</span>
                    </div>
                    <p className="text-xs text-text-primary font-medium">Target: {app.target}</p>
                  </div>

                  {app.status === 'approved' ? (
                    <span className="text-xs font-semibold text-success flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Approved & Executed
                    </span>
                  ) : app.status === 'rejected' ? (
                    <span className="text-xs text-text-muted">Rejected</span>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleReject(app.id)}
                        className="btn-secondary px-3 py-1 text-xs"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleApprove(app.id)}
                        className="btn-primary px-3.5 py-1 text-xs shadow-subtle"
                      >
                        Approve & Execute
                      </button>
                    </div>
                  )}
                </div>

                <div className="p-2.5 bg-surface-elevated rounded border border-border text-xs space-y-1">
                  <div><span className="text-text-muted">Reasoning: </span><span className="text-text-secondary">{app.reason}</span></div>
                  <div><span className="text-text-muted">Projected Impact: </span><span className="text-success font-medium">{app.impact}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── TAB 4: AUTOMATIONS (Part 4, Change 43) ──────────────────────── */}
      {activeTab === 'automations' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                title: 'Automated PR Security Review',
                trigger: 'WHEN Pull Request is opened',
                action: 'THEN Run Security & Bug Scanner',
                subAction: 'IF Critical Vulnerability found THEN Create P0 Task & Notify Manager',
                active: true
              },
              {
                title: 'Meeting Synthesis to Task Pipeline',
                trigger: 'WHEN Meeting recording is uploaded',
                action: 'THEN Extract Decisions & Action Items',
                subAction: 'THEN Dispatch tasks into Pending lane with AI time estimates',
                active: true
              },
              {
                title: 'Knowledge Conflict Auto-Resolver',
                trigger: 'WHEN New PDF/DOCX policy is uploaded',
                action: 'THEN Compare with existing version chunks',
                subAction: 'IF Discrepancy detected THEN Flag authoritative version & alert HR',
                active: true
              },
              {
                title: 'Sprint Overload Mitigator',
                trigger: 'WHEN Team workload exceeds 90% capacity',
                action: 'THEN Suggest lowest-priority task deferral',
                subAction: 'THEN Send proposal to AI Approval Inbox',
                active: true
              }
            ].map((rule, idx) => (
              <div key={idx} className="card-base p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-text-primary">{rule.title}</h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-success/15 text-success">
                    Active Rule
                  </span>
                </div>

                <div className="space-y-1.5 text-xs font-mono">
                  <div className="p-2 bg-surface-elevated rounded border border-border text-brand">
                    {rule.trigger}
                  </div>
                  <div className="p-2 bg-surface-elevated rounded border border-border text-text-primary">
                    {rule.action}
                  </div>
                  <div className="p-2 bg-surface-elevated rounded border border-border text-success">
                    {rule.subAction}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── TAB 5: POLICIES & BUDGETS (Part 15, Change 70) ──────────────── */}
      {activeTab === 'policies' && (
        <div className="space-y-6">
          <div className="card-base p-6 space-y-4">
            <h2 className="text-sm font-semibold text-text-primary">AI Safety Policies & Governance</h2>

            <div className="flex items-center justify-between py-3 border-b border-border">
              <div>
                <div className="text-xs font-semibold text-text-primary">Require Human Approval for High-Risk Actions</div>
                <div className="text-[11px] text-text-muted">Enforces approval modal before mutating tasks or applying code patches.</div>
              </div>
              <button
                onClick={() => setRequireHighRiskApproval(!requireHighRiskApproval)}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  requireHighRiskApproval ? 'bg-success/15 text-success border border-success/30' : 'bg-surface-elevated text-text-muted'
                }`}
              >
                {requireHighRiskApproval ? 'Enforced ✓' : 'Disabled'}
              </button>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-border">
              <div>
                <div className="text-xs font-semibold text-text-primary">External Web Access for Models</div>
                <div className="text-[11px] text-text-muted">Allows models to query external documentation when workspace context is insufficient.</div>
              </div>
              <button
                onClick={() => setExternalWebAccess(!externalWebAccess)}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  externalWebAccess ? 'bg-brand text-white' : 'bg-surface-elevated text-text-muted border border-border'
                }`}
              >
                {externalWebAccess ? 'Enabled' : 'Restricted (Local Only)'}
              </button>
            </div>

            <div className="flex items-center justify-between py-3">
              <div>
                <div className="text-xs font-semibold text-text-primary">Monthly AI Compute Budget Threshold</div>
                <div className="text-[11px] text-text-muted">Alerts administrators and throttles non-critical autonomous tasks when reached.</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-text-primary">${monthlyBudget} / mo</span>
                <button
                  onClick={() => {
                    const val = window.prompt('Enter new monthly budget ($):', monthlyBudget.toString());
                    if (val) setMonthlyBudget(parseInt(val, 10) || 500);
                  }}
                  className="btn-secondary px-2.5 py-1 text-xs"
                >
                  Adjust Limit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
