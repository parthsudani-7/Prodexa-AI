import React, { useState, useEffect } from 'react';
import Landing from './pages/Landing';
import MyWork from './pages/MyWork';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import AIChat from './pages/AIChat';
import Documents from './pages/Documents';
import Meetings from './pages/Meetings';
import Tasks from './pages/Tasks';
import Analytics from './pages/Analytics';
import Reports from './pages/Reports';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import CodeHub from './pages/CodeHub';
import AIControlPlane from './pages/AIControlPlane';
import ProductTour from './components/ProductTour';
import CommandPalette from './components/CommandPalette';
import UniversalUndoToast from './components/UniversalUndoToast';
import ProdexaLogo from './components/ProdexaLogo';

import { 
  UserCheck,
  LayoutDashboard, 
  FolderKanban,
  CheckSquare, 
  MessageSquare, 
  FileText, 
  Video, 
  Terminal, 
  BarChart2, 
  FileCode, 
  Bell, 
  Settings as SettingsIcon, 
  User, 
  LogOut, 
  Search, 
  Sparkles, 
  ChevronDown, 
  Building2, 
  Check, 
  Plus, 
  Compass, 
  Command,
  Bot
} from 'lucide-react';
import { api, API_BASE } from './lib/api';

type PageType = 'my-work' | 'dashboard' | 'projects' | 'ai-control' | 'chat' | 'documents' | 'meetings' | 'tasks' | 'analytics' | 'reports' | 'notifications' | 'settings' | 'profile' | 'code-hub';

interface UserProfile {
  id?: string;
  name: string;
  avatar?: string;
  email: string;
  plan: string;
  role?: string;
  workspaces?: Array<{
    id: string;
    name: string;
    slug: string;
    plan: string;
    role: string;
  }>;
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState<PageType>('my-work');
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [orgDropdownOpen, setOrgDropdownOpen] = useState(false);
  
  // Interactive Guided Tour & Command Palette
  const [showTour, setShowTour] = useState(() => localStorage.getItem('has_completed_tour') !== 'true');
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // Multi-tenancy workspaces
  const [workspaces, setWorkspaces] = useState<any[]>([
    { id: 'org_primary_workspace', name: "Parth's Workspace", slug: 'parth-workspace', plan: 'PRO', role: 'OWNER' }
  ]);
  const [activeOrgId, setActiveOrgId] = useState(() => localStorage.getItem('active_org_id') || 'org_primary_workspace');
  const [activeOrg, setActiveOrg] = useState<any>({
    id: 'org_primary_workspace',
    name: "Parth's Workspace",
    slug: 'parth-workspace',
    plan: 'PRO',
    role: 'OWNER'
  });

  const [userPlan, setUserPlan] = useState(() => localStorage.getItem('user_plan') || 'PRO');

