import { TranscriptItem } from "@/lib/types";
import { newTimestampPretty } from "@/lib/utils";
import { v4 } from "uuid";
import { create } from "zustand";

interface TranscriptState {
  transcriptItems: TranscriptItem[];
  addTranscriptMessage: (
    itemId: string,
    role: "user" | "assistant",
    text: string,
    isHidden?: boolean,
  ) => void;
  updateTranscriptMessage: (
    itemId: string,
    text: string,
    isDelta: boolean,
  ) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  addTranscriptBreadcrumb: (title: string, data?: Record<string, any>) => void;
  toggleTranscriptItemExpand: (itemId: string) => void;
  updateTranscriptItemStatus: (
    itemId: string,
    newStatus: "IN_PROGRESS" | "DONE",
  ) => void;
}

export const useTranscriptStore = create<TranscriptState>((set) => ({
  transcriptItems: [],

  addTranscriptMessage: (itemId, role, text = "", isHidden = false) => {
    set((state) => {
      if (
        state.transcriptItems.some(
          (item) => item.itemId === itemId && item.type === "MESSAGE",
        )
      ) {
        console.warn(
          `[addTranscriptMessage] skipping; message already exists for itemId=${itemId}, role=${role}, text=${text}`,
        );
        return state;
      }

      const newItem: TranscriptItem = {
        itemId,
        type: "MESSAGE",
        role,
        title: text,
        expanded: false,
        timestamp: newTimestampPretty(),
        createdAtMs: Date.now(),
        status: "IN_PROGRESS",
        isHidden,
      };

      return { transcriptItems: [...state.transcriptItems, newItem] };
    });
  },
  updateTranscriptMessage: (itemId, text, append = false) => {
    set((state) => ({
      transcriptItems: state.transcriptItems.map((item) => {
        if (item.itemId === itemId && item.type === "MESSAGE") {
          return {
            ...item,
            title: append ? (item.title ?? "") + text : text,
          };
        }
        return item;
      }),
    }));
  },
  addTranscriptBreadcrumb: (title, data) => {
    set((state) => {
      const breadcrumb: TranscriptItem = {
        itemId: `breadcrumb-${v4()}`,
        type: "BREADCRUMB",
        title,
        data,
        expanded: false,
        timestamp: newTimestampPretty(),
        createdAtMs: Date.now(),
        status: "DONE",
        isHidden: false,
      };

      return {
        transcriptItems: [...state.transcriptItems, breadcrumb],
      };
    });
  },
  toggleTranscriptItemExpand: (itemId) => {
    set((state) => ({
      transcriptItems: state.transcriptItems.map((item) =>
        item.itemId === itemId ? { ...item, expanded: !item.expanded } : item,
      ),
    }));
  },
  updateTranscriptItemStatus: (itemId, status) => {
    set((state) => ({
      transcriptItems: state.transcriptItems.map((item) =>
        item.itemId === itemId ? { ...item, status } : item,
      ),
    }));
  },
}));
