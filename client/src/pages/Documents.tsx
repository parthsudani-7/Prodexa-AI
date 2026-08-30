import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Folder, 
  FileText, 
  Upload, 
  Trash2, 
  CheckCircle, 
  Sparkles, 
  Plus, 
  BookOpen, 
  History, 
  AlertCircle, 
  Layers,
  ArrowRight,
  GitCompare
} from 'lucide-react';
import { api } from '../lib/api';

interface DocFile {
  id: string;
  name: string;
  version: string;
  type: string;
  size: string;
  uploader: string;
  date: string;
  chunksCount: number;
  tags: string[];
  linkedProject?: string;
  linkedTasksCount?: number;
  conflictNotice?: string;
}

const SAMPLE_DOCS: DocFile[] = [
  {
    id: 'doc-1',
    name: 'Company_Employee_Handbook_2026.pdf',
    version: 'v4 (Latest)',
    type: 'pdf',
    size: '1.4 MB',
    uploader: 'hr@prodexa.ai',
    date: '2026-08-28',
    chunksCount: 14,
    tags: ['Human Resources', 'Policy'],
    linkedProject: 'Identity Platform',
    linkedTasksCount: 3,
    conflictNotice: 'Replaces 2025 handbook. Authoritative annual leave set to 24 days (Section 5.2).'
  },
  {
    id: 'doc-2',
    name: 'MultiTenant_Architecture_Specs.docx',
    version: 'v2',
    type: 'docx',
    size: '2.1 MB',
    uploader: 'architect@prodexa.ai',
    date: '2026-08-26',
    chunksCount: 22,
    tags: ['Engineering', 'Architecture'],
    linkedProject: 'Identity Platform',
    linkedTasksCount: 5,
  },
  {
    id: 'doc-3',
    name: 'Q3_Enterprise_Brand_Guidelines.pdf',
    version: 'v1',
    type: 'pdf',
    size: '3.8 MB',
    uploader: 'marketing@prodexa.ai',
    date: '2026-08-20',
    chunksCount: 18,
    tags: ['Marketing', 'Brand'],
    linkedProject: 'Mobile App',
    linkedTasksCount: 2,
  }
];