  // Global search states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ documents: any[]; chats: any[]; meetings: any[]; tasks: any[] }>({ documents: [], chats: [], meetings: [], tasks: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults({ documents: [], chats: [], meetings: [], tasks: [] });
      setShowDropdown(false);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      setShowDropdown(true);
      try {
        const token = localStorage.getItem('token');
        const headers: Record<string, string> = token ? { 'Authorization': `Bearer ${token}` } : {};
        if (activeOrgId) headers['X-Organization-Id'] = activeOrgId;
        
        const [docsRes, chatsRes, meetingsRes, tasksRes] = await Promise.allSettled([
          fetch(`${API_BASE}/api/documents`, { headers }).then(r => r.json()),
          fetch(`${API_BASE}/api/chat/history`, { headers }).then(r => r.json()),
          fetch(`${API_BASE}/api/meetings`, { headers }).then(r => r.json()),
          fetch(`${API_BASE}/api/tasks`, { headers }).then(r => r.json()),
        ]);

        const query = searchQuery.toLowerCase();

        const docs = docsRes.status === 'fulfilled' && Array.isArray(docsRes.value)
          ? docsRes.value.filter((d: any) => d.name?.toLowerCase().includes(query))
          : [];

        const chats = chatsRes.status === 'fulfilled' && Array.isArray(chatsRes.value)
          ? chatsRes.value.filter((c: any) => c.title?.toLowerCase().includes(query))
          : [];

        const meetings = meetingsRes.status === 'fulfilled' && Array.isArray(meetingsRes.value)
          ? meetingsRes.value.filter((m: any) => m.title?.toLowerCase().includes(query))
          : [];

        const tasks = tasksRes.status === 'fulfilled' && Array.isArray(tasksRes.value)
          ? tasksRes.value.filter((t: any) => t.title?.toLowerCase().includes(query) || t.desc?.toLowerCase().includes(query))
          : [];

        setSearchResults({ documents: docs, chats, meetings, tasks });
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, activeOrgId]);

  const loadWorkspaces = async () => {
    try {
      const res = await api.get<any>('/organizations');
      if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
        setWorkspaces(res.data);
        const currentStoredId = localStorage.getItem('active_org_id');
        const found = res.data.find((o: any) => o.id === currentStoredId) || res.data[0];
        if (found) {
          setActiveOrgId(found.id);
          setActiveOrg(found);
          localStorage.setItem('active_org_id', found.id);
          if (found.plan) {
            setUserPlan(found.plan);
            localStorage.setItem('user_plan', found.plan);
          }
        }
      }
    } catch {
      // Keep baseline
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const params = new URLSearchParams(window.location.search);
      const tokenFromUrl = params.get('token');
      
      if (window.location.pathname === '/auth/callback' && tokenFromUrl) {
        localStorage.setItem('token', tokenFromUrl);
        const name = params.get('name') || '';
        const avatar = params.get('avatar') || '';
        const email = params.get('email') || '';
        const plan = params.get('plan') || 'PRO';
        
        localStorage.setItem('user_name', name);
        localStorage.setItem('user_avatar', avatar);
        localStorage.setItem('user_email', email);
        localStorage.setItem('user_plan', plan);
        
        window.history.replaceState({}, document.title, '/');
        
        setUser({ name, avatar, email, plan });
        setIsLoggedIn(true);
        setLoading(false);
        await loadWorkspaces();
      } else {
        const token = localStorage.getItem('token');
        if (token) {
          try {
            const response = await fetch(`${API_BASE}/api/auth/me`, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            if (response.ok) {
              const resData = await response.json();
              const userData = resData.data || resData;
              setUser(userData);
              setIsLoggedIn(true);
              await loadWorkspaces();
            } else {
              const name = localStorage.getItem('user_name') || 'Parth Sudani';
              setUser({
                name,
                avatar: localStorage.getItem('user_avatar') || '',
                email: localStorage.getItem('user_email') || 'parth@prodexa.ai',
                plan: localStorage.getItem('user_plan') || 'PRO'
              });
              setIsLoggedIn(true);
            }
          } catch {
            const name = localStorage.getItem('user_name') || 'Parth Sudani';
            setUser({
              name,
              avatar: localStorage.getItem('user_avatar') || '',
              email: localStorage.getItem('user_email') || 'parth@prodexa.ai',
              plan: localStorage.getItem('user_plan') || 'PRO'
            });
            setIsLoggedIn(true);
          }
        }
        setLoading(false);
      }
    };
    
    initAuth();
  }, []);

  useEffect(() => {
    const handlePlanUpdate = () => {
      const storedPlan = localStorage.getItem('user_plan') || 'PRO';
      setUserPlan(storedPlan);
      setUser(prev => prev ? { ...prev, plan: storedPlan } : null);
      if (activeOrg) {
        setActiveOrg((prev: any) => ({ ...prev, plan: storedPlan }));
      }
    };
    const handlePageChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        setCurrentPage(customEvent.detail);
      }
    };
    const handleOpenCommandPalette = () => {
      setCommandPaletteOpen(true);
    };

    window.addEventListener('user_plan_updated', handlePlanUpdate);
    window.addEventListener('change_page', handlePageChange);
    window.addEventListener('open_command_palette', handleOpenCommandPalette);
    return () => {
      window.removeEventListener('user_plan_updated', handlePlanUpdate);
      window.removeEventListener('change_page', handlePageChange);
      window.removeEventListener('open_command_palette', handleOpenCommandPalette);
    };
  }, [activeOrg]);

  const switchWorkspace = (org: any) => {
    setActiveOrgId(org.id);
    setActiveOrg(org);
    localStorage.setItem('active_org_id', org.id);
    if (org.plan) {
      setUserPlan(org.plan);
      localStorage.setItem('user_plan', org.plan);
    }
    setOrgDropdownOpen(false);
  };

  const createWorkspace = async () => {
    const name = window.prompt('Enter new Workspace name:');
    if (!name || !name.trim()) return;
    const newOrg = {
      id: `org_${Date.now()}`,
      name: name.trim(),
      slug: name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      plan: 'PRO',
      role: 'OWNER'
    };
    setWorkspaces(prev => [...prev, newOrg]);
    switchWorkspace(newOrg);
    try {
      await api.post('/organizations', { name: name.trim() });
    } catch {
      // Local state is active
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_name');
    localStorage.removeItem('user_avatar');
    localStorage.removeItem('user_email');
    localStorage.removeItem('user_plan');
    localStorage.removeItem('active_org_id');
    setUser(null);
    setIsLoggedIn(false);
  };

  if (loading) {
    return (
      <div className="flex h-screen w-screen bg-background items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center animate-spin">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="text-xs font-medium text-text-muted tracking-wider animate-pulse">LOADING PRODEXA AI...</span>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Landing onStart={() => setIsLoggedIn(true)} />;
  }

  // Structured enterprise navigation sections
  const navSections = [
    {
      heading: 'HOME',
      items: [
        { id: 'my-work', label: 'My Work', icon: <UserCheck className="w-4 h-4" /> },
        { id: 'ai-control', label: 'Prodexa Pulse & AI Plane', icon: <Sparkles className="w-4 h-4 text-brand" /> },
        { id: 'dashboard', label: 'Executive Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
      ]
    },
    {
      heading: 'WORK',
      items: [
        { id: 'projects', label: 'Projects', icon: <FolderKanban className="w-4 h-4" /> },
        { id: 'tasks', label: 'Tasks & Sprints', icon: <CheckSquare className="w-4 h-4" /> },
        { id: 'meetings', label: 'Meetings', icon: <Video className="w-4 h-4" /> },
      ]
    },
    {
      heading: 'KNOWLEDGE',
      items: [
        { id: 'chat', label: 'AI Copilot', icon: <MessageSquare className="w-4 h-4" /> },
        { id: 'documents', label: 'Documents', icon: <FileText className="w-4 h-4" /> },
      ]
    },
    {
      heading: 'ENGINEERING',
      items: [
        { id: 'code-hub', label: 'Code Hub & PRs', icon: <Terminal className="w-4 h-4" /> },
      ]
    },
    {
      heading: 'INSIGHTS',
      items: [
        { id: 'analytics', label: 'Analytics & ROI', icon: <BarChart2 className="w-4 h-4" /> },
        { id: 'reports', label: 'Reports', icon: <FileCode className="w-4 h-4" /> },
      ]
    },
    {
      heading: 'ADMIN',
      items: [
        { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
        { id: 'settings', label: 'Settings', icon: <SettingsIcon className="w-4 h-4" /> },
      ]
    }
  ] as const;

  const renderContent = () => {
    switch (currentPage) {
      case 'my-work': return <MyWork />;
      case 'ai-control': return <AIControlPlane />;
      case 'dashboard': return <Dashboard />;
      case 'projects': return <Projects />;
      case 'chat': return <AIChat />;
      case 'documents': return <Documents />;
      case 'meetings': return <Meetings />;
      case 'tasks': return <Tasks />;
      case 'analytics': return <Analytics />;
      case 'reports': return <Reports />;
      case 'code-hub': return <CodeHub />;
      case 'notifications': return <Notifications />;
      case 'settings': return <Settings />;
      case 'profile': return <Profile />;
      default: return <MyWork />;
    }
  };

  const userAvatar = user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80";
  const userName = user?.name || "Parth Sudani";

  return (
    <div className="flex h-screen bg-background text-text-primary overflow-hidden font-sans">
      
      {/* Left Sidebar */}
      <aside className="w-64 border-r border-border bg-background-sidebar flex flex-col justify-between flex-shrink-0 z-20">
        <div className="flex flex-col h-full overflow-hidden">
          
          {/* Logo Area */}
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ProdexaLogo size={28} />
              <span className="font-bold text-sm text-text-primary tracking-tight">
                Prodexa AI 
              </span>
            </div>
            <span className="text-[10px] font-mono text-text-muted border border-border px-1.5 py-0.5 rounded">v2.0</span>
          </div>

          {/* Workspace Switcher */}
          <div className="p-3 border-b border-border relative">
            <button
              onClick={() => setOrgDropdownOpen(!orgDropdownOpen)}
              className="w-full flex items-center justify-between p-2 rounded-lg bg-surface border border-border hover:border-border-active transition-colors text-left"
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="w-5 h-5 rounded bg-brand/20 border border-brand/40 flex items-center justify-center text-[10px] font-bold text-brand">
                  {activeOrg?.name?.[0] || 'W'}
                </div>
                <div className="truncate">
                  <div className="text-xs font-semibold text-text-primary truncate">{activeOrg?.name || "Parth's Workspace"}</div>
                  <div className="text-[9px] text-text-muted uppercase font-mono">{activeOrg?.role || 'OWNER'}</div>
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-text-muted flex-shrink-0 ml-1" />
            </button>

            {orgDropdownOpen && (
              <div className="absolute left-3 right-3 top-16 bg-surface border border-border rounded-xl shadow-modal z-50 p-2 space-y-1">
                <div className="text-[10px] text-text-muted font-bold uppercase tracking-wider px-2 py-1">
                  Your Workspaces
                </div>
                {workspaces.map((org) => (
                  <button
                    key={org.id}
                    onClick={() => switchWorkspace(org)}
                    className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs hover:bg-surface-elevated text-left transition-colors"
                  >
                    <div className="truncate">
                      <div className="text-text-primary font-medium truncate">{org.name}</div>
                      <div className="text-[10px] text-text-muted">{org.plan} • {org.role}</div>
                    </div>
                    {org.id === activeOrgId && <Check className="w-3.5 h-3.5 text-brand" />}
                  </button>
                ))}
                <div className="border-t border-border pt-1 mt-1">
                  <button
                    onClick={createWorkspace}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-brand hover:bg-brand/10 font-semibold transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Workspace</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Grouped Navigation Links */}
          <nav className="flex-1 overflow-y-auto p-3 space-y-4">
            {navSections.map((sec, sIdx) => (
              <div key={sIdx} className="space-y-1">
                <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider px-3 block">
                  {sec.heading}
                </span>
                {sec.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setCurrentPage(item.id as any)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      currentPage === item.id 
                        ? 'bg-surface-elevated text-text-primary border border-border font-semibold text-brand' 
                        : 'text-text-secondary hover:text-text-primary hover:bg-surface-elevated/60'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            ))}
          </nav>

        </div>

        {/* Footer Area */}
        <div className="p-3 border-t border-border bg-background-sidebar">
          <button 
            onClick={handleSignOut}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-text-secondary hover:bg-danger/10 hover:text-danger transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        
        {/* Top Navbar */}
        <header className="h-14 border-b border-border bg-background-sidebar/70 backdrop-blur-md flex items-center justify-between px-6 z-10">
          {/* Global Search & Command Palette trigger */}
          <div className="relative w-80 hidden sm:block">
            <button
              onClick={() => setCommandPaletteOpen(true)}
              className="w-full flex items-center justify-between px-3 py-1.5 bg-surface border border-border hover:border-border-active rounded-lg text-xs text-text-muted transition-colors text-left"
            >
              <div className="flex items-center gap-2">
                <Search className="w-3.5 h-3.5 text-text-muted" />
                <span>Search or run command...</span>
              </div>
              <div className="flex items-center gap-1 font-mono text-[10px] text-text-muted bg-surface-elevated border border-border px-1.5 py-0.5 rounded">
                <Command className="w-2.5 h-2.5" />
                <span>K</span>
              </div>
            </button>
          </div>

          <div className="sm:hidden" />

          {/* Navbar actions */}
          <div className="flex items-center gap-3">
            
            {/* Guided Tour Trigger */}
            <button
              onClick={() => setShowTour(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface border border-border hover:border-border-active text-xs font-medium text-text-secondary hover:text-text-primary transition-colors"
              title="Start Guided Tour"
            >
              <Compass className="w-3.5 h-3.5 text-brand" />
              <span>Tour</span>
            </button>

            {/* AI Status Badge */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-success/10 border border-success/30 rounded-lg text-[11px] font-medium text-success">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              <span>Connected</span>
            </div>

            {/* Notifications */}
            <button 
              onClick={() => setCurrentPage('notifications')}
              className={`p-1.5 rounded-lg border border-border bg-surface hover:bg-surface-elevated text-text-secondary hover:text-text-primary relative transition-colors ${currentPage === 'notifications' ? 'bg-surface-elevated text-text-primary' : ''}`}
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-brand" />
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 border border-border p-1 pr-2 rounded-lg bg-surface hover:bg-surface-elevated transition-colors"
              >
                <div className="w-6 h-6 rounded bg-brand/20 border border-brand/40 overflow-hidden">
                  <img src={userAvatar} alt="Avatar" className="w-full h-full object-cover" />
                </div>
                <span className="text-xs font-medium text-text-primary hidden md:block">{userName.split(' ')[0]}</span>
                <ChevronDown className="w-3 h-3 text-text-muted hidden md:block" />
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-surface border border-border rounded-xl shadow-modal py-1.5 z-50 text-xs">
                  <button 
                    onClick={() => {
                      setCurrentPage('profile');
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-surface-elevated text-text-primary font-medium"
                  >
                    My Profile
                  </button>
                  <button 
                    onClick={() => {
                      setCurrentPage('settings');
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-surface-elevated text-text-primary font-medium"
                  >
                    Settings & Admin
                  </button>
                  <div className="border-t border-border my-1" />
                  <button 
                    onClick={() => {
                      handleSignOut();
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-danger/10 text-danger font-medium"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>

          </div>
        </header>

        {/* Content Panel Area */}
        <main className="flex-1 overflow-y-auto p-6 relative">
          {renderContent()}
        </main>

        {/* Command Palette (Ctrl+K) */}
        <CommandPalette
          isOpen={commandPaletteOpen}
          onClose={() => setCommandPaletteOpen(false)}
          onNavigate={(page) => setCurrentPage(page as any)}
        />

        {/* Universal Undo Toast System */}
        <UniversalUndoToast />

        {/* Enterprise Guided Tour Popover */}
        <ProductTour
          isOpen={showTour}
          onClose={() => setShowTour(false)}
          onNavigate={(page) => setCurrentPage(page as any)}
        />

      </div>

    </div>
  );
}
