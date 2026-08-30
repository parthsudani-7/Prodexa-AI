import React, { useState, useEffect } from 'react';
import { FileText, Download, Share2, Sparkles, RefreshCw, BarChart2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { api } from '../lib/api';

interface Report {
  id: string;
  type: 'Daily' | 'Weekly' | 'Monthly';
  date: string;
  scope: string;
  summary: string;
  insights: string[];
  risks: string[];
  recommendations: string[];
}

export default function Reports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [generating, setGenerating] = useState(false);
  const [selectedRep, setSelectedRep] = useState<string>('');

  const fetchReports = async () => {
    try {
      const data = await api.get<any[]>('/reports');
      const formatted = data.map((r) => ({
        id: r.id,
        type: r.type as any,
        date: r.date,
        scope: r.scope,
        summary: r.summary,
        insights: r.insights || [],
        risks: r.risks || [],
        recommendations: r.recommendations || [],
      }));
      setReports(formatted);
      if (formatted.length > 0 && !selectedRep) {
        setSelectedRep(formatted[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch reports:', err);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleGenerate = async (type: 'Daily' | 'Weekly' | 'Monthly') => {
    setGenerating(true);
    try {
      const newReport = await api.post<any>('/reports/generate', { type });
      const formatted: Report = {
        id: newReport.id,
        type: newReport.type as any,
        date: newReport.date,
        scope: newReport.scope,
        summary: newReport.summary,
        insights: newReport.insights || [],
        risks: newReport.risks || [],
        recommendations: newReport.recommendations || [],
      };
      setReports((prev) => [formatted, ...prev]);
      setSelectedRep(formatted.id);
    } catch (err) {
      console.error('Failed to compile AI report:', err);
    } finally {
      setGenerating(false);
    }
  };

  const activeReport = reports.find(r => r.id === selectedRep) || reports[0];

  return (
    <div className="space-y-6">
      
      {/* Generate Control Panel */}
      <div className="glass-panel p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-md font-bold text-text-primary flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-light" />
            AI Report Generator
          </h2>
          <p className="text-xs text-text-secondary mt-1">Compile code commits, calendar invites, and task statuses into a unified summary.</p>
        </div>
        <div className="flex gap-2.5">
          <button 
            onClick={() => handleGenerate('Daily')}
            disabled={generating}
            className="px-4 py-2 bg-background-elevated hover:bg-border/30 border border-border text-text-primary rounded-xl text-xs font-semibold transition-all"
          >
            Daily
          </button>
          <button 
            onClick={() => handleGenerate('Weekly')}
            disabled={generating}
            className="px-4 py-2 bg-brand hover:bg-brand-hover text-white rounded-xl text-xs font-semibold transition-all shadow-glow"
          >
            Weekly
          </button>
          <button 
            onClick={() => handleGenerate('Monthly')}
            disabled={generating}
            className="px-4 py-2 bg-background-elevated hover:bg-border/30 border border-border text-text-primary rounded-xl text-xs font-semibold transition-all"
          >
            Monthly
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Saved Reports */}
        <div className="glass-panel p-4 rounded-2xl space-y-3">
          <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider mb-2 px-1">Report Archive</h3>
          <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
            {generating && (
              <div className="p-3 bg-background-elevated border border-border/60 rounded-xl text-xs text-text-secondary flex items-center gap-2 animate-pulse">
                <RefreshCw className="w-4 h-4 animate-spin text-brand" />
                <span>Generating summary logs...</span>
              </div>
            )}
            {reports.map(rep => (
              <div 
                key={rep.id}
                onClick={() => setSelectedRep(rep.id)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-colors text-xs ${rep.id === selectedRep ? 'bg-background-elevated border-brand/50 text-text-primary' : 'bg-transparent border-border text-text-secondary hover:bg-border/20'}`}
              >
                <div className="flex justify-between items-center mb-1.5">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${rep.type === 'Weekly' ? 'bg-brand/10 text-brand-neon border border-brand/20' : rep.type === 'Daily' ? 'bg-success/10 text-success border border-success/20' : 'bg-accent/10 text-accent-light border border-accent/20'}`}>
                    {rep.type}
                  </span>
                  <span className="text-[10px] text-text-secondary">{rep.date}</span>
                </div>
                <h4 className="font-semibold text-text-primary mt-1">{rep.scope}</h4>
              </div>
            ))}
            {reports.length === 0 && !generating && (
              <div className="text-center py-8 text-text-secondary">No reports generated yet.</div>
            )}
          </div>
        </div>

        {/* Right: Active Report Viewer */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl space-y-6">
          {activeReport ? (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border/60 pb-4 gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-md font-bold text-text-primary">{activeReport.scope}</h2>
                    <span className="bg-border/60 text-text-secondary text-[10px] px-2 py-0.5 rounded-full">{activeReport.type}</span>
                  </div>
                  <p className="text-[10px] text-text-secondary mt-1">{activeReport.date}</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => alert('Exporting PDF...')}
                    className="p-2 bg-background-elevated hover:bg-border/30 border border-border rounded-xl text-text-secondary hover:text-text-primary transition-colors"
                    title="Export PDF"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => alert('Shareable link copied to clipboard!')}
                    className="p-2 bg-background-elevated hover:bg-border/30 border border-border rounded-xl text-text-secondary hover:text-text-primary transition-colors"
                    title="Share Report"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Exec Summary */}
              <div>
                <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Executive Summary</h3>
                <p className="text-xs text-text-primary leading-relaxed bg-background-elevated/40 p-4 rounded-xl border border-border/60">{activeReport.summary}</p>
              </div>

              {/* Insights / Risks / Recommendations */}
              <div className="space-y-4">
                
                {/* Insights */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-brand-neon flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-brand-neon" />
                    Key Insights
                  </h4>
                  <ul className="space-y-1.5 list-disc pl-4 text-xs text-text-secondary">
                    {activeReport.insights.map((ins, idx) => (
                      <li key={idx} className="leading-relaxed"><span className="text-text-primary">{ins}</span></li>
                    ))}
                  </ul>
                </div>

                {/* Risks */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-danger flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-danger" />
                    Risks Flagged
                  </h4>
                  <ul className="space-y-1.5 list-disc pl-4 text-xs text-text-secondary">
                    {activeReport.risks.map((risk, idx) => (
                      <li key={idx} className="leading-relaxed"><span className="text-text-primary">{risk}</span></li>
                    ))}
                  </ul>
                </div>

                {/* Recommendations */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-success flex items-center gap-1.5">
                    <BarChart2 className="w-4 h-4 text-success" />
                    AI Recommendations
                  </h4>
                  <ul className="space-y-1.5 list-disc pl-4 text-xs text-text-secondary">
                    {activeReport.recommendations.map((rec, idx) => (
                      <li key={idx} className="leading-relaxed"><span className="text-text-primary">{rec}</span></li>
                    ))}
                  </ul>
                </div>

              </div>
            </>
          ) : (
            <div className="text-center py-12 text-text-secondary">Select a report from the archive or trigger compilation.</div>
          )}

        </div>

      </div>

    </div>
  );
}
