'use client';

import { useWorkspaceStore, type PanelType } from '@/store/workspace-store';
import { 
  Eye, 
  Brain, 
  Keyboard, 
  Layers, 
  Edit3, 
  TrendingUp, 
  BarChart3, 
  Hash, 
  FileText,
  Clock,
  X,
} from 'lucide-react';

interface PanelOption {
  type: PanelType;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const PANEL_OPTIONS: PanelOption[] = [
  {
    type: 'digit-display',
    title: 'Digit Display',
    description: 'View digits with chunking and highlighting',
    icon: <Eye className="w-5 h-5" />,
  },
  {
    type: 'recall-test',
    title: 'Recall Test',
    description: 'Test your memory with position quizzes',
    icon: <Brain className="w-5 h-5" />,
  },
  {
    type: 'practice',
    title: 'Practice Typing',
    description: 'Type digits with real-time feedback',
    icon: <Keyboard className="w-5 h-5" />,
  },
  {
    type: 'chunk-trainer',
    title: 'Chunk Trainer',
    description: 'Learn in groups with flashcard-style review',
    icon: <Layers className="w-5 h-5" />,
  },
  {
    type: 'scratchpad',
    title: 'Scratchpad',
    description: 'Freeform notes and annotations',
    icon: <Edit3 className="w-5 h-5" />,
  },
  {
    type: 'timeline',
    title: 'Number Timeline',
    description: 'Visual timeline of digit positions',
    icon: <Clock className="w-5 h-5" />,
  },
  {
    type: 'progress',
    title: 'Progress Tracker',
    description: 'Track streaks and mastery levels',
    icon: <TrendingUp className="w-5 h-5" />,
  },
  {
    type: 'statistics',
    title: 'Statistics',
    description: 'View accuracy, speed, and history',
    icon: <BarChart3 className="w-5 h-5" />,
  },
  {
    type: 'major-system',
    title: 'Major System',
    description: 'Convert digits to words phonetically',
    icon: <Hash className="w-5 h-5" />,
  },
  {
    type: 'piem',
    title: 'Piem Generator',
    description: 'Create poems where word lengths = digits',
    icon: <FileText className="w-5 h-5" />,
  },
];

export function PanelSelector() {
  const { addTab, togglePanelSelector } = useWorkspaceStore();

  const handleSelect = (type: PanelType) => {
    addTab(type);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 animate-fade-in"
      onClick={togglePanelSelector}
    >
      <div 
        className="bg-[var(--surface)] border border-[var(--border)] rounded-xl w-full max-w-2xl max-h-[80vh] overflow-hidden animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
          <h2 className="text-lg font-semibold">Open Panel</h2>
          <button
            onClick={togglePanelSelector}
            className="p-2 rounded-md hover:bg-[var(--surface-hover)] text-[var(--text-muted)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto">
          {PANEL_OPTIONS.map((option) => (
            <button
              key={option.type}
              onClick={() => handleSelect(option.type)}
              className="flex items-start gap-3 p-4 rounded-lg border border-[var(--border)] hover:border-[var(--primary)] hover:bg-[var(--surface-hover)] text-left transition-colors"
            >
              <div className="p-2 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)]">
                {option.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium">{option.title}</div>
                <div className="text-sm text-[var(--text-muted)]">{option.description}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
