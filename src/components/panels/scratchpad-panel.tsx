'use client';

import { useState, useMemo, useEffect } from 'react';
import { NUMBER_BANK } from '@/data/numbers';
import { useWorkspaceStore } from '@/store/workspace-store';
import { Save, Trash2, WrapText } from 'lucide-react';

interface ScratchpadPanelProps {
  numberId: string;
}

export function ScratchpadPanel({ numberId }: ScratchpadPanelProps) {
  const { customNumbers } = useWorkspaceStore();
  const [content, setContent] = useState('');
  const [saved, setSaved] = useState(false);
  const [wordWrap, setWordWrap] = useState(true);

  const number = useMemo(() => {
    const builtIn = NUMBER_BANK.find(c => c.id === numberId);
    if (builtIn) return builtIn;
    return customNumbers.find(c => c.id === numberId);
  }, [numberId, customNumbers]);

  const storageKey = `scratchpad-${numberId}`;

  // Load saved content
  useEffect(() => {
    const savedContent = localStorage.getItem(storageKey);
    if (savedContent) {
      setContent(savedContent);
    } else {
      setContent('');
    }
  }, [storageKey]);

  // Auto-save after changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (content) {
        localStorage.setItem(storageKey, content);
        setSaved(true);
        setTimeout(() => setSaved(false), 1500);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [content, storageKey]);

  const handleClear = () => {
    if (confirm('Clear scratchpad?')) {
      setContent('');
      localStorage.removeItem(storageKey);
    }
  };

  if (!number) {
    return <div className="text-[var(--text-muted)]">Number not found</div>;
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-semibold">
          Scratchpad - {number.name}
        </h2>
        <div className="flex items-center gap-2">
          {saved && (
            <span className="text-sm text-[var(--success)] flex items-center gap-1 animate-fade-in">
              <Save className="w-4 h-4" />
              Saved
            </span>
          )}
          <button
            onClick={() => setWordWrap(!wordWrap)}
            className={`btn btn-ghost p-2 ${!wordWrap ? 'text-[var(--primary)]' : 'text-[var(--text-muted)]'}`}
            title={wordWrap ? 'Disable word wrap' : 'Enable word wrap'}
          >
            <WrapText className="w-4 h-4" />
          </button>
          <button onClick={handleClear} className="btn btn-ghost text-[var(--error)]">
            <Trash2 className="w-4 h-4" />
            Clear
          </button>
        </div>
      </div>

      {/* Character count */}
      <div className="text-xs text-[var(--text-muted)] mb-2 text-right">
        {content.length} characters
      </div>

      {/* Scratchpad textarea */}
      <div className="flex-1 flex flex-col">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="flex-1 w-full p-4 bg-[var(--surface)] border border-[var(--border)] rounded-lg resize-none focus:outline-none focus:border-[var(--primary)] font-mono text-sm leading-relaxed"
          style={{ whiteSpace: wordWrap ? 'pre-wrap' : 'pre', overflowWrap: wordWrap ? 'break-word' : 'normal' }}
          placeholder={`Quick scratch space for ${number.name}...\n\nJot down digits, patterns, calculations, or anything temporary.\nAuto-saved locally.`}
        />
      </div>
    </div>
  );
}
