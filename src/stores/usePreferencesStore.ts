import { create } from "zustand";
import { persist } from "zustand/middleware";
import { devtools } from "zustand/middleware";

interface PreferencesState {
  isPTTEnabled: boolean;
  isAudioPlaybackEnabled: boolean;
  isMicrophoneMuted: boolean;

  setPTTEnabled: (active: boolean) => void;
  setAudioPlaybackEnabled: (enabled: boolean) => void;
  setMicrophoneMuted: (muted: boolean) => void;
}

export const usePreferencesStore = create<PreferencesState>()(
  devtools(
    persist(
      (set) => ({
        isPTTEnabled: false,
        isAudioPlaybackEnabled: true,
        isMicrophoneMuted: false,

        setPTTEnabled: (active) =>
          set({ isPTTEnabled: active, isMicrophoneMuted: active }),
        setAudioPlaybackEnabled: (active) =>
          set({ isAudioPlaybackEnabled: active }),
        setMicrophoneMuted: (muted) => set({ isMicrophoneMuted: muted }),
      }),
      {
        name: "preferences-storage",
        partialize: (state) => ({
          isPTTEnabled: state.isPTTEnabled,
          isAudioPlaybackEnabled: state.isAudioPlaybackEnabled,
          isMicrophoneMuted: state.isMicrophoneMuted,
        }),
      },
    ),
  ),
);
