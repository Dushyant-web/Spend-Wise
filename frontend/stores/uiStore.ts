import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

type ModalType =
  | 'expense-detail'
  | 'expense-add'
  | 'expense-edit'
  | 'delete-confirm'
  | 'category-detail'
  | 'achievement-detail'
  | 'quick-add'
  | 'ai-insight'
  | 'onboarding'
  | 'notification-detail'
  | 'profile'
  | 'user-detail'
  | null

interface ModalPayload {
  expenseId?: string
  expense?: Record<string, any>
  categoryName?: string
  achievementId?: string
  badge?: Record<string, any>
  earned?: boolean
  insightId?: string
  insight?: Record<string, any>
  notificationId?: string
  notification?: Record<string, any>
  userId?: string
  user?: Record<string, any>
  deleteTarget?: {
    id: string
    label: string
    onConfirm: () => Promise<void>
  }
}

interface UIState {
  sidebarOpen: boolean
  addExpenseOpen: boolean
  theme: 'dark' | 'light'

  // modal system
  activeModal: ModalType
  modalPayload: ModalPayload

  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
  setAddExpenseOpen: (open: boolean) => void
  setTheme: (theme: 'dark' | 'light') => void

  openModal: (type: ModalType, payload?: ModalPayload) => void
  closeModal: () => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      addExpenseOpen: false,
      theme: 'dark',

      activeModal: null,
      modalPayload: {},

      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setAddExpenseOpen: (open) => set({ addExpenseOpen: open }),
      setTheme: (theme) => set({ theme }),

      openModal: (type, payload = {}) => set({ activeModal: type, modalPayload: payload }),
      closeModal: () => set({ activeModal: null, modalPayload: {} }),
    }),
    {
      name: 'sw-ui',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ theme: state.theme, sidebarOpen: state.sidebarOpen }),
    }
  )
)
