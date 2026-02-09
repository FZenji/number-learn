'use client';

import { useWorkspaceStore } from '@/store/workspace-store';
import { X } from 'lucide-react';

export function TabBar() {
  const { tabs, activeTabId, setActiveTab, closeTab } = useWorkspaceStore();

  if (tabs.length === 0) {
    return (
      <div className="flex-1 px-4 py-2 text-sm text-[var(--text-muted)]">
        Press T to open a panel
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center overflow-x-auto scrollbar-hide">
      {tabs.map((tab, index) => (
        <div
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`
            group flex items-center gap-2 px-4 py-3 min-w-[120px] max-w-[200px]
            border-r border-[var(--border)] transition-colors cursor-pointer
            ${activeTabId === tab.id 
              ? 'bg-[var(--surface)] text-[var(--text-primary)] border-b-2 border-b-[var(--primary)]' 
              : 'hover:bg-[var(--surface-hover)] text-[var(--text-secondary)]'
            }
          `}
        >
          <span className="text-xs text-[var(--text-muted)] w-4">{index + 1}</span>
          <span className="flex-1 truncate text-sm">{tab.title}</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              closeTab(tab.id);
            }}
            className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-[var(--surface-active)] transition-opacity"
            title="Close tab (W)"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ))}
    </div>
  );
}
