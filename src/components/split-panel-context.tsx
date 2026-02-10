'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { PanelType } from '@/store/workspace-store';
import { MATH_CONSTANTS } from '@/data/numbers';
import { useWorkspaceStore } from '@/store/workspace-store';

// A tab within an editor group
export interface GroupTab {
  id: string;
  title: string;
  panelType: PanelType;
  numberId: string;
}

// An editor group — like a VS Code editor group — has its own tabs
export interface EditorGroup {
  id: string;
  tabs: GroupTab[];
  activeTabId: string | null;
}

// Layout tree: leaf = group, branch = horizontal/vertical split
export type LayoutNode =
  | { type: 'group'; groupId: string }
  | { type: 'horizontal'; id: string; children: LayoutNode[] }
  | { type: 'vertical'; id: string; children: LayoutNode[] };

export type DropPosition = 'left' | 'right' | 'top' | 'bottom';

const PANEL_TITLES: Record<PanelType, string> = {
  'digit-display': 'Digits',
  'recall-test': 'Recall Test',
  'practice': 'Practice',
  'chunk-trainer': 'Chunks',
  'scratchpad': 'Scratchpad',
  'notes': 'Notes',
  'canvas': 'Canvas',
  'timeline': 'Timeline',
  'progress': 'Progress',
  'statistics': 'Statistics',
  'major-system': 'Major System',
  'piem': 'Piem',
  'sequence': 'Sequence',
};

interface SplitPanelContextType {
  // State
  layout: LayoutNode | null;
  groups: Record<string, EditorGroup>;
  activeGroupId: string | null;
  groupCount: number;
  showPanelSelectorForGroup: string | null;

  // Group-level actions
  setActiveGroup: (groupId: string) => void;
  addTabToGroup: (groupId: string, panelType: PanelType, numberId?: string) => void;
  closeTabInGroup: (groupId: string, tabId: string) => void;
  setActiveTabInGroup: (groupId: string, tabId: string) => void;

  // Split actions
  splitGroup: (groupId: string, direction: 'horizontal' | 'vertical') => void;
  moveTabToNewGroup: (sourceGroupId: string, tabId: string, targetGroupId: string, position: DropPosition) => void;
  moveTabToExistingGroup: (sourceGroupId: string, tabId: string, targetGroupId: string) => void;

  // Panel selector
  openPanelSelectorForGroup: (groupId: string) => void;
  closePanelSelector: () => void;

  // Init
  initialize: () => void;
}

const SplitPanelContext = createContext<SplitPanelContextType | null>(null);

export function useSplitPanel() {
  const context = useContext(SplitPanelContext);
  if (!context) {
    throw new Error('useSplitPanel must be used within SplitPanelProvider');
  }
  return context;
}

let nextId = 1;
function genId(prefix: string) {
  return `${prefix}-${nextId++}-${Date.now().toString(36)}`;
}

function getTabTitle(panelType: PanelType, numberId: string, customNumbers: { id: string; name: string }[]): string {
  let symbol = '?';
  const builtIn = MATH_CONSTANTS.find(c => c.id === numberId);
  if (builtIn) {
    symbol = builtIn.symbol;
  } else {
    const custom = customNumbers.find(c => c.id === numberId);
    if (custom) symbol = custom.name;
  }
  return `${PANEL_TITLES[panelType]} (${symbol})`;
}

function countGroups(node: LayoutNode | null): number {
  if (!node) return 0;
  if (node.type === 'group') return 1;
  return node.children.reduce((sum, child) => sum + countGroups(child), 0);
}

function normalizeLayout(node: LayoutNode | null): LayoutNode | null {
  if (!node || node.type === 'group') return node;

  // Recursively normalize children first
  const normalizedChildren = node.children
    .map(normalizeLayout)
    .filter((child): child is LayoutNode => child !== null);

  if (normalizedChildren.length === 0) return null;
  if (normalizedChildren.length === 1) return normalizedChildren[0];

  // Flatten same-orientation children
  const flattened: LayoutNode[] = [];
  for (const child of normalizedChildren) {
    if (child.type === node.type) {
      flattened.push(...child.children);
    } else {
      flattened.push(child);
    }
  }

  return { ...node, children: flattened };
}

function removeGroupFromLayout(node: LayoutNode, groupId: string): LayoutNode | null {
  if (node.type === 'group') {
    return node.groupId === groupId ? null : node;
  }
  const newChildren = node.children
    .map(child => removeGroupFromLayout(child, groupId))
    .filter((child): child is LayoutNode => child !== null);

  return normalizeLayout({ ...node, children: newChildren });
}

