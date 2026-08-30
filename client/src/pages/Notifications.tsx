import React, { useState, useEffect } from 'react';
import { Bell, Sparkles, Check, Trash2, ShieldAlert, Award, FileText, Settings } from 'lucide-react';
import { api } from '../lib/api';

interface AlertNotification {
  id: string;
  type: 'ai' | 'task' | 'system' | 'report';
  title: string;
  desc: string;
  time: string;
  read: boolean;
}

export default function Notifications() {
  const [filter, setFilter] = useState<'all' | 'unread' | 'ai' | 'task' | 'system'>('all');
  const [notifications, setNotifications] = useState<AlertNotification[]>([]);

  const fetchNotifications = async () => {
    try {
      const data = await api.get<any[]>('/notifications');
      const formatted = data.map((n) => ({
        id: n.id,
        type: n.type.toLowerCase() as any,
        title: n.title,
        desc: n.desc,
        time: new Date(n.createdAt).toLocaleDateString() + ' ' + new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        read: n.read,
      }));
      setNotifications(formatted);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const toggleRead = async (id: string) => {
    try {
      // Optimistic update
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      await api.put(`/notifications/${id}/read`);
    } catch (err) {
      console.error('Failed to mark notification read:', err);
      fetchNotifications(); // Rollback
    }
  };

  const markAllRead = async () => {
    try {
      // Optimistic update
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      await api.put('/notifications/read-all');
    } catch (err) {
      console.error('Failed to mark all read:', err);
      fetchNotifications(); // Rollback
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  const filtered = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'all') return true;
    return n.type === filter;
  });

  const getIcon = (type: AlertNotification['type']) => {
    switch (type) {
      case 'ai': return <Sparkles className="w-4 h-4 text-brand-light" />;
      case 'task': return <Award className="w-4 h-4 text-warning" />;
      case 'report': return <FileText className="w-4 h-4 text-success" />;
      default: return <Settings className="w-4 h-4 text-text-secondary" />;
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* Header Controls */}
      <div className="flex items-center justify-between border-b border-border/60 pb-4">
        <div>
          <h1 className="text-xl font-bold text-text-primary flex items-center gap-2">
            <Bell className="w-5 h-5 text-brand-light" />
            Alerts & Notifications
          </h1>
          <p className="text-xs text-text-secondary mt-0.5">Stay updated on vector completions, ML task predictions, and quotas.</p>
        </div>
        <button 
          onClick={markAllRead}
          className="text-xs text-brand-neon hover:underline font-semibold flex items-center gap-1.5"
        >
          <Check className="w-3.5 h-3.5" />
          Mark all as read
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1.5 p-1 bg-background-card border border-border rounded-xl w-fit">
        {(['all', 'unread', 'ai', 'task', 'system'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${filter === tab ? 'bg-brand text-white' : 'text-text-secondary hover:text-text-primary'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Notification Lists */}
      <div className="space-y-3">
        {filtered.map(item => (
          <div 
            key={item.id}
            onClick={() => !item.read && toggleRead(item.id)}
            className={`p-4 rounded-2xl border flex items-start justify-between gap-4 transition-all cursor-pointer ${item.read ? 'bg-background-card/40 border-border/80 text-text-secondary' : 'bg-background-elevated border-brand/20 shadow-glow text-text-primary'}`}
          >
            <div className="flex gap-3">
              <div className="p-2.5 bg-background border border-border rounded-xl flex-shrink-0 mt-0.5">
                {getIcon(item.type)}
              </div>
              <div>
                <h4 className="text-xs font-bold flex items-center gap-2">
                  {item.title}
                  {!item.read && <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />}
                </h4>
                <p className="text-xs text-text-secondary mt-1.5 leading-relaxed">{item.desc}</p>
                <span className="text-[9px] text-text-muted mt-2 block">{item.time}</span>
              </div>
            </div>
            
            <button 
              onClick={(e) => {
                e.stopPropagation();
                deleteNotification(item.id);
              }}
              className="p-1 text-text-secondary hover:text-danger hover:bg-danger/10 rounded-lg transition-all flex-shrink-0"
              title="Delete alert"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-text-secondary text-xs bg-background-card/20 rounded-2xl border border-dashed border-border/60">
            No notifications in this category.
          </div>
        )}
      </div>

    </div>
  );
}

