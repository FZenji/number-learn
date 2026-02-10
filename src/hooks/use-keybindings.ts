'use client';

import { useEffect } from 'react';
import { useWorkspaceStore } from '@/store/workspace-store';

let panelSelectorAction: (() => void) | null = null;

export function registerPanelSelectorAction(action: () => void) {
  panelSelectorAction = action;
}

export function unregisterPanelSelectorAction() {
  panelSelectorAction = null;
}

interface KeyBinding {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: () => void;
  description: string;
}

let splitActions: { splitHorizontal: () => void; splitVertical: () => void } | null = null;

export function registerSplitActions(actions: { splitHorizontal: () => void; splitVertical: () => void }) {
  splitActions = actions;
}

export function unregisterSplitActions() {
  splitActions = null;
}

export function useKeybindings() {
  const {
    showKeybindingsModal,
    showPanelSelector,
    toggleKeybindingsModal,
    togglePanelSelector,
  } = useWorkspaceStore();

  useEffect(() => {
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

      const bindings: KeyBinding[] = [
        { key: 't', action: () => panelSelectorAction?.(), description: 'New panel' },
        { key: '?', action: () => toggleKeybindingsModal(), description: 'Show keybindings' },
        { key: '\\', action: () => splitActions?.splitHorizontal(), description: 'Split horizontal' },
        { key: '|', shift: true, action: () => splitActions?.splitVertical(), description: 'Split vertical' },
      ];

      for (const binding of bindings) {
        const shiftMatch = binding.shift ? e.shiftKey : !e.shiftKey;
        const keyMatch = e.key === binding.key || e.key.toLowerCase() === binding.key.toLowerCase();

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
  }, [toggleKeybindingsModal, togglePanelSelector, showPanelSelector, showKeybindingsModal]);
}

export const KEYBINDING_DOCS: { shortcut: string; description: string }[] = [
  { shortcut: 'T / +', description: 'Open new panel in active group' },
  { shortcut: '\\', description: 'Split horizontal' },
  { shortcut: '|', description: 'Split vertical' },
  { shortcut: '?', description: 'Show keyboard shortcuts' },
  { shortcut: 'Escape', description: 'Close modals / clear focus' },
  { shortcut: 'Drag tab', description: 'Move tab to edge to split' },
];
