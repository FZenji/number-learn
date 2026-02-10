'use client';

import { useState, useCallback, type DragEvent } from 'react';
import { Panel, Group, Separator } from 'react-resizable-panels';
import { useSplitPanel, type LayoutNode, type EditorGroup, type GroupTab, type DropPosition } from './split-panel-context';
import { PanelContainer } from './panel-container';
import { Plus, X, Columns, Rows } from 'lucide-react';

// ─── Per-group Tab Bar ───────────────────────────────────────
function GroupTabBar({ group }: { group: EditorGroup }) {
  const { setActiveTabInGroup, closeTabInGroup, setActiveGroup, openPanelSelectorForGroup, splitGroup, groupCount } = useSplitPanel();

  const handleDragStart = (e: DragEvent, tab: GroupTab) => {
    e.dataTransfer.setData('application/tab-id', tab.id);
    e.dataTransfer.setData('application/source-group-id', group.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="flex items-center border-b border-[var(--border)] bg-[var(--background)] text-sm shrink-0">
      <div className="flex-1 flex items-center overflow-x-auto scrollbar-hide">
        {group.tabs.map((tab) => (
          <div
            key={tab.id}
            draggable
            onDragStart={(e) => handleDragStart(e, tab)}
            onClick={() => { setActiveTabInGroup(group.id, tab.id); setActiveGroup(group.id); }}
            className={`
              group/tab flex items-center gap-1.5 px-3 py-2 min-w-[100px] max-w-[180px]
              border-r border-[var(--border)] cursor-pointer transition-colors select-none
              ${group.activeTabId === tab.id
                ? 'bg-[var(--surface)] text-[var(--text-primary)] border-b-2 border-b-[var(--primary)]'
                : 'hover:bg-[var(--surface-hover)] text-[var(--text-secondary)]'
              }
            `}
          >
            <span className="flex-1 truncate text-xs">{tab.title}</span>
            <button
              onClick={(e) => { e.stopPropagation(); closeTabInGroup(group.id, tab.id); }}
              className="opacity-0 group-hover/tab:opacity-100 p-0.5 rounded hover:bg-[var(--surface-active)] transition-opacity"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-0.5 px-1 shrink-0">
        <button
          onClick={() => openPanelSelectorForGroup(group.id)}
          className="p-1.5 rounded hover:bg-[var(--surface-hover)] text-[var(--text-muted)]"
          title="New panel (T)"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
        {groupCount < 9 && (
          <>
            <button
              onClick={() => splitGroup(group.id, 'horizontal')}
              className="p-1.5 rounded hover:bg-[var(--surface-hover)] text-[var(--text-muted)]"
              title="Split right (\)"
            >
              <Columns className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => splitGroup(group.id, 'vertical')}
              className="p-1.5 rounded hover:bg-[var(--surface-hover)] text-[var(--text-muted)]"
              title="Split down (|)"
            >
              <Rows className="w-3.5 h-3.5" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Editor Group Renderer ──────────────────────────────────
function EditorGroupRenderer({ groupId }: { groupId: string }) {
  const { groups, activeGroupId, setActiveGroup, moveTabToNewGroup, moveTabToExistingGroup, openPanelSelectorForGroup } = useSplitPanel();
  const [isDragOver, setIsDragOver] = useState(false);

  // ALL hooks MUST be above any conditional return
  const handleGroupDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const tabId = e.dataTransfer.getData('application/tab-id');
    const sourceGroupId = e.dataTransfer.getData('application/source-group-id');
    if (!tabId || !sourceGroupId) return;

    // Always move tab into this existing group (no edge splitting)
    moveTabToExistingGroup(sourceGroupId, tabId, groupId);
  }, [groupId, moveTabToExistingGroup]);

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    if (e.dataTransfer.types.includes('application/tab-id')) {
      e.preventDefault();
      setIsDragOver(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  }, []);

  // Now safe to return early — all hooks are above
  const group = groups[groupId];
  if (!group) return null;

  const isActive = activeGroupId === groupId;
  const activeTab = group.tabs.find(t => t.id === group.activeTabId);

  return (
    <div
      className={`h-full flex flex-col overflow-hidden relative ${
        isActive ? 'ring-1 ring-[var(--primary)]/30 ring-inset' : ''
      }`}
      onClick={() => setActiveGroup(groupId)}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleGroupDrop}
    >
      <GroupTabBar group={group} />

      <div className="flex-1 overflow-auto bg-[var(--background)]">
        {activeTab ? (
          <div className="h-full p-4">
            <PanelContainer
              tab={{ id: activeTab.id, title: activeTab.title, panelType: activeTab.panelType, numberId: activeTab.numberId }}
            />
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-[var(--text-muted)]">
            <p className="mb-3 text-sm">No panels open</p>
            <button
              onClick={() => openPanelSelectorForGroup(groupId)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--primary)] text-white hover:opacity-90 transition-opacity text-sm"
            >
              <Plus className="w-4 h-4" />
              Open Panel
            </button>
          </div>
        )}
      </div>

      {/* Drop zone visual hint */}
      {isDragOver && (
        <div className="absolute inset-0 border-2 border-dashed border-[var(--primary)]/40 bg-[var(--primary)]/5 pointer-events-none z-10 rounded" />
      )}
    </div>
  );
}

// ─── Recursive Layout Renderer ──────────────────────────────
function LayoutRenderer({ node }: { node: LayoutNode }) {
  if (node.type === 'group') {
    return <EditorGroupRenderer groupId={node.groupId} />;
  }

  const orientation = node.type;
  const elements: React.ReactNode[] = [];
  node.children.forEach((child, index) => {
    const key = child.type === 'group' ? child.groupId : ('id' in child ? child.id : `node-${index}`);
    if (index > 0) {
      elements.push(
        <Separator
          key={`sep-${key}`}
          className={`
            ${orientation === 'horizontal' ? 'w-1' : 'h-1'}
            bg-[var(--border)] hover:bg-[var(--primary)] active:bg-[var(--primary)]
            transition-colors duration-150 shrink-0
          `}
        />
      );
    }
    elements.push(
      <Panel key={key} minSize={10}>
        {child.type === 'group' ? (
          <EditorGroupRenderer groupId={child.groupId} />
        ) : (
          <LayoutRenderer node={child} />
        )}
      </Panel>
    );
  });

  // Use orientation prop (as direction failed types) and force style to ensure correct rendering
  return (
    <Group 
      orientation={orientation} 
      id={node.id}
      style={{ display: 'flex', flexDirection: orientation === 'vertical' ? 'column' : 'row' }}
    >
      {elements}
    </Group>
  );
}

// ─── Top-level Layout Component ─────────────────────────────
export function SplitPanelLayout() {
  const { layout } = useSplitPanel();

  if (!layout) return null;

  if (layout.type === 'group') {
    return <EditorGroupRenderer groupId={layout.groupId} />;
  }

  return (
    <div className="h-full">
      <LayoutRenderer node={layout} />
    </div>
  );
}
