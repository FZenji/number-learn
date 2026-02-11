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
  | 'sequence'
  | 'achievements';

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
  // Selected number
  selectedNumberId: string;
  customNumbers: CustomNumber[];
  
  // UI state
  showKeybindingsModal: boolean;
  showPanelSelector: boolean;
  sidebarCollapsed: boolean;
  
  // Actions
  setSelectedNumber: (numberId: string) => void;
  addCustomNumber: (name: string, digits: string) => void;
  removeCustomNumber: (id: string) => void;
  
  toggleKeybindingsModal: () => void;
  togglePanelSelector: () => void;
  toggleSidebar: () => void;
  
  getSelectedNumber: () => MathConstant | CustomNumber | undefined;

  // DB sync
  syncProgressFromDB: () => Promise<void>;
  syncCustomNumbersToDB: (action: 'add' | 'remove', data: { externalId: string; name?: string; digits?: string }) => Promise<void>;
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set, get) => ({
      // Initial state
      selectedNumberId: 'pi',
      customNumbers: [],
      showKeybindingsModal: false,
      showPanelSelector: false,
      sidebarCollapsed: false,
      
      // Number actions
      setSelectedNumber: (numberId) => {
        set({ selectedNumberId: numberId });
      },
      
      addCustomNumber: (name, digits) => {
        const id = `custom-${generateId()}`;
        const cleanDigits = digits.replace(/[^0-9.]/g, '').slice(0, 1001);
        
        set(state => ({
          customNumbers: [...state.customNumbers, { id, name, digits: cleanDigits }],
          selectedNumberId: id,
        }));

        // Fire-and-forget DB sync
        get().syncCustomNumbersToDB('add', { externalId: id, name, digits: cleanDigits }).catch(() => {});
      },
      
      removeCustomNumber: (id) => {
        set(state => {
          const newCustom = state.customNumbers.filter(n => n.id !== id);
          return {
            customNumbers: newCustom,
            selectedNumberId: state.selectedNumberId === id ? 'pi' : state.selectedNumberId,
          };
        });

        get().syncCustomNumbersToDB('remove', { externalId: id }).catch(() => {});
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

      // DB sync actions
      syncProgressFromDB: async () => {
        try {
          const res = await fetch('/api/progress');
          if (!res.ok) return;
          const rows = await res.json();
          // Write each row to localStorage for now (panels read from localStorage)
          for (const row of rows) {
            localStorage.setItem(`progress-${row.numberId}`, JSON.stringify({
              digitsLearned: row.digitsLearned,
              currentStreak: row.currentStreak,
              bestStreak: row.bestStreak,
              bestAccuracy: row.bestAccuracy,
              lastPracticeDate: row.lastPracticeDate,
              totalPracticeTime: row.totalPracticeTime,
            }));
          }
        } catch (err) {
          // Silently fail — localStorage fallback still works
          console.warn('Failed to sync progress from DB:', err);
        }
      },

      syncCustomNumbersToDB: async (action, data) => {
        try {
          if (action === 'add') {
            await fetch('/api/custom-numbers', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data),
            });
          } else if (action === 'remove') {
            await fetch(`/api/custom-numbers?id=${data.externalId}`, {
              method: 'DELETE',
            });
          }
        } catch (err) {
          console.warn('Failed to sync custom numbers to DB:', err);
        }
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