export default function Documents() {
  const [files, setFiles] = useState<DocFile[]>(SAMPLE_DOCS);
  const [search, setSearch] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  const [selectedDoc, setSelectedDoc] = useState<DocFile | null>(SAMPLE_DOCS[0]);
  const [isAutoTagging, setIsAutoTagging] = useState(false);
  const [showConflictModal, setShowConflictModal] = useState(false);

  const handleAutoTagWorkspace = async () => {
    setIsAutoTagging(true);
    setTimeout(() => {
      setFiles(prev => prev.map(f => ({ ...f, tags: Array.from(new Set([...f.tags, 'Auto-Categorized'])) })));
      setIsAutoTagging(false);
      alert('AI Auto-Tagging complete: All documents organized into taxonomy clusters.');
    }, 600);
  };

  const handleLoadSample = () => {
    setFiles(SAMPLE_DOCS);
    setSelectedDoc(SAMPLE_DOCS[0]);
    alert('Sample knowledge objects reloaded with version history and RAG citations.');
  };

  const handleDelete = (id: string) => {
    if (!window.confirm('Delete this knowledge document and its vector embeddings?')) return;
    setFiles(prev => prev.filter(f => f.id !== id));
    if (selectedDoc?.id === id) setSelectedDoc(null);
  };

  const filteredFiles = files.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(search.toLowerCase()) || f.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
    if (selectedFolder === 'all') return matchesSearch;
    return matchesSearch && f.tags.some(t => t.toLowerCase().includes(selectedFolder.toLowerCase()));
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto text-text-primary animate-fade-in font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-brand mb-1">
            <BookOpen className="w-4 h-4" />
            <span>Enterprise Knowledge System</span>
          </div>
          <h1 className="text-xl font-bold text-text-primary tracking-tight">
            Documents & Vector Knowledge Base
          </h1>
          <p className="text-xs text-text-secondary mt-0.5">
            Documents are indexed knowledge objects with vector embeddings, version history, linked tasks, and conflict detection.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleLoadSample}
            className="btn-secondary px-3 py-1.5 text-xs flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5 text-brand" />
            <span>Load Sample Docs</span>
          </button>
          <button
            onClick={handleAutoTagWorkspace}
            disabled={isAutoTagging}
            className="btn-primary px-3.5 py-1.5 text-xs flex items-center gap-1.5 shadow-subtle"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isAutoTagging ? 'Categorizing...' : 'AI Auto-Tag'}</span>
          </button>
        </div>
      </div>

      {/* Smart Conflict Resolution Banner (Section 15) */}
      <div className="card-elevated p-3.5 border-l-2 border-l-brand flex items-start justify-between gap-4">
        <div className="flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-brand flex-shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="text-xs font-semibold text-text-primary">Smart Policy Conflict Resolution Active</span>
            <p className="text-[11px] text-text-secondary">
              Prodexa automatically reconciles conflicting versions (e.g. Employee Handbook 2025 vs 2026) and prioritizes authoritative policies.
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowConflictModal(true)}
          className="btn-secondary px-2.5 py-1 text-xs whitespace-nowrap"
        >
          View Conflicts
        </button>
      </div>

      {/* Folders Taxonomy Filter */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { id: 'all', label: 'All Documents', count: files.length },
          { id: 'human resources', label: 'Human Resources', count: files.filter(f => f.tags.some(t => t.toLowerCase().includes('hr') || t.toLowerCase().includes('policy'))).length },
          { id: 'engineering', label: 'Engineering Specs', count: files.filter(f => f.tags.some(t => t.toLowerCase().includes('eng') || t.toLowerCase().includes('arch'))).length },
          { id: 'marketing', label: 'Marketing & Brand', count: files.filter(f => f.tags.some(t => t.toLowerCase().includes('market') || t.toLowerCase().includes('brand'))).length },
        ].map((folder) => (
          <button
            key={folder.id}
            onClick={() => setSelectedFolder(folder.id)}
            className={`p-3 rounded-lg border text-left transition-colors ${
              selectedFolder === folder.id
                ? 'bg-surface-elevated border-brand text-text-primary'
                : 'card-base hover:border-border-active'
            }`}
          >
            <div className="flex items-center justify-between">
              <Folder className={`w-4 h-4 ${selectedFolder === folder.id ? 'text-brand' : 'text-text-muted'}`} />
              <span className="text-[10px] font-mono text-text-muted">{folder.count} files</span>
            </div>
            <div className="font-semibold text-xs text-text-primary mt-2">{folder.label}</div>
          </button>
        ))}
      </div>

      {/* Two Column Layout: Documents Table & Detail Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table (2 Cols) */}
        <div className="lg:col-span-2 card-base overflow-hidden space-y-3 p-4">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-text-muted" />
            <input
              type="text"
              placeholder="Search documents by name, keyword, or metadata..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-surface-elevated border border-border rounded-lg pl-8 pr-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-brand"
            />
          </div>

          <table className="w-full text-left text-xs">
            <thead className="border-b border-border text-text-muted text-[10px] font-semibold uppercase tracking-wider">
              <tr>
                <th className="pb-2">Document</th>
                <th className="pb-2">Version</th>
                <th className="pb-2">Chunks</th>
                <th className="pb-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredFiles.map((doc) => (
                <tr
                  key={doc.id}
                  onClick={() => setSelectedDoc(doc)}
                  className={`cursor-pointer transition-colors ${
                    selectedDoc?.id === doc.id ? 'bg-surface-elevated' : 'hover:bg-surface-elevated/50'
                  }`}
                >
                  <td className="py-2.5 pr-2">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-brand flex-shrink-0" />
                      <div className="truncate">
                        <span className="font-semibold text-text-primary truncate block">{doc.name}</span>
                        <span className="text-[10px] text-text-muted">{doc.size} • {doc.uploader}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-2.5 font-mono text-[11px] text-text-muted">{doc.version}</td>
                  <td className="py-2.5 font-mono text-[11px] text-success">{doc.chunksCount} chunks</td>
                  <td className="py-2.5 text-right">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(doc.id); }}
                      className="text-text-muted hover:text-danger p-1 transition-colors"
                      title="Delete document"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Knowledge Object Inspector (1 Col - Section 13) */}
        <div className="card-base p-5 space-y-4">
          {selectedDoc ? (
            <>
              <div className="border-b border-border pb-3">
                <span className="text-[10px] font-mono text-brand uppercase tracking-wider">Knowledge Object</span>
                <h3 className="text-xs font-bold text-text-primary mt-1 truncate">{selectedDoc.name}</h3>
                <span className="text-[11px] text-text-muted">{selectedDoc.version} • Indexed on {selectedDoc.date}</span>
              </div>

              {/* RAG Chunks Status */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-text-muted uppercase">Vector Embeddings Status</span>
                <div className="p-2.5 bg-surface-elevated rounded-lg border border-border text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-text-muted">Embedding Model:</span>
                    <span className="font-mono text-text-primary">text-embedding-004</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Indexed Chunks:</span>
                    <span className="font-mono text-success font-semibold">{selectedDoc.chunksCount} segments (100%)</span>
                  </div>
                </div>
              </div>

              {/* Linked Projects & Tasks */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-text-muted uppercase">Connected Graph Links</span>
                <div className="p-2.5 bg-surface-elevated rounded-lg border border-border text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-text-muted">Linked Project:</span>
                    <span className="font-medium text-brand">{selectedDoc.linkedProject || 'Core Workspace'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Linked Tasks:</span>
                    <span className="font-medium text-text-primary">{selectedDoc.linkedTasksCount || 3} tasks</span>
                  </div>
                </div>
              </div>

              {/* Version History (Section 14) */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-text-muted uppercase flex items-center gap-1">
                  <History className="w-3 h-3" />
                  <span>Version Timeline</span>
                </span>
                <div className="space-y-1 text-xs font-mono">
                  <div className="p-2 bg-surface-elevated rounded border border-brand/40 flex justify-between text-text-primary">
                    <span>v4 — Aug 28 (Current)</span>
                    <span className="text-success text-[10px]">Active</span>
                  </div>
                  <div className="p-2 bg-surface rounded border border-border flex justify-between text-text-muted text-[11px]">
                    <span>v3 — Aug 21</span>
                    <span>Archived</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-xs text-text-muted">
              Select a document to inspect its knowledge object graph.
            </div>
          )}
        </div>
      </div>

      {/* Modal: Conflict Resolution */}
      {showConflictModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-xl w-full max-w-lg p-6 shadow-modal space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                <GitCompare className="w-4 h-4 text-brand" />
                <span>Smart Policy Conflict Resolution</span>
              </h3>
              <button onClick={() => setShowConflictModal(false)} className="text-text-muted hover:text-text-primary text-xs">
                Close
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-surface-elevated rounded-lg border border-border space-y-1">
                <div className="font-semibold text-text-primary">Employee Handbook 2025 (Old)</div>
                <p className="text-text-muted font-mono text-[11px]">Section 4.1: Annual casual leave allotted: 20 days.</p>
              </div>

              <div className="p-3 bg-surface-elevated rounded-lg border border-brand/50 space-y-1">
                <div className="font-semibold text-brand">Employee Handbook 2026 (Authoritative)</div>
                <p className="text-text-primary font-mono text-[11px]">Section 5.2: Annual casual leave allotted: 24 days.</p>
              </div>

              <div className="p-3 bg-success/10 border border-success/30 rounded-lg text-success text-[11px] leading-relaxed">
                ✓ AI Resolution Strategy: Using newest policy (2026 revision updated Aug 28). Responses cite Handbook 2026 Section 5.2 with High Confidence.
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowConflictModal(false)}
                className="btn-primary px-4 py-1.5 text-xs"
              >
                Acknowledge & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
