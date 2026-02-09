'use client';

import { useWorkspaceStore } from '@/store/workspace-store';
import { MATH_CONSTANTS } from '@/data/numbers';
import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface NumberSelectorProps {
  collapsed?: boolean;
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

  const handleAddCustom = () => {
    if (customName.trim() && customDigits.trim()) {
      addCustomNumber(customName.trim(), customDigits.trim());
      setCustomName('');
      setCustomDigits('');
      setShowCustomInput(false);
    }
  };

  return (
    <div className="py-2">
      {/* Built-in constants */}
      {MATH_CONSTANTS.map((constant) => (
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
            </div>
          )}
        </button>
      ))}

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
                placeholder="Paste digits here..."
                value={customDigits}
                onChange={(e) => setCustomDigits(e.target.value)}
                className="input text-sm resize-none h-20 font-mono"
              />
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
              className="w-full flex items-center justify-center gap-2 p-2 rounded-md border border-dashed border-[var(--border)] hover:border-[var(--border-hover)] text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm">Add Custom</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
