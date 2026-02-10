'use client';

import { useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import { useWorkspaceStore } from '@/store/workspace-store';
import { useKeybindings, registerSplitActions, unregisterSplitActions, registerPanelSelectorAction, unregisterPanelSelectorAction } from '@/hooks/use-keybindings';
import { NumberSelector } from '@/components/number-selector';
import { PanelSelector } from '@/components/panel-selector';
import { KeybindingsModal } from '@/components/keybindings-modal';
import { SplitPanelProvider, useSplitPanel } from '@/components/split-panel-context';
import { SplitPanelLayout } from '@/components/split-panel-layout';
import { Menu } from 'lucide-react';

function StudioContent() {
  const {
    sidebarCollapsed,
    showKeybindingsModal,
    toggleSidebar,
    toggleKeybindingsModal,
  } = useWorkspaceStore();

  const {
    activeGroupId,
    showPanelSelectorForGroup,
    closePanelSelector,
    splitGroup,
    addTabToGroup,
    openPanelSelectorForGroup,
    initialize,
  } = useSplitPanel();

  // Initialize the first editor group on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Keybindings
  useKeybindings();

  // Register split actions
  useEffect(() => {
    registerSplitActions({
      splitHorizontal: () => activeGroupId && splitGroup(activeGroupId, 'horizontal'),
      splitVertical: () => activeGroupId && splitGroup(activeGroupId, 'vertical'),
    });
    return () => unregisterSplitActions();
  }, [activeGroupId, splitGroup]);

  // Register T shortcut -> panel selector for active group
  useEffect(() => {
    registerPanelSelectorAction(() => {
      if (activeGroupId) openPanelSelectorForGroup(activeGroupId);
    });
    return () => unregisterPanelSelectorAction();
  }, [activeGroupId, openPanelSelectorForGroup]);

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

      {/* Main content — entirely managed by split panel system */}
      <div className="flex-1 overflow-hidden bg-[var(--background)]">
        <SplitPanelLayout />
      </div>

      {/* Panel selector modal */}
      {showPanelSelectorForGroup && (
        <PanelSelector
          groupId={showPanelSelectorForGroup}
          onSelect={(panelType) => addTabToGroup(showPanelSelectorForGroup, panelType)}
          onClose={closePanelSelector}
        />
      )}

      {/* Keybindings modal */}
      {showKeybindingsModal && <KeybindingsModal />}
    </div>
  );
}

export default function StudioPage() {
  const { isLoaded, isSignedIn } = useAuth();

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

  if (!isSignedIn) return null;

  return (
    <SplitPanelProvider>
      <StudioContent />
    </SplitPanelProvider>
  );
}
