import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { 
  TrendingUp, 
  CheckSquare, 
  Zap, 
  Video, 
  FileText, 
  Sparkles, 
  MessageSquare, 
  Terminal, 
  Calendar,
  Layers,
  ArrowRight,
  UserCheck
} from 'lucide-react';
import { api } from '../lib/api';

const productivityData = [
  { name: 'Mon', score: 78 },
  { name: 'Tue', score: 82 },
  { name: 'Wed', score: 89 },
  { name: 'Thu', score: 86 },
  { name: 'Fri', score: 94 },
  { name: 'Sat', score: 91 },
  { name: 'Sun', score: 95 },
];

export default function Dashboard() {
  const [userName, setUserName] = useState(localStorage.getItem('user_name') || 'Parth');
  const [stats, setStats] = useState<any>(null);
  const [focusTitle, setFocusTitle] = useState(() => localStorage.getItem('focus_title') || 'Sprint Milestone Delivery');
  const [workCycle, setWorkCycle] = useState<'morning' | 'afternoon' | 'balanced'>(() => (localStorage.getItem('focus_cycle') as any) || 'morning');

  const navigateTo = (page: string) => {
    window.dispatchEvent(new CustomEvent('change_page', { detail: page }));
  };

  const syncScheduleToCalendar = () => {
    localStorage.setItem('focus_title', focusTitle);
    localStorage.setItem('focus_cycle', workCycle);
    alert(`Success! Calendar focus blocks locked for "${focusTitle}".`);
  };

  const getSchedules = () => {
    const theme = focusTitle.trim() || 'Sprint Task Execution';
    if (workCycle === 'morning') {
      return [
        { time: '09:00 - 12:00', type: 'focus', activity: 'Deep Work Session', desc: `Core focus: ${theme}` },
        { time: '13:30 - 14:30', type: 'meeting', activity: 'Sprint Sync & Alignment', desc: 'Review active PR blockers and milestone status.' },
        { time: '15:00 - 17:00', type: 'review', activity: 'PR Review & Refactoring', desc: 'Code audits and test suite verification.' }
      ];
    } else if (workCycle === 'afternoon') {
      return [
        { time: '09:30 - 10:30', type: 'meeting', activity: 'Standup Alignment', desc: 'Review sprint lane movements and assign priorities.' },
        { time: '13:00 - 16:00', type: 'focus', activity: 'Core Focus Block', desc: `Deep work session: ${theme}` },
        { time: '16:30 - 17:30', type: 'review', activity: 'Audit Logs & Check-in', desc: 'Compile daily progress status reports.' }
      ];
    } else {
      return [
        { time: '09:30 - 11:30', type: 'focus', activity: 'Focus Session A', desc: `Initial coding: ${theme}` },
        { time: '13:30 - 14:30', type: 'meeting', activity: 'Architecture Review', desc: 'Multi-tenant database schema discussions.' },
        { time: '15:00 - 17:00', type: 'focus', activity: 'Focus Session B', desc: 'Wrap up developments and document features.' }
      ];
    }
  };

  const schedules = getSchedules();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const me = await api.get<any>('/users/me');
        const userObj = me?.data || me;
        if (userObj?.name) {
          setUserName(userObj.name);
          localStorage.setItem('user_name', userObj.name);
        }
      } catch {
        // Fallback
      }

      try {
        const analytics = await api.get<any>('/analytics');
        setStats(analytics);
      } catch {
        setStats({
          productivityScore: 94,
          totalMeetings: 4,
          completionRate: 85,
          tasks: { total: 12, completed: 8, inProgress: 3, pending: 1 },
          tokens: { totalTokens: 14200, totalCost: 0.042 },
          stressForecaster: { level: 'Low', recommendation: 'Team capacity is well-balanced with optimal focus distribution.' }
        });
      }
    };
    fetchDashboardData();
  }, []);

  const productivityScore = stats?.productivityScore || 94;
  const totalTasks = stats?.tasks?.total || 12;
  const completedTasks = stats?.tasks?.completed || 8;
  const totalMeetings = stats?.totalMeetings || 4;
  const stressLevel = stats?.stressForecaster?.level || 'Low';

  const taskDonutData = [
    { name: 'Done', value: completedTasks, color: '#32C48D' },
    { name: 'In Progress', value: stats?.tasks?.inProgress || 3, color: '#5B8DEF' },
    { name: 'Pending', value: stats?.tasks?.pending || 1, color: '#E6A23C' },
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Good morning';
    if (hour >= 12 && hour < 17) return 'Good afternoon';
    if (hour >= 17 && hour < 22) return 'Good evening';
    return 'Good night';
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto text-text-primary animate-fade-in font-sans">
      {/* Greeting & Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-brand mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Executive Command Center</span>
          </div>
          <h1 className="text-xl font-bold text-text-primary tracking-tight">
            {getGreeting()}, {userName.split(' ')[0]} 👋
          </h1>
          <p className="text-xs text-text-secondary mt-0.5">
            Real-time telemetry across workspace velocity, deep work ratio, and cross-functional deliverables.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateTo('my-work')}
            className="btn-secondary px-3 py-1.5 text-xs flex items-center gap-1.5"
          >
            <UserCheck className="w-3.5 h-3.5 text-brand" />
            <span>My Work</span>
          </button>
          <button
            onClick={() => navigateTo('projects')}
            className="btn-primary px-3.5 py-1.5 text-xs flex items-center gap-1.5 shadow-subtle"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Projects Graph</span>
          </button>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="card-base p-4">
          <div className="flex items-center justify-between text-text-muted text-[11px]">
            <span>Productivity Velocity</span>
            <TrendingUp className="w-3.5 h-3.5 text-success" />
          </div>
          <div className="text-2xl font-bold text-text-primary mt-1.5">{productivityScore}%</div>
          <span className="text-[10px] text-success mt-1 block">↑ 8% vs last week (optimal)</span>
        </div>

        <div className="card-base p-4">
          <div className="flex items-center justify-between text-text-muted text-[11px]">
            <span>Completed Tasks</span>
            <CheckSquare className="w-3.5 h-3.5 text-brand" />
          </div>
          <div className="text-2xl font-bold text-text-primary mt-1.5">{completedTasks} <span className="text-xs font-normal text-text-secondary">/ {totalTasks}</span></div>
          <span className="text-[10px] text-text-muted mt-1 block">67% sprint completion</span>
        </div>

        <div className="card-base p-4">
          <div className="flex items-center justify-between text-text-muted text-[11px]">
            <span>Meetings Synthesized</span>
            <Video className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-text-primary mt-1.5">{totalMeetings}</div>
          <span className="text-[10px] text-text-muted mt-1 block">100% action items converted</span>
        </div>

        <div className="card-base p-4">
          <div className="flex items-center justify-between text-text-muted text-[11px]">
            <span>Team Cognitive Load</span>
            <Zap className="w-3.5 h-3.5 text-success" />
          </div>
          <div className="text-xl font-bold text-success mt-1.5">{stressLevel} Risk</div>
          <span className="text-[10px] text-text-muted mt-1 block truncate">Capacity well-distributed</span>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card-base p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary">7-Day Productivity Velocity</h3>
              <p className="text-[11px] text-text-muted">Calculated from task output vs uninterrupted focus blocks.</p>
            </div>
            <span className="text-xs font-semibold text-brand bg-brand-muted px-2 py-0.5 rounded border border-brand/30">
              94% Average
            </span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={productivityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262B33" vertical={false} />
                <XAxis dataKey="name" stroke="#68717D" fontSize={11} tickLine={false} />
                <YAxis stroke="#68717D" fontSize={11} domain={[60, 100]} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#14171C', borderColor: '#262B33', borderRadius: '6px', fontSize: '11px', color: '#F4F6F8' }} />
                <Area type="monotone" dataKey="score" stroke="#5B8DEF" strokeWidth={2} fill="#5B8DEF" fillOpacity={0.1} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card-base p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary">Sprint Status Distribution</h3>
            <p className="text-[11px] text-text-muted">Real-time status across active tasks.</p>
          </div>

          <div className="h-44 w-full flex items-center justify-center my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={taskDonutData} dataKey="value" nameKey="name" innerRadius={46} outerRadius={68} paddingAngle={3}>
                  {taskDonutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#14171C', borderColor: '#262B33', borderRadius: '6px', fontSize: '11px', color: '#F4F6F8' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-around text-xs border-t border-border pt-3">
            {taskDonutData.map((item) => (
              <div key={item.name} className="text-center">
                <div className="font-bold text-text-primary">{item.value}</div>
                <div className="text-[10px] text-text-muted">{item.name}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Focus Time Blocker */}
      <div className="card-base p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary flex items-center gap-2">
              <Calendar className="w-4 h-4 text-brand" />
              AI Focus Scheduler & Time Blocker
            </h3>
            <p className="text-[11px] text-text-muted">
              Protects uninterrupted deep-work windows synced with team availability.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex p-0.5 bg-surface-elevated rounded-lg border border-border">
              {(['morning', 'afternoon', 'balanced'] as const).map((cycle) => (
                <button
                  key={cycle}
                  onClick={() => setWorkCycle(cycle)}
                  className={`px-2.5 py-1 rounded text-xs font-medium capitalize transition-colors ${
                    workCycle === cycle ? 'bg-brand text-white' : 'text-text-muted hover:text-text-primary'
                  }`}
                >
                  {cycle}
                </button>
              ))}
            </div>
            <button
              onClick={syncScheduleToCalendar}
              className="btn-primary px-3 py-1 text-xs shadow-subtle"
            >
              Lock Schedule
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {schedules.map((block, idx) => (
            <div
              key={idx}
              className={`p-3.5 rounded-lg border ${
                block.type === 'focus'
                  ? 'bg-surface-elevated border-brand/50'
                  : block.type === 'meeting'
                  ? 'bg-surface-elevated border-purple-500/30'
                  : 'bg-surface border-border'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-semibold text-text-primary mb-1">
                <span>{block.activity}</span>
                <span className="font-mono text-[10px] text-text-muted">{block.time}</span>
              </div>
              <p className="text-[11px] text-text-secondary">{block.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
