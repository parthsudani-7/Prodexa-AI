import React, { useState, useEffect } from 'react';
import { 
  ChevronRight, 
  ChevronLeft, 
  X, 
  LayoutDashboard, 
  MessageSquare, 
  FileText, 
  CheckSquare, 
  Terminal, 
  Calendar,
  FolderKanban,
  UserCheck
} from 'lucide-react';

interface TourStep {
  stepNumber: number;
  title: string;
  category: string;
  page: string;
  icon: React.ReactNode;
  description: string;
  tip: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    stepNumber: 1,
    title: 'My Work — Personal Command Center',
    category: 'Daily Focus',
    page: 'my-work',
    icon: <UserCheck className="w-4 h-4 text-brand" />,
    description: 'Your central hub for assigned tasks, pending PR reviews, upcoming meetings, and automated AI triage recommendations.',
    tip: '💡 Tip: Click "Apply Action" to automatically resolve detected sprint bottlenecks.'
  },
  {
    stepNumber: 2,
    title: 'Executive Mission Control & Focus Blocks',
    category: 'Dashboard & Metrics',
    page: 'dashboard',
    icon: <LayoutDashboard className="w-4 h-4 text-brand" />,
    description: 'Track 7-day productivity velocity (94%), sprint status breakdown, and lock uninterrupted deep-work focus windows.',
    tip: '💡 Tip: Choose Morning, Afternoon, or Balanced work cycles to protect deep work time.'
  },
  {
    stepNumber: 3,
    title: 'Connected Projects & Milestone Graph',
    category: 'Project Management',
    page: 'projects',
    icon: <FolderKanban className="w-4 h-4 text-brand" />,
    description: 'Unify tasks, documents, pull requests, and meetings under single initiative containers with automated delivery risk assessment.',
    tip: '💡 Tip: Switch between Overview, Tasks, Docs, and Code tabs inside any project.'
  },
  {
    stepNumber: 4,
    title: 'Contextual AI Copilot & Verified Citations',
    category: 'Enterprise Knowledge',
    page: 'chat',
    icon: <MessageSquare className="w-4 h-4 text-brand" />,
    description: 'Query company handbooks and technical specifications. AI answers include verified page citations and specialized persona modes.',
    tip: '💡 Tip: Click starter prompt pills like "Leave Policy" or "System Architecture" for instant answers.'
  },
  {
    stepNumber: 5,
    title: 'Knowledge Base & Document Vector RAG',
    category: 'Knowledge Base',
    page: 'documents',
    icon: <FileText className="w-4 h-4 text-brand" />,
    description: 'Upload PDF/DOCX specs. Prodexa automatically chunks, embeds, and auto-tags files into HR, Engineering, and Marketing taxonomies.',
    tip: '💡 Tip: Click "Load Sample Docs" to immediately test vector retrieval without uploading.'
  },
  {
    stepNumber: 6,
    title: 'Developer AI Code Auditor & PR Reviews',
    category: 'Engineering',
    page: 'code-hub',
    icon: <Terminal className="w-4 h-4 text-brand" />,
    description: 'Audit code snippets for SQL vulnerabilities, O(n²) bottlenecks, and legacy callbacks with one-click side-by-side refactoring.',
    tip: '💡 Tip: Click sample bug buttons to test instant security & performance audits.'
  }
];

interface ProductTourProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: string) => void;
}

export default function ProductTour({ isOpen, onClose, onNavigate }: ProductTourProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    if (isOpen) {
      const step = TOUR_STEPS[currentStepIndex];
      if (step) {
        onNavigate(step.page);
      }
    }
  }, [currentStepIndex, isOpen]);

  if (!isOpen) return null;

  const currentStep = TOUR_STEPS[currentStepIndex];

  const handleNext = () => {
    if (currentStepIndex < TOUR_STEPS.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      localStorage.setItem('has_completed_tour', 'true');
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    localStorage.setItem('has_completed_tour', 'true');
    onClose();
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-fade-in font-sans">
      <div className="w-96 bg-surface border border-border rounded-xl p-5 shadow-modal space-y-3.5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-2.5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-surface-elevated border border-border">
              {currentStep.icon}
            </div>
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-brand">
                {currentStep.category}
              </span>
              <h3 className="text-xs font-bold text-text-primary leading-tight">
                {currentStep.title}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-text-muted">
              {currentStep.stepNumber} / {TOUR_STEPS.length}
            </span>
            <button
              onClick={handleSkip}
              className="text-text-muted hover:text-text-primary p-0.5 transition-colors"
              title="Close tour"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <p className="text-xs text-text-secondary leading-relaxed">
          {currentStep.description}
        </p>

        {/* Contextual Tip */}
        <div className="p-2.5 bg-surface-elevated rounded-lg border border-border text-[11px] text-text-muted leading-snug">
          {currentStep.tip}
        </div>

        {/* Footer Controls */}
        <div className="flex items-center justify-between pt-1">
          <button
            onClick={handleSkip}
            className="text-xs text-text-muted hover:text-text-primary transition-colors"
          >
            Skip tour
          </button>

          <div className="flex items-center gap-2">
            {currentStepIndex > 0 && (
              <button
                onClick={handlePrev}
                className="btn-secondary px-2.5 py-1 text-xs flex items-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            )}

            <button
              onClick={handleNext}
              className="btn-primary px-3 py-1 text-xs flex items-center gap-1 shadow-subtle"
            >
              <span>{currentStepIndex === TOUR_STEPS.length - 1 ? 'Complete ✓' : 'Next'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
