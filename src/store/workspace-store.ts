import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MATH_CONSTANTS, type MathConstant } from '@/data/numbers';

export type PanelType = 
  | 'digit-display'
  | 'recall-test'
  | 'practice'
  | 'chunk-trainer'
  | 'scratchpad'
  | 'notes'
  | 'canvas'
  | 'timeline'
  | 'progress'
  | 'statistics'
  | 'major-system'
  | 'piem'
  | 'sequence';

export interface Tab {
  id: string;
  title: string;
  panelType: PanelType;
  numberId: string;
}

export interface CustomNumber {
  id: string;
  name: string;
  digits: string;
}

interface WorkspaceState {
  // Tabs
  tabs: Tab[];
  activeTabId: string | null;
  
  // Selected number
  selectedNumberId: string;
  customNumbers: CustomNumber[];
  
  // UI state
  showKeybindingsModal: boolean;
  showPanelSelector: boolean;
  sidebarCollapsed: boolean;
  
  // Actions
  addTab: (panelType: PanelType, numberId?: string) => void;
  closeTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;
  nextTab: () => void;
  prevTab: () => void;
  jumpToTab: (index: number) => void;
  
  setSelectedNumber: (numberId: string) => void;
  addCustomNumber: (name: string, digits: string) => void;
  removeCustomNumber: (id: string) => void;
  
  toggleKeybindingsModal: () => void;
  togglePanelSelector: () => void;
  toggleSidebar: () => void;
  
  getSelectedNumber: () => MathConstant | CustomNumber | undefined;
}

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

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set, get) => ({
      // Initial state
      tabs: [],
      activeTabId: null,
      selectedNumberId: 'pi',
      customNumbers: [],
      showKeybindingsModal: false,
      showPanelSelector: false,
      sidebarCollapsed: false,
      
      // Tab actions
      addTab: (panelType, numberId) => {
        const id = generateId();
        const numId = numberId || get().selectedNumberId;
        
        // Find the symbol/name for the tab title
        let symbol = '?';
        const builtIn = MATH_CONSTANTS.find(c => c.id === numId);
        if (builtIn) {
          symbol = builtIn.symbol;
        } else {
          // Check for custom number
          const customNum = get().customNumbers.find(c => c.id === numId);
          if (customNum) {
            symbol = customNum.name;
          }
        }
        
        const newTab: Tab = {
          id,
          title: `${PANEL_TITLES[panelType]} (${symbol})`,
          panelType,
          numberId: numId,
        };
        
        set(state => ({
          tabs: [...state.tabs, newTab],
          activeTabId: id,
          showPanelSelector: false,
        }));
      },
      
      closeTab: (tabId) => {
        set(state => {
          const newTabs = state.tabs.filter(t => t.id !== tabId);
          let newActiveId = state.activeTabId;
          
          if (state.activeTabId === tabId) {
            const closedIndex = state.tabs.findIndex(t => t.id === tabId);
            if (newTabs.length > 0) {
              newActiveId = newTabs[Math.min(closedIndex, newTabs.length - 1)].id;
            } else {
              newActiveId = null;
            }
          }
          
          return { tabs: newTabs, activeTabId: newActiveId };
        });
      },
      
      setActiveTab: (tabId) => {
        set({ activeTabId: tabId });
      },
      
      nextTab: () => {
        const { tabs, activeTabId } = get();
        if (tabs.length === 0) return;
        
        const currentIndex = tabs.findIndex(t => t.id === activeTabId);
        const nextIndex = (currentIndex + 1) % tabs.length;
        set({ activeTabId: tabs[nextIndex].id });
      },
      
      prevTab: () => {
        const { tabs, activeTabId } = get();
        if (tabs.length === 0) return;
        
        const currentIndex = tabs.findIndex(t => t.id === activeTabId);
        const prevIndex = currentIndex <= 0 ? tabs.length - 1 : currentIndex - 1;
        set({ activeTabId: tabs[prevIndex].id });
      },
      
      jumpToTab: (index) => {
        const { tabs } = get();
        if (index >= 0 && index < tabs.length) {
          set({ activeTabId: tabs[index].id });
        }
      },
      
      // Number actions
      setSelectedNumber: (numberId) => {
        set({ selectedNumberId: numberId });
      },
      
      addCustomNumber: (name, digits) => {
        const id = `custom-${generateId()}`;
        const cleanDigits = digits.replace(/[^0-9.]/g, '');
        
        set(state => ({
          customNumbers: [...state.customNumbers, { id, name, digits: cleanDigits }],
          selectedNumberId: id,
        }));
      },
      
      removeCustomNumber: (id) => {
        set(state => {
          const newCustom = state.customNumbers.filter(n => n.id !== id);
          return {
            customNumbers: newCustom,
            selectedNumberId: state.selectedNumberId === id ? 'pi' : state.selectedNumberId,
          };
        });
      },
      
      // UI actions
      toggleKeybindingsModal: () => {
        set(state => ({ showKeybindingsModal: !state.showKeybindingsModal }));
      },
      
      togglePanelSelector: () => {
        set(state => ({ showPanelSelector: !state.showPanelSelector }));
      },
      
      toggleSidebar: () => {
        set(state => ({ sidebarCollapsed: !state.sidebarCollapsed }));
      },
      
      // Getters
      getSelectedNumber: () => {
        const { selectedNumberId, customNumbers } = get();
        const builtIn = MATH_CONSTANTS.find(c => c.id === selectedNumberId);
        if (builtIn) return builtIn;
        return customNumbers.find(c => c.id === selectedNumberId);
      },
    }),
    {
      name: 'number-learn-workspace',
      partialize: (state) => ({
        selectedNumberId: state.selectedNumberId,
        customNumbers: state.customNumbers,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
);