function splitGroupInLayout(
  node: LayoutNode,
  groupId: string,
  direction: 'horizontal' | 'vertical',
  newGroupId: string
): LayoutNode {
  if (node.type === 'group') {
    if (node.groupId === groupId) {
      return {
        type: direction,
        id: genId('split'),
        children: [
          node,
          { type: 'group', groupId: newGroupId },
        ],
      };
    }
    return node;
  }
  return normalizeLayout({
    ...node,
    children: node.children.map(child =>
      splitGroupInLayout(child, groupId, direction, newGroupId)
    ),
  }) as LayoutNode;
}

function insertGroupAtPosition(
  node: LayoutNode,
  targetGroupId: string,
  newGroupId: string,
  position: DropPosition
): LayoutNode {
  if (node.type === 'group') {
    if (node.groupId === targetGroupId) {
      const direction: 'horizontal' | 'vertical' =
        position === 'left' || position === 'right' ? 'horizontal' : 'vertical';
      const newGroupNode: LayoutNode = { type: 'group', groupId: newGroupId };
      const children = position === 'left' || position === 'top'
        ? [newGroupNode, node]
        : [node, newGroupNode];
      return { type: direction, id: genId('split'), children };
    }
    return node;
  }
  return normalizeLayout({
    ...node,
    children: node.children.map(child =>
      insertGroupAtPosition(child, targetGroupId, newGroupId, position)
    ),
  }) as LayoutNode;
}

function findFirstGroupId(node: LayoutNode | null): string | null {
  if (!node) return null;
  if (node.type === 'group') return node.groupId;
  for (const child of node.children) {
    const id = findFirstGroupId(child);
    if (id) return id;
  }
  return null;
}

const MAX_GROUPS = 9;

