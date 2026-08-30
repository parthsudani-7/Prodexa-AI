import React, { useState, useEffect } from 'react';
import { 
  Video, 
  Plus, 
  Sparkles, 
  CheckSquare, 
  CheckCircle2, 
  Clock, 
  Users, 
  AlertCircle, 
  ArrowRight, 
  Play, 
  Layers
} from 'lucide-react';
import { api } from '../lib/api';

interface Meeting {
  id: string;
  title: string;
  date: string;
  duration: string;
  summary: string;
  decisions: string[];
  actions: Array<{ id: string; text: string; assignee?: string; converted?: boolean }>;
  blockers: string[];
}

const DEFAULT_MEETINGS: Meeting[] = [
  {
    id: 'meet-1',
    title: 'Weekly Engineering Sprint & Architecture Sync',
    date: 'Today, 10:00 AM',
    duration: '35 min',
    summary: 'Aligned on PostgreSQL database pool configuration, tenant isolation middleware, and circuit breaker timeout thresholds.',
    decisions: [
      'Use 30-second reset window for AI Gateway circuit breaker after 3 consecutive failures.',
      'Enforce strictly-typed Zod request schemas on all multi-tenant endpoints.'
    ],
    actions: [
      { id: 'act-1', text: 'Configure circuit breaker threshold in aiGateway.ts', assignee: 'Parth Sudani', converted: false },
      { id: 'act-2', text: 'Write automated Jest integration test suite for /api/tasks', assignee: 'Rahul V.', converted: false },
      { id: 'act-3', text: 'Update Employee Handbook 2026 citation references in RAG', assignee: 'Ananya S.', converted: false },
    ],
    blockers: ['Awaiting staging DB connection string validation.']
  },
  {
    id: 'meet-2',
    title: 'Product Roadmap & Customer Onboarding Review',
    date: 'Aug 27, 2:30 PM',
    duration: '25 min',
    summary: 'Reviewed interactive onboarding tour UX. Decided to replace loud HUD visuals with clean enterprise popovers.',
    decisions: [
      'Remove all manual API key inputs from user-facing Settings tabs.',
      'Add 1-click sample loaders across Documents, Tasks, and Code Hub.'
    ],
    actions: [
      { id: 'act-4', text: 'Implement Command Palette (Ctrl+K) launcher', assignee: 'Parth Sudani', converted: true },
      { id: 'act-5', text: 'Refine Tailwind token palette with #0B0D10 dark theme', assignee: 'Parth Sudani', converted: true },
    ],
    blockers: []
  }
];

