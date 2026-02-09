'use client';

import { useWorkspaceStore } from '@/store/workspace-store';
import { KEYBINDING_DOCS } from '@/hooks/use-keybindings';
import { X, Keyboard } from 'lucide-react';

export function KeybindingsModal() {
  const { toggleKeybindingsModal } = useWorkspaceStore();

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 animate-fade-in"
      onClick={toggleKeybindingsModal}
    >
      <div 
        className="bg-[var(--surface)] border border-[var(--border)] rounded-xl w-full max-w-md overflow-hidden animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-[var(--primary)]" />
            <h2 className="text-lg font-semibold">Keyboard Shortcuts</h2>
          </div>
          <button
            onClick={toggleKeybindingsModal}
            className="p-2 rounded-md hover:bg-[var(--surface-hover)] text-[var(--text-muted)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4">
          <table className="w-full">
            <tbody>
              {KEYBINDING_DOCS.map((binding, index) => (
                <tr 
                  key={binding.shortcut}
                  className={index !== KEYBINDING_DOCS.length - 1 ? 'border-b border-[var(--border)]' : ''}
                >
                  <td className="py-3 pr-4">
                    <span className="kbd">{binding.shortcut}</span>
                  </td>
                  <td className="py-3 text-[var(--text-secondary)]">
                    {binding.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-4 pb-4">
          <p className="text-xs text-[var(--text-muted)] text-center">
            Press <span className="kbd">Escape</span> to close this modal
          </p>
        </div>
      </div>
    </div>
  );
}
