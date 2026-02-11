'use client';

import type { PanelType } from '@/store/workspace-store';
import {
  Eye,
  Brain,
  Keyboard,
  Layers,
  FileText,
  Paintbrush,
  TrendingUp,
  BarChart3,
  Hash,
  AlignLeft,
  Clock,
  Music,
  Trophy,
  StickyNote,
  X,
} from 'lucide-react';

interface PanelOption {
  type: PanelType;
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface PanelCategory {
  id: string;
  label: string;
  emoji: string;
  description: string;
  panels: PanelOption[];
}

const PANEL_CATEGORIES: PanelCategory[] = [
  {
    id: 'learning',
    label: 'Learning',
    emoji: '📖',
    description: 'Explore and memorize digits',
    panels: [
      { type: 'digit-display', title: 'Digit Display', description: 'View digits with chunking and highlighting', icon: <Eye className="w-5 h-5" /> },
      { type: 'sequence', title: 'Sequence Practice', description: 'Audio-visual sequence with numpad grid', icon: <Music className="w-5 h-5" /> },
      { type: 'chunk-trainer', title: 'Chunk Trainer', description: 'Learn in groups with flashcard-style review', icon: <Layers className="w-5 h-5" /> },
      { type: 'major-system', title: 'Major System', description: 'Convert digits to words phonetically', icon: <Hash className="w-5 h-5" /> },
      { type: 'piem', title: 'Piem Generator', description: 'Create poems where word lengths = digits', icon: <AlignLeft className="w-5 h-5" /> },
    ],
  },
  {
    id: 'testing',
    label: 'Testing',
    emoji: '🧪',
    description: 'Test your recall and speed',
    panels: [
      { type: 'recall-test', title: 'Recall Test', description: 'Type digits from memory and check accuracy', icon: <Brain className="w-5 h-5" /> },
      { type: 'practice', title: 'Practice Typing', description: 'Type digits with real-time feedback', icon: <Keyboard className="w-5 h-5" /> },
    ],
  },
  {
    id: 'statistics',
    label: 'Statistics',
    emoji: '📊',
    description: 'Track your progress and achievements',
    panels: [
      { type: 'progress', title: 'Progress Tracker', description: 'Track streaks and mastery levels', icon: <TrendingUp className="w-5 h-5" /> },
      { type: 'statistics', title: 'Statistics', description: 'View accuracy, speed, and history', icon: <BarChart3 className="w-5 h-5" /> },
      { type: 'timeline', title: 'Number Timeline', description: 'Visual timeline of digit positions', icon: <Clock className="w-5 h-5" /> },
      { type: 'achievements', title: 'Achievements', description: 'View and track your achievements', icon: <Trophy className="w-5 h-5" /> },
    ],
  },
  {
    id: 'tools',
    label: 'Tools',
    emoji: '🛠️',
    description: 'Scratch space and notes',
    panels: [
      { type: 'canvas', title: 'Canvas', description: 'Draw diagrams and visual mnemonics', icon: <Paintbrush className="w-5 h-5" /> },
      { type: 'notes', title: 'Notes', description: 'Text notes and mnemonic strategies', icon: <FileText className="w-5 h-5" /> },
      { type: 'scratchpad', title: 'Scratchpad', description: 'Quick text scratch space', icon: <StickyNote className="w-5 h-5" /> },
    ],
  },
];

interface PanelSelectorProps {
  groupId: string;
  onSelect: (panelType: PanelType) => void;
  onClose: () => void;
}

export function PanelSelector({ groupId, onSelect, onClose }: PanelSelectorProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-[var(--surface)] border border-[var(--border)] rounded-xl w-full max-w-3xl max-h-[85vh] overflow-hidden animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
          <h2 className="text-lg font-semibold">Open Panel</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-md hover:bg-[var(--surface-hover)] text-[var(--text-muted)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 max-h-[70vh] overflow-y-auto space-y-6">
          {PANEL_CATEGORIES.map((category) => (
            <div key={category.id}>
              {/* Category header */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">{category.emoji}</span>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                  {category.label}
                </h3>
                <span className="text-xs text-[var(--text-muted)]">—</span>
                <span className="text-xs text-[var(--text-muted)]">{category.description}</span>
              </div>

              {/* Panel buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {category.panels.map((option) => (
                  <button
                    key={option.type}
                    onClick={() => {
                      // Track panel type opened for achievements
                      try {
                        const opened = JSON.parse(localStorage.getItem('panel-types-opened') || '[]') as string[];
                        if (!opened.includes(option.type)) {
                          opened.push(option.type);
                          localStorage.setItem('panel-types-opened', JSON.stringify(opened));
                        }
                      } catch { /* ignore */ }
                      onSelect(option.type);
                    }}
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
          ))}
        </div>
      </div>
    </div>
  );
}
