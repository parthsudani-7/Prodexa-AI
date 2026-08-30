import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Shield, 
  Sliders, 
  ToggleLeft, 
  ToggleRight, 
  Check, 
  Palette, 
  CreditCard as CardIcon, 
  X,
  Users,
  Building2,
  Clock,
  UserPlus,
  Trash2,
  ShieldCheck,
  Search,
  Sparkles,
  RefreshCw,
  Download,
  Upload,
  Laptop,
  Smartphone,
  GitBranch,
  MessageSquare
} from 'lucide-react';
import { api } from '../lib/api';

type TabType = 'workspace' | 'members' | 'audit' | 'billing' | 'security' | 'integrations' | 'preferences';

export default function Settings() {
  const [activeTab, setActiveTab] = useState<TabType>('workspace');
  
  // Workspace & Members states
  const [workspace, setWorkspace] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([
    { id: 'm-1', userId: 'usr-1', name: 'Parth Sudani', email: 'parth@prodexa.ai', role: 'OWNER', joinedAt: new Date().toISOString() },
    { id: 'm-2', userId: 'usr-2', name: 'Rahul Verma', email: 'rahul@prodexa.ai', role: 'ADMIN', joinedAt: '2026-08-20' },
    { id: 'm-3', userId: 'usr-3', name: 'Ananya Sharma', email: 'ananya@prodexa.ai', role: 'MANAGER', joinedAt: '2026-08-24' }
  ]);
  const [userRole, setUserRole] = useState<string>('OWNER');
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('EMPLOYEE');
  const [inviteLoading, setInviteLoading] = useState(false);

  // Active Sessions (Part 14, Change 63)
  const [sessions, setSessions] = useState<any[]>([
    { id: 'sess-1', device: 'Chrome on Windows 11', ip: '127.0.0.1 (Current)', lastActive: 'Active Now', current: true },
    { id: 'sess-2', device: 'Safari on macOS Sequoia', ip: '49.36.12.84', lastActive: '2 hours ago', current: false },
    { id: 'sess-3', device: 'Prodexa Mobile on iOS 18', ip: '103.21.244.0', lastActive: 'Yesterday', current: false }
  ]);

  // Integration Health (Part 13, Change 58)
  const [integrations, setIntegrations] = useState<any[]>([
    { id: 'github', name: 'GitHub Enterprise', status: 'Connected', lastSync: '2 min ago', repos: 4, icon: <GitBranch className="w-4 h-4 text-text-primary" /> },
    { id: 'slack', name: 'Slack Workspace', status: 'Connected', lastSync: '5 min ago', repos: 2, icon: <MessageSquare className="w-4 h-4 text-warning" /> },
    { id: 'gcal', name: 'Google Calendar', status: 'Connected', lastSync: '10 min ago', repos: 1, icon: <Clock className="w-4 h-4 text-brand" /> },
  ]);

  // Audit Logs states
  const [auditLogs, setAuditLogs] = useState<any[]>([
    { id: 'log-1', action: 'USER_LOGIN', resourceType: 'SECURITY', ipAddress: '127.0.0.1', createdAt: new Date().toISOString(), actor: { email: 'parth@prodexa.ai' } },
    { id: 'log-2', action: 'WORKSPACE_INITIALIZED', resourceType: 'ORGANIZATION', ipAddress: '127.0.0.1', createdAt: new Date().toISOString(), actor: { email: 'parth@prodexa.ai' } },
    { id: 'log-3', action: 'RBAC_ROLE_UPDATED', resourceType: 'MEMBERSHIP', ipAddress: '127.0.0.1', createdAt: new Date().toISOString(), actor: { email: 'parth@prodexa.ai' } }
  ]);
  const [auditSearch, setAuditSearch] = useState('');

  // Billing states
  const [userPlan, setUserPlan] = useState(localStorage.getItem('user_plan') || 'FREE');
  const [invoices, setInvoices] = useState<any[]>([
    { id: 'INV-2026-001', date: new Date().toISOString().split('T')[0], plan: 'PRO', amount: 29, status: 'PAID' }
  ]);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [targetUpgradePlan, setTargetUpgradePlan] = useState<'PRO' | 'ENTERPRISE'>('PRO');
  const [upgradeLoading, setUpgradeLoading] = useState(false);

  // Security states
  const [twoFactor, setTwoFactor] = useState(true);
  const [singleSignOn, setSingleSignOn] = useState(false);

  const handleRevokeSession = (id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
    alert('Session revoked and device signed out.');
  };

  const handleSignOutOtherSessions = () => {
    setSessions(prev => prev.filter(s => s.current));
    alert('All other remote devices signed out successfully.');
  };

  const handleSyncIntegration = (name: string) => {
    alert(`Triggered real-time synchronization with ${name}.`);
  };

  const handleExportData = (format: string) => {
    const data = JSON.stringify({ workspace, members, auditLogs }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prodexa_workspace_export.${format.toLowerCase()}`;
    a.click();
    alert(`Export complete: prodexa_workspace_export.${format.toLowerCase()} downloaded.`);
  };

  const handleUpgradeSubscription = async () => {
    setUpgradeLoading(true);
    setUserPlan(targetUpgradePlan);
    localStorage.setItem('user_plan', targetUpgradePlan);
    window.dispatchEvent(new Event('user_plan_updated'));
    
    const newInvoice = {
      id: `INV-2026-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      date: new Date().toISOString().split('T')[0],
      plan: targetUpgradePlan,
      amount: targetUpgradePlan === 'ENTERPRISE' ? 149 : 29,
      status: 'PAID'
    };
    setInvoices(prev => [newInvoice, ...prev]);

    setTimeout(() => {
      setUpgradeLoading(false);
      setShowCheckoutModal(false);
      alert(`🎉 Congratulations! Your workspace has been upgraded to the ${targetUpgradePlan} plan successfully.`);
    }, 600);
  };

  const filteredAuditLogs = auditLogs.filter((log) => {
    if (!auditSearch) return true;
    const q = auditSearch.toLowerCase();
    return (
      log.action?.toLowerCase().includes(q) ||
      log.resourceType?.toLowerCase().includes(q) ||
      log.actor?.email?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in text-text-primary font-sans">
      {/* Header */}
      <div className="border-b border-border pb-4">
        <h1 className="text-xl font-bold tracking-tight text-text-primary flex items-center gap-2">
          <Sliders className="w-5 h-5 text-brand" />
          Settings & Enterprise Administration
        </h1>
        <p className="text-xs text-text-secondary mt-0.5">
          Manage workspace profile, team RBAC permissions, compliance audit trails, integrations, and session security.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-1.5 border-b border-border pb-2">
        {(['workspace', 'members', 'audit', 'integrations', 'billing', 'security', 'preferences'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
              activeTab === tab
                ? 'bg-surface-elevated text-text-primary border border-border font-semibold text-brand'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-elevated/50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ─── TAB 1: WORKSPACE & DATA PORTABILITY ─────────────────────────── */}
      {activeTab === 'workspace' && (
        <div className="space-y-6">
          <div className="card-base p-5 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-text-secondary flex items-center gap-2">
              <Building2 className="w-4 h-4 text-brand" />
              Active Workspace Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-medium text-text-muted block mb-1">Workspace Name</label>
                <input
                  type="text"
                  readOnly
                  value="Parth's Workspace"
                  className="w-full bg-surface-elevated border border-border rounded-lg px-3 py-2 text-xs text-text-primary"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-text-muted block mb-1">Organization Identifier</label>
                <input
                  type="text"
                  readOnly
                  value="org_primary_workspace"
                  className="w-full bg-surface-elevated border border-border rounded-lg px-3 py-2 text-xs text-text-muted font-mono"
                />
              </div>
            </div>
          </div>

          {/* Data Portability (Part 13, Change 59) */}
          <div className="card-base p-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary flex items-center gap-2">
              <Download className="w-4 h-4 text-brand" />
              Data Portability, Backups & Export
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Export your entire workspace graph including tasks, indexed documents metadata, and compliance audit events in standard JSON or CSV.
            </p>
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => handleExportData('JSON')}
                className="btn-secondary px-3 py-1.5 text-xs flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Workspace (JSON)</span>
              </button>
              <button
                onClick={() => handleExportData('CSV')}
                className="btn-secondary px-3 py-1.5 text-xs flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Audit Trail (CSV)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 2: TEAM & RBAC ─────────────────────────────────────────── */}
      {activeTab === 'members' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-text-secondary">Workspace Team Members ({members.length})</h2>
              <p className="text-xs text-text-muted">Enforce backend role-based access control across permissions domains.</p>
            </div>
            <button
              onClick={() => setInviteModalOpen(true)}
              className="btn-primary px-3 py-1.5 text-xs flex items-center gap-1.5 shadow-subtle"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Invite Member</span>
            </button>
          </div>

          <div className="card-base overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border text-text-muted text-[10px] font-semibold uppercase tracking-wider">
                <tr>
                  <th className="p-3">Member</th>
                  <th className="p-3">Role Privilege</th>
                  <th className="p-3">Joined Date</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {members.map((m) => (
                  <tr key={m.id} className="hover:bg-surface-elevated/40 transition-colors">
                    <td className="p-3 font-medium text-text-primary">
                      {m.name} <span className="text-text-muted font-normal">({m.email})</span>
                    </td>
                    <td className="p-3">
                      <span className="font-mono text-[11px] text-brand bg-brand-muted px-2 py-0.5 rounded">
                        {m.role}
                      </span>
                    </td>
                    <td className="p-3 text-text-muted font-mono text-[11px]">{m.joinedAt}</td>
                    <td className="p-3 text-right">
                      {m.role !== 'OWNER' && (
                        <button
                          onClick={() => setMembers(prev => prev.filter(x => x.id !== m.id))}
                          className="text-text-muted hover:text-danger p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── TAB 3: AUDIT LOGS ─────────────────────────────────────────── */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-text-secondary flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-success" />
              <span>Append-Only Security Audit Trail</span>
            </h2>
            <input
              type="text"
              placeholder="Filter actions or actor email..."
              value={auditSearch}
              onChange={(e) => setAuditSearch(e.target.value)}
              className="bg-surface-elevated border border-border rounded-lg px-3 py-1.5 text-xs text-text-primary w-64 focus:outline-none focus:border-brand"
            />
          </div>

          <div className="card-base overflow-hidden">
            <table className="w-full text-left text-xs font-mono">
              <thead className="border-b border-border text-text-muted text-[10px] uppercase tracking-wider">
                <tr>
                  <th className="p-3">Action</th>
                  <th className="p-3">Domain</th>
                  <th className="p-3">Actor</th>
                  <th className="p-3">IP Address</th>
                  <th className="p-3 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredAuditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-surface-elevated/40 transition-colors">
                    <td className="p-3 font-semibold text-brand">{log.action}</td>
                    <td className="p-3 text-text-primary">{log.resourceType}</td>
                    <td className="p-3 text-text-secondary">{log.actor?.email}</td>
                    <td className="p-3 text-text-muted">{log.ipAddress}</td>
                    <td className="p-3 text-right text-text-muted">{new Date(log.createdAt).toLocaleTimeString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── TAB 4: INTEGRATIONS HEALTH CENTER (Part 13, Change 58) ──────── */}
      {activeTab === 'integrations' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-text-secondary">
              Connected Platform Integrations
            </h2>
            <span className="text-xs text-success font-medium flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> All Services Operational
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {integrations.map((int) => (
              <div key={int.id} className="card-base p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {int.icon}
                    <h3 className="text-xs font-bold text-text-primary">{int.name}</h3>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-success/15 text-success">
                    {int.status}
                  </span>
                </div>

                <div className="text-[11px] text-text-muted space-y-1">
                  <div>Last synchronized: <span className="text-text-primary font-mono">{int.lastSync}</span></div>
                  <div>Connected channels/repos: <span className="text-text-primary font-mono">{int.repos}</span></div>
                </div>

                <div className="pt-2 border-t border-border flex justify-between items-center">
                  <button
                    onClick={() => handleSyncIntegration(int.name)}
                    className="btn-secondary px-2.5 py-1 text-xs flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Sync Now</span>
                  </button>
                  <span className="text-[10px] text-text-muted font-mono">ID: {int.id}_live</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── TAB 5: BILLING & USAGE ──────────────────────────────────────── */}
      {activeTab === 'billing' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`card-base p-5 space-y-3 ${userPlan === 'FREE' ? 'border-brand' : ''}`}>
              <h3 className="text-xs font-bold text-text-primary">Free Tier</h3>
              <div className="text-2xl font-bold text-text-primary">$0 <span className="text-xs font-normal text-text-muted">/mo</span></div>
              <ul className="text-xs text-text-secondary space-y-1.5">
                <li>• 20 AI Prompts / day</li>
                <li>• 5 Vector Documents</li>
                <li>• 3 Team Seats</li>
              </ul>
              <button disabled={userPlan === 'FREE'} className="btn-secondary w-full py-1.5 text-xs mt-3">
                {userPlan === 'FREE' ? 'Current Plan' : 'Downgrade'}
              </button>
            </div>

            <div className={`card-elevated p-5 space-y-3 ${userPlan === 'PRO' ? 'border-brand' : ''}`}>
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold text-text-primary">Professional</h3>
                <span className="text-[9px] font-bold text-brand bg-brand-muted px-1.5 py-0.5 rounded uppercase">Popular</span>
              </div>
              <div className="text-2xl font-bold text-text-primary">$29 <span className="text-xs font-normal text-text-muted">/mo</span></div>
              <ul className="text-xs text-text-secondary space-y-1.5">
                <li>• Unlimited AI Prompts</li>
                <li>• 100 Vector Documents</li>
                <li>• 20 Team Seats & RBAC</li>
              </ul>
              <button
                onClick={() => { setTargetUpgradePlan('PRO'); setShowCheckoutModal(true); }}
                className="btn-primary w-full py-1.5 text-xs mt-3 shadow-subtle"
              >
                {userPlan === 'PRO' ? 'Active Plan' : 'Upgrade to Pro'}
              </button>
            </div>

            <div className={`card-base p-5 space-y-3 ${userPlan === 'ENTERPRISE' ? 'border-brand' : ''}`}>
              <h3 className="text-xs font-bold text-text-primary">Enterprise</h3>
              <div className="text-2xl font-bold text-text-primary">$149 <span className="text-xs font-normal text-text-muted">/mo</span></div>
              <ul className="text-xs text-text-secondary space-y-1.5">
                <li>• Dedicated Vector Isolation</li>
                <li>• 500 Team Seats</li>
                <li>• Enforced SAML SSO</li>
              </ul>
              <button
                onClick={() => { setTargetUpgradePlan('ENTERPRISE'); setShowCheckoutModal(true); }}
                className="btn-secondary w-full py-1.5 text-xs mt-3"
              >
                {userPlan === 'ENTERPRISE' ? 'Active Plan' : 'Upgrade to Enterprise'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 6: SECURITY & DEVICE SESSIONS (Part 14, Change 63) ──────── */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <div className="card-base p-5 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-text-secondary flex items-center gap-2">
              <Shield className="w-4 h-4 text-brand" />
              Authentication & Enterprise Policies
            </h2>

            <div className="flex items-center justify-between py-3 border-b border-border">
              <div>
                <div className="text-xs font-semibold text-text-primary">Two-Factor Authentication (2FA)</div>
                <div className="text-[11px] text-text-muted">Enforce TOTP authenticator verification on session login.</div>
              </div>
              <button onClick={() => setTwoFactor(!twoFactor)} className="text-brand">
                {twoFactor ? <ToggleRight className="w-7 h-7" /> : <ToggleLeft className="w-7 h-7 text-text-muted" />}
              </button>
            </div>

            <div className="flex items-center justify-between py-3">
              <div>
                <div className="text-xs font-semibold text-text-primary">SAML 2.0 / Single Sign-On (SSO)</div>
                <div className="text-[11px] text-text-muted">Delegate identity authentication to Okta or Google Workspace.</div>
              </div>
              <button onClick={() => setSingleSignOn(!singleSignOn)} className="text-brand">
                {singleSignOn ? <ToggleRight className="w-7 h-7" /> : <ToggleLeft className="w-7 h-7 text-text-muted" />}
              </button>
            </div>
          </div>

          {/* Active Sessions & Device Revocation (Part 14, Change 63) */}
          <div className="card-base p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                  Active Sessions & Registered Devices
                </h3>
                <p className="text-xs text-text-muted">Manage currently logged in browsers and revoke compromised sessions.</p>
              </div>
              <button
                onClick={handleSignOutOtherSessions}
                className="btn-secondary px-3 py-1.5 text-xs text-danger hover:border-danger/50"
              >
                Sign Out All Other Devices
              </button>
            </div>

            <div className="space-y-2.5">
              {sessions.map((sess) => (
                <div key={sess.id} className="p-3 bg-surface-elevated rounded-lg border border-border flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <Laptop className="w-4 h-4 text-brand" />
                    <div>
                      <div className="font-semibold text-text-primary flex items-center gap-2">
                        <span>{sess.device}</span>
                        {sess.current && (
                          <span className="text-[9px] font-semibold bg-success/15 text-success px-1.5 py-0.5 rounded">Current Session</span>
                        )}
                      </div>
                      <div className="text-[11px] text-text-muted font-mono">{sess.ip} • {sess.lastActive}</div>
                    </div>
                  </div>

                  {!sess.current && (
                    <button
                      onClick={() => handleRevokeSession(sess.id)}
                      className="text-text-muted hover:text-danger text-xs font-medium"
                    >
                      Revoke
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 7: PREFERENCES ─────────────────────────────────────────── */}
      {activeTab === 'preferences' && (
        <div className="card-base p-5 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-text-secondary flex items-center gap-2">
            <Palette className="w-4 h-4 text-brand" />
            Enterprise UI Density & Preferences
          </h2>
          <p className="text-xs text-text-secondary leading-relaxed">
            Prodexa uses standardized dark neutral tokens (<code className="text-brand font-mono text-[11px]">#0B0D10</code>) optimized for long 8-hour developer work sessions.
          </p>
        </div>
      )}

      {/* Modal: Upgrade Checkout */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-xl w-full max-w-md p-6 shadow-modal space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                <CardIcon className="w-4 h-4 text-brand" />
                Upgrade to {targetUpgradePlan} Plan
              </h3>
              <button onClick={() => setShowCheckoutModal(false)} className="text-text-muted hover:text-text-primary text-xs">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-surface-elevated rounded-lg border border-border text-xs flex justify-between font-semibold text-text-primary">
              <span>Total Due Today:</span>
              <span>{targetUpgradePlan === 'ENTERPRISE' ? '$149.00' : '$29.00'} / mo</span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] text-text-muted block mb-1">Card Number</label>
                <input
                  type="text"
                  readOnly
                  value="4242 •••• •••• 4242 (Test Visa)"
                  className="w-full bg-surface-elevated border border-border rounded px-3 py-1.5 font-mono text-text-primary"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button onClick={() => setShowCheckoutModal(false)} className="btn-secondary px-3 py-1.5 text-xs">
                Cancel
              </button>
              <button
                disabled={upgradeLoading}
                onClick={handleUpgradeSubscription}
                className="btn-primary px-4 py-1.5 text-xs shadow-subtle"
              >
                {upgradeLoading ? 'Processing...' : 'Confirm Upgrade'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
