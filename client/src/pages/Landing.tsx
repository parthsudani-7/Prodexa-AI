import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, 
  Shield, 
  Sparkles, 
  MessageSquare, 
  FileText, 
  Video, 
  Layout, 
  BarChart, 
  ChevronRight,
  Mail,
  User,
  Lock,
  ArrowRight,
  X,
  CheckCircle2,
  PlayCircle
} from 'lucide-react';
import { API_BASE } from '../lib/api';
import ProdexaLogo from '../components/ProdexaLogo';

interface LandingProps {
  onStart: () => void;
}

export default function Landing({ onStart }: LandingProps) {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  
  // Custom Login Form State (Clean empty defaults)
  const [emailInput, setEmailInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState('');

  const handleInstantDemo = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/demo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'demo.user@prodexa.ai', name: 'Demo User' })
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('user_name', data.user.name);
        localStorage.setItem('user_avatar', data.user.avatar || '');
        localStorage.setItem('user_email', data.user.email);
        localStorage.setItem('user_plan', data.user.plan || 'PRO');
        if (data.user.defaultOrgId) {
          localStorage.setItem('active_org_id', data.user.defaultOrgId);
        }
        onStart();
        window.location.reload();
        return;
      }
    } catch {}

    localStorage.setItem('user_name', 'Demo User');
    localStorage.setItem('user_email', 'demo.user@prodexa.ai');
    localStorage.setItem('user_plan', 'DEMO');
    localStorage.setItem('active_org_id', 'org_primary_workspace');
    onStart();
  };

  const handleGoogleOAuth = () => {
    window.location.href = `${API_BASE}/api/auth/google`;
  };

  const handleCustomEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) {
      setAuthError('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);
    setAuthError('');

    try {
      const res = await fetch(`${API_BASE}/api/auth/demo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: emailInput.trim(), 
          name: nameInput.trim() || emailInput.split('@')[0] 
        })
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('user_name', data.user.name);
        localStorage.setItem('user_avatar', data.user.avatar || '');
        localStorage.setItem('user_email', data.user.email);
        localStorage.setItem('user_plan', data.user.plan || 'PRO');
        if (data.user.defaultOrgId) {
          localStorage.setItem('active_org_id', data.user.defaultOrgId);
        }
        setShowAuthModal(false);
        onStart();
        window.location.reload();
      } else {
        localStorage.setItem('user_name', nameInput.trim() || emailInput.split('@')[0]);
        localStorage.setItem('user_email', emailInput.trim());
        localStorage.setItem('user_plan', 'PRO');
        setShowAuthModal(false);
        onStart();
      }
    } catch {
      localStorage.setItem('user_name', nameInput.trim() || emailInput.split('@')[0]);
      localStorage.setItem('user_email', emailInput.trim());
      localStorage.setItem('user_plan', 'PRO');
      setShowAuthModal(false);
      onStart();
    } finally {
      setIsSubmitting(false);
    }
  };

  const features = [
    {
      icon: <MessageSquare className="w-6 h-6 text-brand" />,
      title: "Contextual AI Chat",
      desc: "Instant answers grounded directly in your company's documents, policies, and files."
    },
    {
      icon: <FileText className="w-6 h-6 text-success" />,
      title: "Document Intelligence",
      desc: "Upload PDFs, DOCX, and text files. Extract, summarize, and search instantly."
    },
    {
      icon: <Video className="w-6 h-6 text-accent" />,
      title: "Meeting Summarization",
      desc: "Convert meeting audio or video into transcripts, action items, and key decisions."
    },
    {
      icon: <BarChart className="w-6 h-6 text-brand" />,
      title: "Productivity Analytics",
      desc: "Gain deep insights into work patterns, focus hours, and system utilization."
    },
    {
      icon: <Zap className="w-6 h-6 text-warning" />,
      title: "Burnout Prediction",
      desc: "ML-driven alerts analyze overtime and workloads to predict and prevent burnout."
    },
    {
      icon: <Layout className="w-6 h-6 text-danger" />,
      title: "AI Kanban Board",
      desc: "Manage tasks with smart effort estimation and dependency tracking."
    }
  ];

  return (
    <div className="min-h-screen bg-background text-text-primary selection:bg-brand/30 font-sans">
      {/* Header Navbar */}
      <nav className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between border-b border-border/50 backdrop-blur-md sticky top-0 z-40 bg-background/80">
        <div className="flex items-center gap-3">
          <ProdexaLogo size={34} />
          <span className="text-lg font-bold tracking-tight text-text-primary">
            Prodexa AI 
          </span>
        </div>
        <div className="flex items-center gap-3">
          {/* Top Demo Bar Button */}
          <button
            onClick={handleInstantDemo}
            className="text-xs font-semibold px-3.5 py-1.5 rounded-lg border border-brand/40 bg-brand/10 hover:bg-brand/20 text-brand flex items-center gap-1.5 transition-all shadow-subtle"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Instant Demo Access</span>
          </button>

          <button 
            onClick={() => { setAuthMode('signin'); setShowAuthModal(true); }}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-border bg-surface-elevated hover:bg-border text-text-primary transition-all hidden sm:inline-block"
          >
            Sign In
          </button>
          <button 
            onClick={() => { setAuthMode('signup'); setShowAuthModal(true); }}
            className="btn-primary text-xs px-3.5 py-1.5 flex items-center gap-1.5 shadow-subtle"
          >
            <span>Get Started</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center relative overflow-hidden">
        {/* Interactive Demo Banner */}
        <div 
          onClick={handleInstantDemo}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-brand/40 bg-brand/10 hover:bg-brand/20 text-brand text-xs font-medium mb-6 cursor-pointer transition-all shadow-subtle"
        >
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          <span>Live Demo Ready • Click for Instant Workspace Access ➔</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight mb-6">
          The Intelligent Operating System for <br className="hidden sm:inline" />
          <span className="text-brand">Modern Workforces</span>
        </h1>

        <p className="text-base sm:text-lg text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed">
          Unify company knowledge, agile sprint execution, meeting intelligence, and code auditing into one secure, real-time command plane.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={handleInstantDemo}
            className="btn-primary text-sm px-6 py-3 w-full sm:w-auto flex items-center justify-center gap-2 shadow-modal font-medium"
          >
            <PlayCircle className="w-4 h-4" />
            <span>Launch Live Demo</span>
          </button>
          <button
            onClick={() => { setAuthMode('signup'); setShowAuthModal(true); }}
            className="btn-secondary text-sm px-6 py-3 w-full sm:w-auto flex items-center justify-center gap-2 font-medium border border-border"
          >
            <User className="w-4 h-4 text-brand" />
            <span>Sign In / Custom Account</span>
          </button>
        </div>
      </header>

      {/* Feature Grid */}
      <section className="max-w-6xl mx-auto px-6 py-16 border-t border-border/60">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Core Enterprise Intelligence Modules</h2>
          <p className="text-xs sm:text-sm text-text-secondary mt-2">Everything your team needs to collaborate, automate, and deliver faster.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feat, idx) => (
            <div key={idx} className="card-base p-6 hover:border-brand/40 transition-all space-y-3">
              <div className="w-10 h-10 rounded-lg bg-surface-elevated flex items-center justify-center border border-border">
                {feat.icon}
              </div>
              <h3 className="text-base font-bold text-text-primary">{feat.title}</h3>
              <p className="text-xs text-text-secondary leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── AUTHENTICATION MODAL ────────────────────────────────────────── */}
      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-surface border border-border rounded-2xl max-w-md w-full p-6 shadow-modal space-y-5 relative"
            >
              <button 
                onClick={() => setShowAuthModal(false)}
                className="absolute top-4 right-4 text-text-muted hover:text-text-primary p-1 rounded-lg hover:bg-surface-elevated transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3">
                <ProdexaLogo size={32} />
                <div>
                  <h2 className="text-base font-bold text-text-primary">
                    {authMode === 'signin' ? 'Sign in to Prodexa AI' : 'Create your Workspace'}
                  </h2>
                  <p className="text-xs text-text-secondary">Enter your email and workspace details below.</p>
                </div>
              </div>

              {/* 1-Click Quick Demo Option inside Modal */}
              <button
                onClick={handleInstantDemo}
                type="button"
                className="w-full py-2.5 px-3 rounded-lg border border-brand/40 bg-brand/10 hover:bg-brand/20 text-brand text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-subtle"
              >
                <Sparkles className="w-4 h-4" />
                <span>Quick 1-Click Demo Login</span>
              </button>

              <div className="flex items-center gap-3 my-1">
                <div className="flex-1 h-px bg-border"></div>
                <span className="text-[10px] text-text-muted uppercase tracking-wider">or sign in below</span>
                <div className="flex-1 h-px bg-border"></div>
              </div>

              {/* Google Button */}
              <button
                onClick={handleGoogleOAuth}
                type="button"
                className="w-full btn-secondary py-2.5 text-xs flex items-center justify-center gap-2 font-medium border border-border hover:border-brand/40"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Continue with Google (Select Account)</span>
              </button>

              {/* Email Form */}
              <form onSubmit={handleCustomEmailAuth} className="space-y-3">
                {authError && (
                  <div className="p-2.5 rounded-lg bg-danger/10 border border-danger/30 text-danger text-xs">
                    {authError}
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-text-secondary flex items-center gap-1.5">
                    <User className="w-3 h-3 text-text-muted" />
                    <span>Your Full Name</span>
                  </label>
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="e.g. Alex Rivera"
                    className="w-full px-3 py-2 text-xs bg-surface-elevated border border-border rounded-lg text-text-primary focus:outline-none focus:border-brand"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-text-secondary flex items-center gap-1.5">
                    <Mail className="w-3 h-3 text-text-muted" />
                    <span>Email Address</span>
                  </label>
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="e.g. user@company.com"
                    className="w-full px-3 py-2 text-xs bg-surface-elevated border border-border rounded-lg text-text-primary focus:outline-none focus:border-brand"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full btn-primary py-2.5 text-xs flex items-center justify-center gap-2 font-medium shadow-subtle mt-4"
                >
                  {isSubmitting ? (
                    <span>Authenticating...</span>
                  ) : (
                    <>
                      <span>{authMode === 'signin' ? 'Sign In to Workspace' : 'Create Workspace & Launch'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>

              <div className="pt-2 text-center text-xs text-text-muted">
                {authMode === 'signin' ? (
                  <span>Don't have an account? <button onClick={() => setAuthMode('signup')} className="text-brand hover:underline font-medium">Create one</button></span>
                ) : (
                  <span>Already have an account? <button onClick={() => setAuthMode('signin')} className="text-brand hover:underline font-medium">Sign in</button></span>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
