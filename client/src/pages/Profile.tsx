import React, { useState, useEffect } from 'react';
import { User, Mail, Briefcase, MapPin, Globe, Check, Save, Sliders } from 'lucide-react';
import { api } from '../lib/api';

export default function Profile() {
  const [profile, setProfile] = useState({
    name: localStorage.getItem('user_name') || 'Prodexa User',
    email: localStorage.getItem('user_email') || 'user@prodexa.ai',
    department: 'Engineering',
    role: 'Lead Architect & Developer',
    timezone: 'IST (UTC +5:30)',
    avatar: localStorage.getItem('user_avatar') || '',
    plan: localStorage.getItem('user_plan') || 'PRO',
  });

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const me = await api.get<any>('/users/me');
        setProfile({
          name: me.name || localStorage.getItem('user_name') || '',
          email: me.email || localStorage.getItem('user_email') || '',
          department: 'Engineering',
          role: me.role || 'Lead Architect & Developer',
          timezone: 'IST (UTC +5:30)',
          avatar: me.avatar || localStorage.getItem('user_avatar') || '',
          plan: me.plan || localStorage.getItem('user_plan') || 'PRO',
        });
      } catch (err) {
        console.error('Failed to load user profile from API:', err);
      }
    };
    loadProfile();
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="border-b border-border/60 pb-4">
        <h1 className="text-xl font-bold text-text-primary">My Profile</h1>
        <p className="text-xs text-text-secondary mt-0.5">Manage details displayed on organization lists.</p>
      </div>

      <form onSubmit={handleSave} className="glass-panel p-6 rounded-2xl space-y-6">
        
        {/* Avatar Area */}
        <div className="flex items-center gap-4 border-b border-border/60 pb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand to-brand-light p-0.5 shadow-glow">
            <div className="w-full h-full rounded-2xl bg-background flex items-center justify-center overflow-hidden">
              {profile.avatar ? (
                <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-8 h-8 text-brand-light" />
              )}
            </div>
          </div>
          <div>
            <h3 className="font-bold text-sm text-text-primary">{profile.name}</h3>
            <span className="text-[10px] text-brand-neon uppercase font-semibold tracking-wider">{profile.department} • {profile.role} ({profile.plan} Plan)</span>
          </div>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs text-text-secondary font-semibold">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full pl-9 pr-4 py-2.5 bg-background border border-border rounded-xl text-xs text-text-primary focus:outline-none focus:border-brand"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-text-secondary font-semibold">Work Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="email" 
                value={profile.email}
                disabled
                className="w-full pl-9 pr-4 py-2.5 bg-background border border-border rounded-xl text-xs text-text-muted focus:outline-none cursor-not-allowed"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-text-secondary font-semibold">Department</label>
            <div className="relative">
              <Briefcase className="w-4 h-4 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                value={profile.department}
                onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                className="w-full pl-9 pr-4 py-2.5 bg-background border border-border rounded-xl text-xs text-text-primary focus:outline-none focus:border-brand"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-text-secondary font-semibold">Role</label>
            <div className="relative">
              <Sliders className="w-4 h-4 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                value={profile.role}
                onChange={(e) => setProfile({ ...profile, role: e.target.value })}
                className="w-full pl-9 pr-4 py-2.5 bg-background border border-border rounded-xl text-xs text-text-primary focus:outline-none focus:border-brand"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-text-secondary font-semibold">Local Timezone</label>
            <div className="relative">
              <Globe className="w-4 h-4 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                value={profile.timezone}
                onChange={(e) => setProfile({ ...profile, timezone: e.target.value })}
                className="w-full pl-9 pr-4 py-2.5 bg-background border border-border rounded-xl text-xs text-text-primary focus:outline-none focus:border-brand"
              />
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-4 border-t border-border/60">
          <button 
            type="submit"
            className="py-2.5 px-5 bg-brand hover:bg-brand-hover text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-glow transition-all hover:scale-[1.01]"
          >
            {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saved ? 'Profile Saved' : 'Save Changes'}
          </button>
        </div>

      </form>

    </div>
  );
}