export function SplitPanelProvider({ children }: { children: ReactNode }) {
  const [layout, setLayout] = useState<LayoutNode | null>(null);
  const [groups, setGroups] = useState<Record<string, EditorGroup>>({});
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [showPanelSelectorForGroup, setShowPanelSelectorForGroup] = useState<string | null>(null);

  const groupCount = countGroups(layout);

  const initialize = useCallback(() => {
    if (layout) return; // Already initialized
    const groupId = genId('group');
    setGroups({ [groupId]: { id: groupId, tabs: [], activeTabId: null } });
    setLayout({ type: 'group', groupId });
    setActiveGroupId(groupId);
  }, [layout]);

  const setActiveGroup = useCallback((groupId: string) => {
    setActiveGroupId(groupId);
  }, []);

  const addTabToGroup = useCallback((groupId: string, panelType: PanelType, numberId?: string) => {
    const { selectedNumberId, customNumbers } = useWorkspaceStore.getState();
    const numId = numberId || selectedNumberId;
    const tabId = genId('tab');
    const title = getTabTitle(panelType, numId, customNumbers);
    const newTab: GroupTab = { id: tabId, title, panelType, numberId: numId };

    setGroups(prev => {
      const group = prev[groupId];
      if (!group) return prev;
      return {
        ...prev,
        [groupId]: {
          ...group,
          tabs: [...group.tabs, newTab],
          activeTabId: tabId,
        },
      };
    });
    setActiveGroupId(groupId);
    setShowPanelSelectorForGroup(null);
  }, []);

  const closeTabInGroup = useCallback((groupId: string, tabId: string) => {
    setGroups(prev => {
      const group = prev[groupId];
      if (!group) return prev;

      const newTabs = group.tabs.filter(t => t.id !== tabId);
      let newActiveTabId = group.activeTabId;
      if (group.activeTabId === tabId) {
        const closedIndex = group.tabs.findIndex(t => t.id === tabId);
        newActiveTabId = newTabs.length > 0
          ? newTabs[Math.min(closedIndex, newTabs.length - 1)].id
          : null;
      }

      // If group becomes empty and there are other groups, remove it
      if (newTabs.length === 0 && Object.keys(prev).length > 1) {
        const { [groupId]: removed, ...rest } = prev;
        // Synchronously update layout to remove the group
        setLayout(current => current ? removeGroupFromLayout(current, groupId) : null);
        setActiveGroupId(prevActive => {
          if (prevActive === groupId) {
            return Object.keys(rest)[0] || null;
          }
          return prevActive;
        });
        return rest;
      }

      return {
        ...prev,
        [groupId]: { ...group, tabs: newTabs, activeTabId: newActiveTabId },
      };
    });
  }, []);

  const setActiveTabInGroup = useCallback((groupId: string, tabId: string) => {
    setGroups(prev => {
      const group = prev[groupId];
      if (!group) return prev;
      return { ...prev, [groupId]: { ...group, activeTabId: tabId } };
    });
    setActiveGroupId(groupId);
  }, []);

  const splitGroup = useCallback((groupId: string, direction: 'horizontal' | 'vertical') => {
    if (groupCount >= MAX_GROUPS) return;

    const newGroupId = genId('group');
    setGroups(prev => ({
      ...prev,
      [newGroupId]: { id: newGroupId, tabs: [], activeTabId: null },
    }));
    setLayout(current => current ? splitGroupInLayout(current, groupId, direction, newGroupId) : null);
    setActiveGroupId(newGroupId);
    // Auto-open panel selector for the new empty group
    setShowPanelSelectorForGroup(newGroupId);
  }, [groupCount]);

  const moveTabToNewGroup = useCallback((sourceGroupId: string, tabId: string, targetGroupId: string, position: DropPosition) => {
    if (groupCount >= MAX_GROUPS) return;

    const newGroupId = genId('group');

    setGroups(prev => {
      const sourceGroup = prev[sourceGroupId];
      if (!sourceGroup) return prev;

      const tab = sourceGroup.tabs.find(t => t.id === tabId);
      if (!tab) return prev;

      // Remove from source
      const newSourceTabs = sourceGroup.tabs.filter(t => t.id !== tabId);
      let newSourceActiveTabId = sourceGroup.activeTabId;
      if (sourceGroup.activeTabId === tabId) {
        const idx = sourceGroup.tabs.findIndex(t => t.id === tabId);
        newSourceActiveTabId = newSourceTabs.length > 0
          ? newSourceTabs[Math.min(idx, newSourceTabs.length - 1)].id
          : null;
      }

      let result = {
        ...prev,
        [sourceGroupId]: { ...sourceGroup, tabs: newSourceTabs, activeTabId: newSourceActiveTabId },
        [newGroupId]: { id: newGroupId, tabs: [tab], activeTabId: tab.id },
      };

      // First insert the new group into the layout next to the target
      setLayout(current => {
        if (!current) return null;
        let updated = insertGroupAtPosition(current, targetGroupId, newGroupId, position);
        // Then remove the empty source group from the layout if needed
        if (newSourceTabs.length === 0 && Object.keys(result).length > 2) {
          updated = removeGroupFromLayout(updated!, sourceGroupId) || updated;
        }
        return updated;
      });

      setActiveGroupId(newGroupId);

      // Clean up empty source group from the groups map
      if (newSourceTabs.length === 0 && Object.keys(result).length > 2) {
        const { [sourceGroupId]: removed, ...rest } = result;
        return rest;
      }

      return result;
    });
  }, [groupCount]);

  const moveTabToExistingGroup = useCallback((sourceGroupId: string, tabId: string, targetGroupId: string) => {
    if (sourceGroupId === targetGroupId) return;

    setGroups(prev => {
      const sourceGroup = prev[sourceGroupId];
      const targetGroup = prev[targetGroupId];
      if (!sourceGroup || !targetGroup) return prev;

      const tab = sourceGroup.tabs.find(t => t.id === tabId);
      if (!tab) return prev;

      // Remove from source
      const newSourceTabs = sourceGroup.tabs.filter(t => t.id !== tabId);
      let newSourceActiveTabId = sourceGroup.activeTabId;
      if (sourceGroup.activeTabId === tabId) {
        const idx = sourceGroup.tabs.findIndex(t => t.id === tabId);
        newSourceActiveTabId = newSourceTabs.length > 0
          ? newSourceTabs[Math.min(idx, newSourceTabs.length - 1)].id
          : null;
      }

      let result = {
        ...prev,
        [sourceGroupId]: { ...sourceGroup, tabs: newSourceTabs, activeTabId: newSourceActiveTabId },
        [targetGroupId]: { ...targetGroup, tabs: [...targetGroup.tabs, tab], activeTabId: tab.id },
      };

      // Clean up empty source synchronously
      if (newSourceTabs.length === 0 && Object.keys(result).length > 1) {
        setLayout(current => current ? removeGroupFromLayout(current, sourceGroupId) : null);
        const { [sourceGroupId]: removed, ...rest } = result;
        result = rest as typeof result;
      }

      return result;
    });
    setActiveGroupId(targetGroupId);
  }, []);

  const openPanelSelectorForGroup = useCallback((groupId: string) => {
    setShowPanelSelectorForGroup(groupId);
    setActiveGroupId(groupId);
  }, []);

  const closePanelSelector = useCallback(() => {
    setShowPanelSelectorForGroup(null);
  }, []);

  return (
    <SplitPanelContext.Provider
      value={{
        layout,
        groups,
        activeGroupId,
        groupCount,
        showPanelSelectorForGroup,
        setActiveGroup,
        addTabToGroup,
        closeTabInGroup,
        setActiveTabInGroup,
        splitGroup,
        moveTabToNewGroup,
        moveTabToExistingGroup,
        openPanelSelectorForGroup,
        closePanelSelector,
        initialize,
      }}
    >
      {children}
    </SplitPanelContext.Provider>
  );
}
