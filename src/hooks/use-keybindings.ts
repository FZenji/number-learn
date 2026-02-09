'use client';

import { useEffect } from 'react';
import { useWorkspaceStore, type PanelType } from '@/store/workspace-store';

interface KeyBinding {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: () => void;
  description: string;
}

export function useKeybindings() {
  const {
    addTab,
    closeTab,
    activeTabId,
    nextTab,
    prevTab,
    jumpToTab,
    toggleKeybindingsModal,
    togglePanelSelector,
    showPanelSelector,
    showKeybindingsModal,
  } = useWorkspaceStore();

  useEffect(() => {
    const bindings: KeyBinding[] = [
      // Simple keys (no modifiers needed)
      {
        key: 't',
        action: () => togglePanelSelector(),
        description: 'New panel',
      },
      {
        key: 'w',
        action: () => activeTabId && closeTab(activeTabId),
        description: 'Close tab',
      },
      {
        key: '?',
        action: () => toggleKeybindingsModal(),
        description: 'Show keybindings',
      },
      // Tab switching with Tab key
      {
        key: 'Tab',
        action: () => nextTab(),
        description: 'Next tab',
      },
      {
        key: 'Tab',
        shift: true,
        action: () => prevTab(),
        description: 'Previous tab',
      },
      // Number keys 1-9 for jumping to tabs (no modifier needed)
      ...Array.from({ length: 9 }, (_, i) => ({
        key: String(i + 1),
        action: () => jumpToTab(i),
        description: `Jump to tab ${i + 1}`,
      })),
    ];

    const handleKeyDown = (e: KeyboardEvent) => {
      // Handle Escape key globally
      if (e.key === 'Escape') {
        e.preventDefault();
        if (showPanelSelector) {
          togglePanelSelector();
          return;
        }
        if (showKeybindingsModal) {
          toggleKeybindingsModal();
          return;
        }
        // Blur focused input
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
          (e.target as HTMLElement).blur();
        }
        return;
      }

      // Don't trigger shortcuts when typing in inputs
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // Check if this is a shortcut we want to capture
      for (const binding of bindings) {
        const shiftMatch = binding.shift ? e.shiftKey : !e.shiftKey;
        const keyMatch = e.key === binding.key || e.key.toLowerCase() === binding.key.toLowerCase();
        
        // Don't require Ctrl modifier for our shortcuts
        if (keyMatch && shiftMatch && !e.ctrlKey && !e.altKey && !e.metaKey) {
          e.preventDefault();
          e.stopPropagation();
          binding.action();
          return;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTabId, closeTab, nextTab, prevTab, jumpToTab, toggleKeybindingsModal, togglePanelSelector, showPanelSelector, showKeybindingsModal]);
}

export const KEYBINDING_DOCS: { shortcut: string; description: string }[] = [
  { shortcut: 'T', description: 'Open new panel' },
  { shortcut: 'W', description: 'Close current tab' },
  { shortcut: 'Tab', description: 'Next tab' },
  { shortcut: 'Shift + Tab', description: 'Previous tab' },
  { shortcut: '1-9', description: 'Jump to tab by number' },
  { shortcut: '?', description: 'Show keyboard shortcuts' },
  { shortcut: 'Escape', description: 'Close modals / clear focus' },
];
