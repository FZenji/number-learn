'use client';

import { useWorkspaceStore } from '@/store/workspace-store';
import { MATH_CONSTANTS, getDigitsOnly } from '@/data/numbers';
import { Plus, Trash2, Upload, Flame, TrendingUp } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface NumberSelectorProps {
  collapsed?: boolean;
}

const MAX_DIGITS = 1001;

interface NumberProgress {
  digitsLearned: number;
  currentStreak: number;
}

export function NumberSelector({ collapsed = false }: NumberSelectorProps) {
  const { 
    selectedNumberId, 
    setSelectedNumber, 
    customNumbers,
    addCustomNumber,
    removeCustomNumber,
  } = useWorkspaceStore();
  
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customDigits, setCustomDigits] = useState('');
  const [progressMap, setProgressMap] = useState<Record<string, NumberProgress>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load progress from localStorage for all numbers
  useEffect(() => {
    const loadProgress = () => {
      const map: Record<string, NumberProgress> = {};
      const allIds = [
        ...MATH_CONSTANTS.map(c => c.id),
        ...customNumbers.map(c => c.id),
      ];
      allIds.forEach(id => {
        try {
          const data = JSON.parse(localStorage.getItem(`progress-${id}`) || '{}');
          map[id] = {
            digitsLearned: data.digitsLearned || 0,
            currentStreak: data.currentStreak || 0,
          };
        } catch {
          map[id] = { digitsLearned: 0, currentStreak: 0 };
        }
      });
      setProgressMap(map);
    };

    loadProgress();
    const interval = setInterval(loadProgress, 5000);
    return () => clearInterval(interval);
  }, [customNumbers]);

  const handleAddCustom = () => {
    if (customName.trim() && customDigits.trim()) {
      // Enforce 1001 digit limit
      const clampedDigits = customDigits.trim().slice(0, MAX_DIGITS);
      addCustomNumber(customName.trim(), clampedDigits);
      setCustomName('');
      setCustomDigits('');
      setShowCustomInput(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      alert('File is too large. Max size is 1MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        let digits = '';
        let name = file.name.replace(/\.[^/.]+$/, '');

        if (file.name.endsWith('.json')) {
          const json = JSON.parse(content);
          digits = json.digits || json.value || (typeof json === 'string' ? json : '');
          if (json.name) name = json.name;
        } else if (file.name.endsWith('.csv')) {
          const lines = content.trim().split('\n');
          digits = lines.map(line => line.split(',')[0]).join('').replace(/[^0-9.]/g, '');
        } else {
          digits = content.replace(/[^0-9.]/g, '');
        }

        // Enforce 1001 digit limit
        digits = digits.slice(0, MAX_DIGITS);

        if (digits.length < 2) {
          alert('Could not extract valid digits from the file.');
          return;
        }

        addCustomNumber(name, digits);
      } catch (error) {
        alert('Error parsing file. Please check the format.');
      }
    };

    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const renderStats = (numberId: string, totalDigits: number) => {
    const progress = progressMap[numberId];
    if (!progress || collapsed) return null;

    return (
      <div className="flex items-center gap-2 mt-0.5">
        {progress.currentStreak > 0 && (
          <span className="flex items-center gap-0.5 text-[10px] text-[var(--warning)]">
            <Flame className="w-3 h-3" />
            {progress.currentStreak}d
          </span>
        )}
        <span className="flex items-center gap-0.5 text-[10px] text-[var(--text-muted)]">
          <TrendingUp className="w-3 h-3" />
          {progress.digitsLearned}/{Math.min(totalDigits, MAX_DIGITS)}
        </span>
      </div>
    );
  };

  return (
    <div className="py-2">
      {/* Built-in constants */}
      {MATH_CONSTANTS.map((constant) => {
        const totalDigits = getDigitsOnly(constant).length;
        return (
          <button
            key={constant.id}
            onClick={() => setSelectedNumber(constant.id)}
            className={`
              w-full flex items-center gap-3 px-3 py-2
              hover:bg-[var(--surface-hover)] transition-colors
              ${selectedNumberId === constant.id ? 'bg-[var(--surface-active)] border-l-2 border-l-[var(--primary)]' : ''}
            `}
            title={constant.name}
          >
            <span className="text-2xl font-mono text-[var(--primary)] w-8 text-center">
              {constant.symbol}
            </span>
            {!collapsed && (
              <div className="flex-1 text-left overflow-hidden">
                <div className="text-sm font-medium truncate">{constant.name}</div>
                <div className="text-xs text-[var(--text-muted)] font-mono truncate">
                  {constant.digits.slice(0, 10)}...
                </div>
                {renderStats(constant.id, totalDigits)}
              </div>
            )}
          </button>
        );
      })}

      {/* Divider */}
      <div className="mx-3 my-2 border-t border-[var(--border)]" />

      {/* Custom numbers */}
      {customNumbers.map((num) => (
        <div
          key={num.id}
          className={`
            group flex items-center gap-2 px-3 py-2
            hover:bg-[var(--surface-hover)] transition-colors
            ${selectedNumberId === num.id ? 'bg-[var(--surface-active)] border-l-2 border-l-[var(--primary)]' : ''}
          `}
        >
          <button
            onClick={() => setSelectedNumber(num.id)}
            className="flex-1 flex items-center gap-3 text-left overflow-hidden"
          >
            <span className="text-xl font-mono text-[var(--text-secondary)] w-8 text-center">
              #
            </span>
            {!collapsed && (
              <div className="flex-1 overflow-hidden">
                <div className="text-sm font-medium truncate">{num.name}</div>
                <div className="text-xs text-[var(--text-muted)] font-mono truncate">
                  {num.digits.slice(0, 10)}...
                </div>
                {renderStats(num.id, num.digits.replace(/[^0-9]/g, '').length)}
              </div>
            )}
          </button>
          {!collapsed && (
            <button
              onClick={() => removeCustomNumber(num.id)}
              className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-[var(--error)]/20 text-[var(--error)] transition-opacity"
              title="Remove"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      ))}

      {/* Add custom button */}
      {!collapsed && (
        <div className="px-3 py-2">
          {showCustomInput ? (
            <div className="space-y-2 animate-fade-in">
              <input
                type="text"
                placeholder="Name"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="input text-sm"
                autoFocus
              />
              <textarea
                placeholder={`Paste digits here (max ${MAX_DIGITS})...`}
                value={customDigits}
                onChange={(e) => setCustomDigits(e.target.value.slice(0, MAX_DIGITS))}
                className="input text-sm resize-none h-20 font-mono"
                maxLength={MAX_DIGITS}
              />
              <div className="text-xs text-[var(--text-muted)] text-right">
                {customDigits.length}/{MAX_DIGITS}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleAddCustom}
                  className="btn btn-primary flex-1 text-sm py-2"
                  disabled={!customName.trim() || !customDigits.trim()}
                >
                  Add
                </button>
                <button
                  onClick={() => setShowCustomInput(false)}
                  className="btn btn-secondary text-sm py-2"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowCustomInput(true)}
              className="w-full flex items-center justify-center gap-2 p-2 rounded-md border border-dashed border-[var(--border)] hover:border-[var(--border-hover)] text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors mb-2"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm">Add Custom</span>
            </button>
          )}
          
          {/* File upload */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.csv,.json"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 p-2 rounded-md bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--border-hover)] text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span className="text-sm">Upload File</span>
          </button>
          <p className="text-xs text-[var(--text-muted)] text-center mt-2">
            .txt, .csv, or .json (max {MAX_DIGITS} digits)
          </p>
        </div>
      )}
    </div>
  );
}
