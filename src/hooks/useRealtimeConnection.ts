import { useRef, useEffect, useCallback } from "react";
import { createRealtimeConnection, fetchEphemeralKey } from "@/lib/realtime";
import { useSessionStore } from "@/stores/useSessionStore";
import { usePreferencesStore } from "@/stores/usePreferencesStore";
import {
  RealtimeClientEvent,
  RealtimeServerEvent,
} from "openai/resources/beta/realtime/realtime.mjs";
import { useTranscriptStore } from "@/stores/useTranscriptStore";

export function useRealtimeConnection() {
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dcRef = useRef<RTCDataChannel | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const audioTrackRef = useRef<MediaStreamTrack | null>(null);

  const {
    sessionStatus,
    sessionId,
    sessionTimestamp,
    setSessionStatus,
    setSessionId,
    setSessionTimestamp,
  } = useSessionStore();
  const { isAudioPlaybackEnabled } = usePreferencesStore();
  const {
    transcriptItems,
    addTranscriptMessage,
    updateTranscriptMessage,
    updateTranscriptItemStatus,
  } = useTranscriptStore();

  const sendClientEvent = useCallback(
    (event: RealtimeClientEvent) => {
      if (dcRef.current?.readyState === "open") {
        console.log("data_channel.send: ", event);
        dcRef.current.send(JSON.stringify(event));
      } else {
        console.error("error.data_channel_not_open", {
          attemptedEvent: event.type,
        });
      }
    },
    [dcRef],
  );

  const handleFunctionCall = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (params: { name: string; call_id: string; args: string }) => {
      // const args = JSON.parse(params.args);
      // sendClientEvent({
      //   type: "conversation.item.create",
      //   item: {
      //     type: "function_call_output",
      //     call_id: params.call_id,
      //     output: JSON.stringify(result),
      //   },
      // });
    },
    [],
  );

  const handleServerEvent = useCallback(
    (serverEvent: RealtimeServerEvent) => {
      switch (serverEvent.type) {
        case "session.created":
          if (serverEvent.session.id) {
            setSessionStatus("CONNECTED");
            setSessionId(serverEvent.session.id);
            setSessionTimestamp(new Date().toLocaleString());
          }
          break;

        case "conversation.item.created":
          let text =
            serverEvent.item.content?.[0]?.text ||
            serverEvent.item.content?.[0]?.transcript ||
            "";

          const role = serverEvent.item.role as "user" | "assistant";
          const itemId = serverEvent.item.id;

          if (!itemId || !role) {
            break;
          }

          if (transcriptItems.some((item) => item.itemId === itemId)) {
            break;
          }

          if (role === "user" && !text) {
            text = "[Transcribing...]";
          }

          addTranscriptMessage(itemId, role, text);
          break;

        case "conversation.item.input_audio_transcription.completed":
          const finalTranscript =
            !serverEvent.transcript || serverEvent.transcript === "\n"
              ? "[Inaudible]"
              : serverEvent.transcript;

          if (serverEvent.item_id) {
            updateTranscriptMessage(
              serverEvent.item_id,
              finalTranscript,
              false,
            );
          }
          break;

        case "response.audio_transcript.delta":
          const { item_id, delta = "" } = serverEvent;
          if (item_id) {
            updateTranscriptMessage(item_id, delta, true);
          }
          break;

        case "response.done":
          if (serverEvent.response.output) {
            serverEvent.response.output.forEach((item) => {
              const { type, name, call_id, arguments: args } = item;
              if (type === "function_call" && name && call_id && args) {
                handleFunctionCall({ name, call_id, args });
              }
            });
          }
          break;
        case "response.output_item.done":
          if (serverEvent.item.id) {
            updateTranscriptItemStatus(serverEvent.item.id, "DONE");
          }
          break;

        default:
          break;
      }
    },
    [
      setSessionId,
      setSessionTimestamp,
      transcriptItems,
      addTranscriptMessage,
      updateTranscriptMessage,
      updateTranscriptItemStatus,
      setSessionStatus,
      handleFunctionCall,
    ],
  );

  const toggleMicrophone = useCallback((muted: boolean) => {
    if (audioTrackRef.current) {
      audioTrackRef.current.enabled = !muted;
    }
  }, []);

  const connectToRealtime = useCallback(async () => {
    if (sessionStatus !== "DISCONNECTED") {
      return;
    }

    setSessionStatus("CONNECTING");

    try {
      const EPHEMERAL_KEY = await fetchEphemeralKey();

      if (!EPHEMERAL_KEY) {
        setSessionStatus("DISCONNECTED");
        return;
      }

      if (!audioElementRef.current) {
        audioElementRef.current = document.createElement("audio");
      }
      audioElementRef.current.autoplay = isAudioPlaybackEnabled;

      const { pc, dc, ms } = await createRealtimeConnection({
        EPHEMERAL_KEY,
        audioElement: audioElementRef,
      });

      pcRef.current = pc;
      dcRef.current = dc;
      audioTrackRef.current = ms.getAudioTracks()[0];

      dc.addEventListener("open", () => {
        console.log("data_channel.open");
      });
      dc.addEventListener("close", () => {
        console.log("data_channel.close");
      });
      dc.addEventListener("error", (error: RTCErrorEvent) => {
        console.log("data_channel.error", { error });
      });
      dc.addEventListener("message", (event: MessageEvent) => {
        console.log("data_channel.message", event);
        handleServerEvent(JSON.parse(event.data));
      });
    } catch (error) {
      console.error("Failed to connect to realtime: ", error);
      setSessionStatus("DISCONNECTED");
    }
  }, [
    sessionStatus,
    isAudioPlaybackEnabled,
    handleServerEvent,
    setSessionStatus,
    audioElementRef,
    pcRef,
    dcRef,
    audioTrackRef,
  ]);

  const disconnectFromRealtime = useCallback(() => {
    if (pcRef.current) {
      pcRef.current.getSenders().forEach((sender) => {
        if (sender.track) {
          sender.track.stop();
        }
      });

      pcRef.current.close();
      pcRef.current = null;
      dcRef.current = null;
      audioTrackRef.current = null;
    }

    setSessionStatus("DISCONNECTED");
  }, [setSessionStatus]);

  const toggleRealtimeConnection = useCallback(() => {
    if (sessionStatus === "CONNECTED" || sessionStatus === "CONNECTING") {
      disconnectFromRealtime();
    }
    if (sessionStatus === "DISCONNECTED") {
      connectToRealtime();
    }
  }, [sessionStatus, disconnectFromRealtime, connectToRealtime]);

  useEffect(() => {
    if (audioElementRef.current) {
      if (isAudioPlaybackEnabled) {
        audioElementRef.current.play().catch((error) => {
          console.warn(
            "Audio autoplay was blocked by browser. This usually happens before user interaction:",
            error,
          );
        });
      } else {
        audioElementRef.current.pause();
      }
    }
  }, [isAudioPlaybackEnabled]);

  return {
    pcRef,
    dcRef,
    audioElementRef,
    sessionId,
    sessionTimestamp,
    sessionStatus,
    sendClientEvent,
    handleServerEvent,
    connectToRealtime,
    disconnectFromRealtime,
    toggleRealtimeConnection,
    toggleMicrophone,
  };
}
