'use client';

import { useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import { useWorkspaceStore } from '@/store/workspace-store';
import { useKeybindings } from '@/hooks/use-keybindings';
import { TabBar } from '@/components/tab-bar';
import { NumberSelector } from '@/components/number-selector';
import { PanelContainer } from '@/components/panel-container';
import { PanelSelector } from '@/components/panel-selector';
import { KeybindingsModal } from '@/components/keybindings-modal';
import { Menu, Plus } from 'lucide-react';

export default function StudioPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const {
    tabs,
    activeTabId,
    sidebarCollapsed,
    showKeybindingsModal,
    showPanelSelector,
    toggleSidebar,
    togglePanelSelector,
    toggleKeybindingsModal,
  } = useWorkspaceStore();

  // Initialize keybindings
  useKeybindings();

  // Redirect if not authenticated
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      redirect('/');
    }
  }, [isLoaded, isSignedIn]);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-72px)]">
        <div className="animate-pulse text-[var(--text-muted)]">Loading...</div>
      </div>
    );
  }

  if (!isSignedIn) {
    return null;
  }

  const activeTab = tabs.find(t => t.id === activeTabId);

  return (
    <div className="flex h-[calc(100vh-72px)]">
      {/* Sidebar */}
      <aside
        className={`
          ${sidebarCollapsed ? 'w-0 md:w-16' : 'w-64'}
          border-r border-[var(--border)] bg-[var(--surface)]
          transition-all duration-200 overflow-hidden flex-shrink-0
        `}
      >
        <div className="h-full flex flex-col">
          <div className="px-3 py-3 border-b border-[var(--border)] flex items-center justify-between min-h-[48px]">
            {!sidebarCollapsed && (
              <span className="text-sm font-medium text-[var(--text-secondary)]">Numbers</span>
            )}
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-md hover:bg-[var(--surface-hover)] text-[var(--text-muted)]"
              title="Toggle sidebar"
            >
              <Menu className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <NumberSelector collapsed={sidebarCollapsed} />
          </div>
          <div className="p-3 border-t border-[var(--border)]">
            <button
              onClick={toggleKeybindingsModal}
              className={`
                w-full text-left p-2 rounded-md text-sm
                hover:bg-[var(--surface-hover)] text-[var(--text-muted)]
                ${sidebarCollapsed ? 'text-center' : ''}
              `}
            >
              {sidebarCollapsed ? '?' : 'Keyboard shortcuts (?)'}
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Tab bar */}
        <div className="flex items-center border-b border-[var(--border)] bg-[var(--background)]">
          <TabBar />
          <button
            onClick={togglePanelSelector}
            className="p-3 hover:bg-[var(--surface)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            title="New panel (Ctrl+T)"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Panel content */}
        <div className="flex-1 overflow-auto bg-[var(--background)] p-4">
          {activeTab ? (
            <PanelContainer tab={activeTab} />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-[var(--text-muted)]">
              <p className="mb-4">No panels open</p>
              <button
                onClick={togglePanelSelector}
                className="btn btn-primary"
              >
                <Plus className="w-4 h-4" />
                Open a Panel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showPanelSelector && <PanelSelector />}
      {showKeybindingsModal && <KeybindingsModal />}
    </div>
  );
}
