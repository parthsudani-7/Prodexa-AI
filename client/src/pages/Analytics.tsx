import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from 'recharts';
import { 
  BarChart2, 
  TrendingUp, 
  Clock, 
  Sparkles, 
  DollarSign, 
  CheckSquare, 
  Zap, 
  ShieldCheck,
  HelpCircle
} from 'lucide-react';

const weeklyVelocityData = [
  { name: 'Mon', focusTime: 4.5, tasks: 3 },
  { name: 'Tue', focusTime: 5.2, tasks: 4 },
  { name: 'Wed', focusTime: 6.0, tasks: 5 },
  { name: 'Thu', focusTime: 4.8, tasks: 2 },
  { name: 'Fri', focusTime: 6.5, tasks: 6 },
  { name: 'Sat', focusTime: 3.5, tasks: 2 },
  { name: 'Sun', focusTime: 2.0, tasks: 1 },
];

export default function Analytics() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto text-text-primary animate-fade-in font-sans">
      {/* Header */}
      <div className="border-b border-border pb-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-brand mb-1">
          <BarChart2 className="w-4 h-4" />
          <span>Workforce Delivery Telemetry & AI Economics</span>
        </div>
        <h1 className="text-xl font-bold text-text-primary tracking-tight">
          Productivity Analytics & ROI Dashboard
        </h1>
        <p className="text-xs text-text-secondary mt-0.5">
          Transparent metrics designed for capacity planning and delivery velocity without invasive employee surveillance.
        </p>
      </div>

      {/* Transparent Productivity Breakdown (Part 17, Change 77) */}
      <div className="card-elevated p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <span className="text-[10px] font-mono text-brand uppercase tracking-wider">Scoring Transparency</span>
            <div className="text-2xl font-bold text-text-primary mt-1">94% Velocity Score <span className="text-xs font-normal text-success">(+8% from last week)</span></div>
          </div>
          <div className="text-[11px] text-text-muted text-right">
            <div>Methodology: Deep Work Ratio / Meeting Load</div>
            <div>Evaluation Period: Last 7 Days</div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1">
          <div className="p-3 bg-surface rounded-lg border border-border">
            <span className="text-[10px] text-text-muted block">Daily Deep Focus</span>
            <span className="text-base font-bold text-text-primary mt-1 block">4h 20m</span>
          </div>
          <div className="p-3 bg-surface rounded-lg border border-border">
            <span className="text-[10px] text-text-muted block">Completed Tasks</span>
            <span className="text-base font-bold text-text-primary mt-1 block">18 tasks</span>
          </div>
          <div className="p-3 bg-surface rounded-lg border border-border">
            <span className="text-[10px] text-text-muted block">Context Switches</span>
            <span className="text-base font-bold text-success mt-1 block">8 (Low)</span>
          </div>
          <div className="p-3 bg-surface rounded-lg border border-border">
            <span className="text-[10px] text-text-muted block">Deep Work Ratio</span>
            <span className="text-base font-bold text-brand mt-1 block">71%</span>
          </div>
          <div className="p-3 bg-surface rounded-lg border border-border">
            <span className="text-[10px] text-text-muted block">Meeting Load</span>
            <span className="text-base font-bold text-purple-400 mt-1 block">23%</span>
          </div>
        </div>
      </div>

      {/* AI ROI & Economics (Part 15, Changes 69-72) */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="card-base p-4">
          <div className="flex items-center justify-between text-text-muted text-[11px]">
            <span>Hours Saved by AI</span>
            <Sparkles className="w-3.5 h-3.5 text-brand" />
          </div>
          <div className="text-2xl font-bold text-success mt-1.5">126 hours</div>
          <span className="text-[10px] text-text-muted mt-1 block">Across 482 actions</span>
        </div>

        <div className="card-base p-4">
          <div className="flex items-center justify-between text-text-muted text-[11px]">
            <span>Monthly AI Compute</span>
            <DollarSign className="w-3.5 h-3.5 text-text-primary" />
          </div>
          <div className="text-2xl font-bold text-text-primary mt-1.5">$184.00</div>
          <span className="text-[10px] text-success mt-1 block">Under $500 budget limit</span>
        </div>

        <div className="card-base p-4">
          <div className="flex items-center justify-between text-text-muted text-[11px]">
            <span>Security Issues Caught</span>
            <ShieldCheck className="w-3.5 h-3.5 text-brand" />
          </div>
          <div className="text-2xl font-bold text-brand mt-1.5">64 issues</div>
          <span className="text-[10px] text-text-muted mt-1 block">Zero auth vulnerabilities</span>
        </div>

        <div className="card-base p-4">
          <div className="flex items-center justify-between text-text-muted text-[11px]">
            <span>Team Workload Stress</span>
            <Zap className="w-3.5 h-3.5 text-success" />
          </div>
          <div className="text-xl font-bold text-success mt-1.5">Low Risk</div>
          <span className="text-[10px] text-text-muted mt-1 block">Balanced task allocation</span>
        </div>
      </div>

      {/* Charts */}
      <div className="card-base p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary">Weekly Focus Hours vs. Task Velocity</h3>
            <p className="text-[11px] text-text-muted">Direct correlation between uninterrupted focus sessions and output.</p>
          </div>
          <span className="text-xs font-mono text-text-muted">Target: &gt; 4.0h deep work/day</span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyVelocityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#262B33" vertical={false} />
              <XAxis dataKey="name" stroke="#68717D" fontSize={11} tickLine={false} />
              <YAxis stroke="#68717D" fontSize={11} tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: '#14171C', borderColor: '#262B33', borderRadius: '6px', fontSize: '11px', color: '#F4F6F8' }} />
              <Bar dataKey="focusTime" name="Focus Time (Hours)" fill="#5B8DEF" radius={[4, 4, 0, 0]} />
              <Bar dataKey="tasks" name="Tasks Completed" fill="#32C48D" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
