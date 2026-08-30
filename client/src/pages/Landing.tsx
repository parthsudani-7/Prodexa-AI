import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Shield, Sparkles, MessageSquare, FileText, Video, Layout, BarChart, ChevronRight } from 'lucide-react';
import { API_BASE } from '../lib/api';
import ProdexaLogo from '../components/ProdexaLogo';

interface LandingProps {
  onStart: () => void; // Maintained for TS compatibility, but we will redirect directly
}

export default function Landing({ onStart }: LandingProps) {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

  const handleLoginRedirect = () => {
    window.location.href = `${API_BASE}/api/auth/google?origin=${encodeURIComponent(window.location.origin)}`;
  };

  const handleDemoLogin = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/demo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'parth@prodexa.ai', name: 'Parth Sudani' })
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
      } else {
        localStorage.setItem('user_name', 'Parth Sudani');
        localStorage.setItem('user_email', 'parth@prodexa.ai');
        localStorage.setItem('user_plan', 'PRO');
        onStart();
      }
    } catch {
      localStorage.setItem('user_name', 'Parth Sudani');
      localStorage.setItem('user_email', 'parth@prodexa.ai');
      localStorage.setItem('user_plan', 'PRO');
      onStart();
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
    <div className="min-h-screen bg-background text-text-primary selection:bg-brand/30">
      {/* Header */}
      <nav className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between border-b border-border/50 backdrop-blur-md sticky top-0 z-50 bg-background/80">
        <div className="flex items-center gap-3">
          <ProdexaLogo size={36} />
          <span className="text-xl font-bold tracking-tight font-sans text-text-primary">
            Prodexa AI 
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={handleDemoLogin} className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-brand/40 bg-brand/10 hover:bg-brand/20 text-brand-light transition-all">
            Instant Demo Access
          </button>
          <button onClick={handleLoginRedirect} className="text-sm font-medium hover:text-brand transition-colors">Sign In with Google</button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="max-w-6xl mx-auto px-6 pt-20 pb-16 text-center relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand/10 rounded-full blur-[120px] pointer-events-none" />
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-brand/30 bg-brand/5 text-xs text-brand-neon font-medium mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            Introducing Prodexa AI — Workspace Productivity Platform
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-text-primary via-text-primary to-text-secondary">
            Your Organization <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand to-brand-neon">Supercharged with AI</span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-text-secondary mb-10 leading-relaxed">
            Automate daily tasks, summarize audio meetings, analyze team efficiency, and predict burnout risks—all inside a unified workspace powered by company knowledge.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={handleDemoLogin} 
              className="w-full sm:w-auto px-8 py-4 bg-brand hover:bg-brand-hover text-white font-semibold rounded-xl transition-all shadow-glow hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              Enter Workspace <ChevronRight className="w-5 h-5" />
            </button>
            <button 
              onClick={handleLoginRedirect} 
              className="w-full sm:w-auto px-8 py-4 bg-background-card hover:bg-background-elevated border border-border text-text-primary font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
            >
              Sign In with Google
            </button>
          </div>
        </motion.div>
      </header>

      {/* Feature Cards Grid */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-20 border-t border-border/30">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Features Engineered for Output</h2>
          <p className="text-text-secondary max-w-xl mx-auto">Centralized organization tools supercharged with context-aware intelligence models.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, idx) => (
            <motion.div
              key={idx}
              className="glass-panel-interactive p-8 rounded-2xl flex flex-col items-start text-left"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
            >
              <div className="p-3 bg-background-elevated border border-border/60 rounded-xl mb-6 shadow-sm">
                {feat.icon}
              </div>
              <h3 className="text-xl font-bold mb-3">{feat.title}</h3>
              <p className="text-text-secondary text-sm leading-relaxed">{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Interactive Pricing Section */}
      <section className="max-w-6xl mx-auto px-6 py-20 border-t border-border/30">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Sane, Predictable Pricing</h2>
          <p className="text-text-secondary mb-8">Choose the tier that matches your organization size.</p>
          
          <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-background-card border border-border">
            <button 
              onClick={() => setBillingPeriod('monthly')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${billingPeriod === 'monthly' ? 'bg-brand text-white' : 'text-text-secondary'}`}
            >
              Monthly
            </button>
            <button 
              onClick={() => setBillingPeriod('yearly')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${billingPeriod === 'yearly' ? 'bg-brand text-white' : 'text-text-secondary'}`}
            >
              Yearly (Save 20%)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {/* Free Tier */}
          <div className="glass-panel p-8 rounded-2xl flex flex-col justify-between border-t-2 border-t-border/50">
            <div>
              <h3 className="text-lg font-bold text-text-secondary mb-2">Free</h3>
              <div className="text-4xl font-extrabold mb-6">$0</div>
              <p className="text-text-secondary text-sm mb-6">Perfect for testing the waters and personal productivity tracking.</p>
              <ul className="space-y-3.5 text-sm text-text-secondary mb-8">
                <li className="flex items-center gap-2">✓ 20 AI prompts per day</li>
                <li className="flex items-center gap-2">✓ Basic RAG integration</li>
                <li className="flex items-center gap-2">✓ 5 Document uploads</li>
                <li className="flex items-center gap-2">✓ Basic analytics panel</li>
              </ul>
            </div>
            <button onClick={handleLoginRedirect} className="w-full py-3 rounded-xl bg-background-elevated hover:bg-border/30 border border-border text-sm font-semibold transition-all">
              Get Started
            </button>
          </div>

          {/* Pro Tier */}
          <div className="glass-panel p-8 rounded-2xl flex flex-col justify-between border-t-2 border-t-brand relative shadow-glow">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-brand text-[10px] font-bold tracking-widest text-white uppercase shadow-sm">
              Most Popular
            </div>
            <div>
              <h3 className="text-lg font-bold text-brand-neon mb-2">Professional</h3>
              <div className="text-4xl font-extrabold mb-6">
                ${billingPeriod === 'monthly' ? '29' : '23'}
                <span className="text-sm font-normal text-text-secondary">/mo</span>
              </div>
              <p className="text-text-secondary text-sm mb-6">For power users and core teams needing unlimited intelligence capabilities.</p>
              <ul className="space-y-3.5 text-sm text-text-primary mb-8">
                <li className="flex items-center gap-2 text-brand-neon">✓ Unlimited prompt credits</li>
                <li className="flex items-center gap-2">✓ Advanced LLM Models (Gemini 1.5 Pro)</li>
                <li className="flex items-center gap-2">✓ Grounded Company Context (RAG)</li>
                <li className="flex items-center gap-2">✓ Unlimited uploads & vector stores</li>
                <li className="flex items-center gap-2">✓ High-resolution team analytics</li>
              </ul>
            </div>
            <button onClick={handleLoginRedirect} className="w-full py-3 rounded-xl bg-brand hover:bg-brand-hover text-white text-sm font-semibold transition-all shadow-glow">
              Go Professional
            </button>
          </div>

          {/* Enterprise */}
          <div className="glass-panel p-8 rounded-2xl flex flex-col justify-between border-t-2 border-t-accent">
            <div>
              <h3 className="text-lg font-bold text-accent-light mb-2">Enterprise</h3>
              <div className="text-4xl font-extrabold mb-6">Custom</div>
              <p className="text-text-secondary text-sm mb-6">For secure scale, custom vector databases, and multi-tenant SSO controls.</p>
              <ul className="space-y-3.5 text-sm text-text-secondary mb-8">
                <li className="flex items-center gap-2">✓ Everything in Pro</li>
                <li className="flex items-center gap-2">✓ Dedicated Vector Isolation</li>
                <li className="flex items-center gap-2">✓ SLA-backed support & SSO login</li>
                <li className="flex items-center gap-2">✓ Burnout Prediction models</li>
                <li className="flex items-center gap-2">✓ Customized report pipelines</li>
              </ul>
            </div>
            <button onClick={handleLoginRedirect} className="w-full py-3 rounded-xl bg-background-elevated hover:bg-border/30 border border-border text-sm font-semibold transition-all">
              Contact Enterprise
            </button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-5xl mx-auto px-6 py-20 border-t border-border/30 text-center">
        <h2 className="text-3xl font-bold mb-12">Loved by High-Growth Teams</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
          <div className="glass-panel p-6 rounded-2xl">
            <p className="text-text-primary text-sm italic mb-4">
              "We connected our onboarding guides and meeting notes to Prodexa AI. Our engineering hires are shipping code 3 days faster because the answers they need are instantly found in chat."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-border" />
              <div>
                <div className="text-sm font-bold">Sarah Jenkins</div>
                <div className="text-xs text-text-secondary">VP of Product, CloudScale</div>
              </div>
            </div>
          </div>
          <div className="glass-panel p-6 rounded-2xl">
            <p className="text-text-primary text-sm italic mb-4">
              "The meeting summarizer saves us hours. It auto-creates the action items and updates our Kanban board directly. Highly recommended."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-border" />
              <div>
                <div className="text-sm font-bold">Marcus Sterling</div>
                <div className="text-xs text-text-secondary">Founder, NextScale Co.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <footer className="bg-background-card border-t border-border/50 py-16 text-center">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-4">Empower Your Team Today</h2>
          <p className="text-text-secondary mb-8 max-w-md mx-auto">Get started for free. Upgrade whenever you need enterprise compliance or unlimited credits.</p>
          <button 
            onClick={handleLoginRedirect} 
            className="px-8 py-4 bg-brand hover:bg-brand-hover text-white font-semibold rounded-xl shadow-glow transition-all hover:scale-[1.02]"
          >
            Launch Your Copilot
          </button>
        </div>
      </footer>
    </div>
  );
}