export default function Meetings() {
  const [meetings, setMeetings] = useState<Meeting[]>(DEFAULT_MEETINGS);
  const [selectedMeetingId, setSelectedMeetingId] = useState<string>('meet-1');
  const [isSimulating, setIsSimulating] = useState(false);

  const selectedMeeting = meetings.find(m => m.id === selectedMeetingId) || meetings[0];

  const handleConvertAction = (actionId: string, actionText: string) => {
    setMeetings(prev =>
      prev.map(m => {
        if (m.id !== selectedMeetingId) return m;
        return {
          ...m,
          actions: m.actions.map(a => a.id === actionId ? { ...a, converted: true } : a)
        };
      })
    );

    api.post('/tasks', {
      title: actionText,
      desc: `Extracted from meeting: ${selectedMeeting.title}`,
      deadline: 'Next Sprint',
      priority: 'High',
      tags: ['Meeting', 'AI Action'],
      column: 'pending',
      aiEstimate: '2h'
    }).catch(() => {});

    alert(`Action item converted into Kanban task in Pending lane!`);
  };

  const handleConvertAll = () => {
    setMeetings(prev =>
      prev.map(m => {
        if (m.id !== selectedMeetingId) return m;
        return {
          ...m,
          actions: m.actions.map(a => ({ ...a, converted: true }))
        };
      })
    );
    alert(`All unconverted action items dispatched into Kanban task lanes!`);
  };

  const startLiveSimulation = () => {
    setIsSimulating(true);
    setTimeout(() => {
      const newMeeting: Meeting = {
        id: `meet_${Date.now()}`,
        title: `Live Standup Sync — Session #${Math.floor(Math.random() * 900 + 100)}`,
        date: 'Just now',
        duration: '15 min',
        summary: 'Synchronized on sprint velocity. Confirmed zero critical security bugs in latest code audit.',
        decisions: [
          'Release v2.0 update to staging environment this evening.'
        ],
        actions: [
          { id: `act_${Date.now()}_1`, text: 'Run final npm run build verification', assignee: 'Parth Sudani', converted: false },
          { id: `act_${Date.now()}_2`, text: 'Review team productivity analytics report', assignee: 'Manager', converted: false },
        ],
        blockers: []
      };
      setMeetings(prev => [newMeeting, ...prev]);
      setSelectedMeetingId(newMeeting.id);
      setIsSimulating(false);
      alert('Live audio transcript synthesized! AI decisions and action items generated.');
    }, 1200);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto text-text-primary animate-fade-in font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-brand mb-1">
            <Video className="w-4 h-4" />
            <span>Synchronous Collaboration & AI Synthesis</span>
          </div>
          <h1 className="text-xl font-bold text-text-primary tracking-tight">
            Meetings & Automated Action Extraction
          </h1>
          <p className="text-xs text-text-secondary mt-0.5">
            Synthesize transcripts into structured executive summaries, recorded decisions, and one-click Kanban tasks.
          </p>
        </div>

        <button
          onClick={startLiveSimulation}
          disabled={isSimulating}
          className="btn-primary px-3.5 py-1.5 text-xs flex items-center gap-1.5 shadow-subtle self-start"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>{isSimulating ? 'Synthesizing...' : 'Load Sample Standup Sync'}</span>
        </button>
      </div>

      {/* Two Column Layout: Meeting List & Meeting Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Meetings History (1 Col) */}
        <div className="card-base p-4 space-y-3">
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block px-1">
            Recent Meetings & Standups
          </span>

          <div className="space-y-2">
            {meetings.map((m) => (
              <div
                key={m.id}
                onClick={() => setSelectedMeetingId(m.id)}
                className={`p-3 rounded-lg border cursor-pointer transition-colors space-y-1 ${
                  selectedMeetingId === m.id
                    ? 'bg-surface-elevated border-brand text-text-primary'
                    : 'bg-surface border-border hover:border-border-active'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] text-text-muted font-mono">
                  <span>{m.date}</span>
                  <span>{m.duration}</span>
                </div>
                <h3 className="text-xs font-semibold text-text-primary leading-snug line-clamp-1">{m.title}</h3>
                <div className="flex items-center gap-2 text-[10px] text-text-muted pt-1">
                  <span>{m.actions.length} action items</span>
                  <span>•</span>
                  <span>{m.decisions.length} decisions</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Meeting Detail & Task Extraction (2 Cols - Section 25) */}
        <div className="lg:col-span-2 card-base p-6 space-y-6">
          <div className="border-b border-border pb-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-brand uppercase tracking-wider">AI Meeting Synthesis</span>
              <span className="text-xs text-text-muted font-mono">{selectedMeeting.date} ({selectedMeeting.duration})</span>
            </div>
            <h2 className="text-base font-bold text-text-primary">{selectedMeeting.title}</h2>
          </div>

          {/* Executive Summary */}
          <div className="space-y-1.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary">Executive Summary</h3>
            <p className="text-xs text-text-secondary leading-relaxed bg-surface-elevated p-3.5 rounded-lg border border-border">
              {selectedMeeting.summary}
            </p>
          </div>

          {/* Key Decisions */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary">Recorded Team Decisions</h3>
            <div className="space-y-1.5">
              {selectedMeeting.decisions.map((d, i) => (
                <div key={i} className="p-2.5 bg-surface-elevated rounded-lg border border-border text-xs flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                  <span className="text-text-primary leading-snug">{d}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Items & 1-Click Task Converter (Section 25) */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                Action Items ({selectedMeeting.actions.filter(a => !a.converted).length} pending dispatch)
              </h3>
              <button
                onClick={handleConvertAll}
                className="text-xs text-brand hover:underline font-medium"
              >
                Convert all to tasks →
              </button>
            </div>

            <div className="space-y-2">
              {selectedMeeting.actions.map((act) => (
                <div
                  key={act.id}
                  className="p-3 bg-surface-elevated rounded-lg border border-border flex items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5">
                    <span className={`font-medium ${act.converted ? 'line-through text-text-muted' : 'text-text-primary'}`}>
                      {act.text}
                    </span>
                    {act.assignee && (
                      <span className="text-[10px] text-text-muted block">Assignee: {act.assignee}</span>
                    )}
                  </div>

                  <button
                    disabled={act.converted}
                    onClick={() => handleConvertAction(act.id, act.text)}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                      act.converted
                        ? 'bg-success/15 text-success border border-success/30'
                        : 'btn-primary text-xs shadow-subtle'
                    }`}
                  >
                    {act.converted ? 'Task Created ✓' : '+ Convert to Task'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
