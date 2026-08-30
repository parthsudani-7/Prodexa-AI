import React, { useState, useEffect } from 'react';
import { 
  Search, 
  LayoutDashboard, 
  CheckSquare, 
  FolderKanban, 
  FileText, 
  MessageSquare, 
  Video, 
  Terminal, 
  BarChart2, 
  Settings, 
  Plus, 
  Sparkles, 
  Calendar,
  ArrowRight,
  UserCheck,
  Zap
} from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: string) => void;
  onAction?: (action: string) => void;
}

export default function CommandPalette({ isOpen, onClose, onNavigate }: CommandPaletteProps) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else window.dispatchEvent(new CustomEvent('open_command_palette'));
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const actions = [
    { id: 'create-task', label: 'Create New Task', category: 'Actions', icon: <Plus className="w-4 h-4 text-brand" />, page: 'tasks' },
    { id: 'upload-doc', label: 'Upload Document / Handbook', category: 'Actions', icon: <FileText className="w-4 h-4 text-success" />, page: 'documents' },
    { id: 'schedule-focus', label: 'Schedule Focus Deep-Work Block', category: 'Actions', icon: <Calendar className="w-4 h-4 text-purple-400" />, page: 'dashboard' },
    { id: 'start-chat', label: 'Ask AI Copilot Knowledge Query', category: 'Actions', icon: <MessageSquare className="w-4 h-4 text-brand-light" />, page: 'chat' },
    { id: 'code-audit', label: 'Initiate Code Security & Bug Audit', category: 'Actions', icon: <Terminal className="w-4 h-4 text-warning" />, page: 'code-hub' },
  ];

  const navigation = [
    { id: 'my-work', label: 'My Work (Personal Command Center)', category: 'Navigate', icon: <UserCheck className="w-4 h-4 text-brand" />, page: 'my-work' },
    { id: 'dashboard', label: 'Executive Dashboard', category: 'Navigate', icon: <LayoutDashboard className="w-4 h-4 text-brand" />, page: 'dashboard' },
    { id: 'projects', label: 'Projects & Milestones Graph', category: 'Navigate', icon: <FolderKanban className="w-4 h-4 text-brand" />, page: 'projects' },
    { id: 'tasks', label: 'Sprint Kanban & AI Planner', category: 'Navigate', icon: <CheckSquare className="w-4 h-4 text-brand" />, page: 'tasks' },
    { id: 'documents', label: 'Knowledge Base & Vector RAG', category: 'Navigate', icon: <FileText className="w-4 h-4 text-brand" />, page: 'documents' },
    { id: 'meetings', label: 'Meetings & AI Synthesis', category: 'Navigate', icon: <Video className="w-4 h-4 text-brand" />, page: 'meetings' },
    { id: 'code-hub', label: 'Developer Code Hub & PR Reviews', category: 'Navigate', icon: <Terminal className="w-4 h-4 text-brand" />, page: 'code-hub' },
    { id: 'analytics', label: 'Workforce & Delivery Analytics', category: 'Navigate', icon: <BarChart2 className="w-4 h-4 text-brand" />, page: 'analytics' },
    { id: 'settings', label: 'Workspace Settings & Team Roles', category: 'Navigate', icon: <Settings className="w-4 h-4 text-brand" />, page: 'settings' },
  ];

  const aiPrompts = [
    { id: 'ai-summary', label: 'AI: Summarize current sprint deliverables', category: 'AI Intelligence', icon: <Sparkles className="w-4 h-4 text-brand-light" />, page: 'chat' },
    { id: 'ai-risk', label: 'AI: Explain team cognitive load & burnout risk', category: 'AI Intelligence', icon: <Zap className="w-4 h-4 text-warning" />, page: 'analytics' },
    { id: 'ai-policy', label: 'AI: Search company leave & security policies', category: 'AI Intelligence', icon: <FileText className="w-4 h-4 text-success" />, page: 'chat' },
  ];

  const allItems = [...actions, ...navigation, ...aiPrompts];
  const filtered = query.trim()
    ? allItems.filter(item => item.label.toLowerCase().includes(query.toLowerCase()) || item.category.toLowerCase().includes(query.toLowerCase()))
    : allItems;

  const handleSelect = (item: typeof allItems[0]) => {
    onNavigate(item.page);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-24 p-4 animate-fade-in font-sans">
      <div className="w-full max-w-xl bg-surface border border-border rounded-xl shadow-modal overflow-hidden">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-border">
          <Search className="w-4 h-4 text-text-muted mr-3 flex-shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Type a command, search projects, or ask AI... (ESC to close)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-text-primary placeholder-text-muted focus:outline-none"
          />
          <span className="text-[10px] font-mono text-text-muted border border-border px-1.5 py-0.5 rounded">
            ESC
          </span>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-xs text-text-muted">
              No matching commands or actions found.
            </div>
          ) : (
            filtered.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleSelect(item)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs hover:bg-surface-elevated text-left text-text-secondary hover:text-text-primary transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1 rounded bg-surface border border-border">
                    {item.icon}
                  </div>
                  <span className="font-medium text-text-primary">{item.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-text-muted uppercase tracking-wider">{item.category}</span>
                  <ArrowRight className="w-3 h-3 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-surface-elevated border-t border-border flex items-center justify-between text-[11px] text-text-muted">
          <span>Tip: Press <kbd className="font-mono text-text-secondary">Ctrl+K</kbd> anywhere to open</span>
          <span>Prodexa Command Center</span>
        </div>
      </div>
    </div>
  );
}
