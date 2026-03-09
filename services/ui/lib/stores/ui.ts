import { create } from "zustand";

interface UIStore {
  // 기존: 사이드바
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;

  // 기존: 모달
  activeModal: string | null;
  modalData: unknown;
  openModal: (id: string, data?: unknown) => void;
  closeModal: () => void;

  // 기존: HUD
  hudVisible: boolean;
  setHudVisible: (visible: boolean) => void;

  // 터미널
  terminalOpen: boolean;
  terminalHeight: number;
  terminalSessionId: string | null;
  toggleTerminal: () => void;
  setTerminalOpen: (open: boolean) => void;
  setTerminalHeight: (height: number) => void;
  setTerminalSessionId: (id: string | null) => void;

  // 네비
  navCollapsed: boolean;
  toggleNavCollapsed: () => void;

  // Command Palette
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;

  // Auto Refresh
  autoRefresh: boolean;
  autoRefreshInterval: number;
  toggleAutoRefresh: () => void;
  setAutoRefreshInterval: (sec: number) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  sidebarOpen: false,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  activeModal: null,
  modalData: null,
  openModal: (id, data) => set({ activeModal: id, modalData: data }),
  closeModal: () => set({ activeModal: null, modalData: null }),

  hudVisible: false,
  setHudVisible: (visible) => set({ hudVisible: visible }),

  terminalOpen: false,
  terminalHeight: 380,
  terminalSessionId: null,
  toggleTerminal: () => set((s) => ({ terminalOpen: !s.terminalOpen })),
  setTerminalOpen: (open) => set({ terminalOpen: open }),
  setTerminalHeight: (height) => set({ terminalHeight: Math.max(200, Math.min(height, window.innerHeight * 0.7)) }),
  setTerminalSessionId: (id) => set({ terminalSessionId: id }),

  navCollapsed: false,
  toggleNavCollapsed: () => set((s) => ({ navCollapsed: !s.navCollapsed })),

  commandPaletteOpen: false,
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),

  autoRefresh: false,
  autoRefreshInterval: 5,
  toggleAutoRefresh: () => set((s) => ({ autoRefresh: !s.autoRefresh })),
  setAutoRefreshInterval: (sec) => set({ autoRefreshInterval: sec }),
}));
