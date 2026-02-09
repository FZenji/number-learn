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
  } = useWorkspaceStore();

  useEffect(() => {
    const bindings: KeyBinding[] = [
      {
        key: 't',
        ctrl: true,
        action: () => togglePanelSelector(),
        description: 'New panel',
      },
      {
        key: 'w',
        ctrl: true,
        action: () => activeTabId && closeTab(activeTabId),
        description: 'Close tab',
      },
      {
        key: 'Tab',
        ctrl: true,
        action: () => nextTab(),
        description: 'Next tab',
      },
      {
        key: 'Tab',
        ctrl: true,
        shift: true,
        action: () => prevTab(),
        description: 'Previous tab',
      },
      {
        key: '?',
        action: () => toggleKeybindingsModal(),
        description: 'Show keybindings',
      },
      // Number keys 1-9 for jumping to tabs
      ...Array.from({ length: 9 }, (_, i) => ({
        key: String(i + 1),
        ctrl: true,
        action: () => jumpToTab(i),
        description: `Jump to tab ${i + 1}`,
      })),
    ];

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        // Allow Escape to blur inputs
        if (e.key === 'Escape') {
          (e.target as HTMLElement).blur();
        }
        return;
      }

      for (const binding of bindings) {
        const ctrlMatch = binding.ctrl ? (e.ctrlKey || e.metaKey) : !e.ctrlKey && !e.metaKey;
        const shiftMatch = binding.shift ? e.shiftKey : !e.shiftKey;
        const altMatch = binding.alt ? e.altKey : !e.altKey;
        const keyMatch = e.key === binding.key || e.key.toLowerCase() === binding.key.toLowerCase();

        if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
          e.preventDefault();
          binding.action();
          return;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTabId, addTab, closeTab, nextTab, prevTab, jumpToTab, toggleKeybindingsModal, togglePanelSelector]);
}

export const KEYBINDING_DOCS: { shortcut: string; description: string }[] = [
  { shortcut: 'Ctrl + T', description: 'Open new panel' },
  { shortcut: 'Ctrl + W', description: 'Close current tab' },
  { shortcut: 'Ctrl + Tab', description: 'Next tab' },
  { shortcut: 'Ctrl + Shift + Tab', description: 'Previous tab' },
  { shortcut: 'Ctrl + 1-9', description: 'Jump to tab by number' },
  { shortcut: '?', description: 'Show keyboard shortcuts' },
  { shortcut: 'Escape', description: 'Clear focus / close modals' },
];
