'use client';

import { useState, useMemo, useEffect } from 'react';
import { NUMBER_BANK } from '@/data/numbers';
import { useWorkspaceStore } from '@/store/workspace-store';
import { Save, Trash2, FileText } from 'lucide-react';

interface NotesPanelProps {
  numberId: string;
}

export function NotesPanel({ numberId }: NotesPanelProps) {
  const { customNumbers } = useWorkspaceStore();
  const [content, setContent] = useState('');
  const [saved, setSaved] = useState(false);

  const number = useMemo(() => {
    const builtIn = NUMBER_BANK.find(c => c.id === numberId);
    if (builtIn) return builtIn;
    return customNumbers.find(c => c.id === numberId);
  }, [numberId, customNumbers]);

  const storageKey = `notes-${numberId}`;

  // Load saved content
  useEffect(() => {
    const savedContent = localStorage.getItem(storageKey);
    if (savedContent) {
      setContent(savedContent);
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
    if (confirm('Clear all notes?')) {
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
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <FileText className="w-5 h-5 text-[var(--primary)]" />
          Notes - {number.name}
        </h2>
        <div className="flex items-center gap-2">
          {saved && (
            <span className="text-sm text-[var(--success)] flex items-center gap-1 animate-fade-in">
              <Save className="w-4 h-4" />
              Saved
            </span>
          )}
          <button onClick={handleClear} className="btn btn-ghost text-[var(--error)]">
            <Trash2 className="w-4 h-4" />
            Clear
          </button>
        </div>
      </div>

      {/* Notes textarea */}
      <div className="flex-1 flex flex-col">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="flex-1 w-full p-4 bg-[var(--surface)] border border-[var(--border)] rounded-lg resize-none focus:outline-none focus:border-[var(--primary)] font-mono text-sm leading-relaxed"
          placeholder={`Write notes, mnemonics, or anything to help you remember ${number.name}...

Ideas:
- Create stories linking digit groups
- Write down patterns you notice
- Practice Major System conversions
- Draft your own Piem

Your notes are auto-saved locally.`}
        />
      </div>

      {/* Tips */}
      <div className="mt-4 p-4 bg-[var(--surface)] rounded-lg border border-[var(--border)]">
        <h3 className="text-sm font-medium mb-2">Memory Tips</h3>
        <ul className="text-sm text-[var(--text-muted)] space-y-1">
          <li>• Create visual stories for each chunk of digits</li>
          <li>• Use the Major System to convert digits to words</li>
          <li>• Link your words/images to specific locations (Memory Palace)</li>
          <li>• Review your notes regularly for spaced repetition</li>
        </ul>
      </div>
    </div>
  );
}
