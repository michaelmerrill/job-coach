import { SessionStatus } from "@/lib/types";
import { create } from "zustand";

interface SessionState {
  sessionId?: string;
  sessionTimestamp?: string;
  sessionStatus: SessionStatus;

  setSessionId: (sessionId: string) => void;
  setSessionTimestamp: (sessionTimestamp: string) => void;
  setSessionStatus: (status: SessionStatus) => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  sessionStatus: "DISCONNECTED",

  setSessionId: (sessionId) => set({ sessionId }),
  setSessionTimestamp: (sessionTimestamp) => set({ sessionTimestamp }),
  setSessionStatus: (sessionStatus) => set({ sessionStatus }),
}));
