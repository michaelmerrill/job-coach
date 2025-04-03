"use client";

import { useEffect, useRef } from "react";
import { v4 } from "uuid";
import { useTranscriptStore } from "@/stores/useTranscriptStore";
import { SessionUpdateEvent } from "openai/resources/beta/realtime/realtime.mjs";
import { usePreferencesStore } from "@/stores/usePreferencesStore";
import { useRealtimeConnection } from "@/hooks/useRealtimeConnection";
import Transcript from "@/components/transcript";
import AudioToolbar from "@/components/audio-toolbar";
import ChatInput from "@/components/chat-input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

export default function ChatInterface() {
  const {
    isPTTEnabled,
    setPTTEnabled,
    isAudioPlaybackEnabled,
    setAudioPlaybackEnabled,
    isMicrophoneMuted,
    setMicrophoneMuted,
  } = usePreferencesStore();
  const { transcriptItems, addTranscriptMessage } = useTranscriptStore();

  const {
    dcRef,
    sessionId,
    sessionTimestamp,
    sessionStatus,
    sendClientEvent,
    connectToRealtime,
    toggleMicrophone,
  } = useRealtimeConnection();

  const activeElementRef = useRef<HTMLTextAreaElement | null>(null);

  const updateSession = (shouldTriggerResponse: boolean = false) => {
    sendClientEvent({ type: "input_audio_buffer.clear" });

    const turnDetection = isPTTEnabled
      ? null
      : ({
          type: "server_vad",
          threshold: 0.6,
          prefix_padding_ms: 400,
          silence_duration_ms: 300,
          create_response: true,
        } as SessionUpdateEvent.Session.TurnDetection);

    const sessionUpdateEvent: SessionUpdateEvent = {
      type: "session.update",
      session: {
        // @ts-expect-error - type bug doesn't allow null which is required to enable ptt.
        turn_detection: turnDetection,
        input_audio_format: "pcm16",
        output_audio_format: "pcm16",
        input_audio_transcription: { model: "whisper-1" },
      },
    };

    sendClientEvent(sessionUpdateEvent);

    if (shouldTriggerResponse) {
      const id = v4().slice(0, 32);
      const role = "user";
      const text = "Hi";
      addTranscriptMessage(id, role, text, true);
      sendClientEvent({
        type: "conversation.item.create",
        item: {
          id,
          type: "message",
          role,
          content: [{ type: "input_text", text }],
        },
      });
      sendClientEvent({ type: "response.create" });
    }
  };

  const cancelAssistantSpeech = () => {
    const mostRecentAssistantMessage = [...transcriptItems]
      .reverse()
      .find((item) => item.role === "assistant");

    if (!mostRecentAssistantMessage) {
      console.log(
        "Cannot cancel assistant speech - no recent assistant message found in transcript.",
      );
      return;
    }

    if (mostRecentAssistantMessage.status === "DONE") {
      console.log("Cannot truncate message - it has already completed");
      return;
    }

    sendClientEvent({
      type: "conversation.item.truncate",
      item_id: mostRecentAssistantMessage.itemId,
      content_index: 0,
      audio_end_ms: Date.now() - mostRecentAssistantMessage.createdAtMs,
    });
    sendClientEvent({ type: "response.cancel" });
  };

  const handleSendMessage = async (message: string) => {
    cancelAssistantSpeech();

    sendClientEvent({
      type: "conversation.item.create",
      item: {
        type: "message",
        role: "user",
        content: [
          {
            type: "input_text",
            text: message,
          },
        ],
      },
    });

    sendClientEvent({ type: "response.create" });
  };

  const handleStartTalking = () => {
    cancelAssistantSpeech();
    handleToggleMicrophone(false);
    sendClientEvent({ type: "input_audio_buffer.clear" });
  };

  const handleStopTalking = () => {
    handleToggleMicrophone(true);
    sendClientEvent({ type: "input_audio_buffer.commit" });
    sendClientEvent({ type: "response.create" });
  };

  const handleTogglePTT = (active: boolean) => {
    setPTTEnabled(active);
    toggleMicrophone(active);
  };

  const handleToggleMicrophone = (muted: boolean) => {
    setMicrophoneMuted(muted);
    toggleMicrophone(muted);
  };

  const handleToggleAudioPlayback = (enabled: boolean) => {
    setAudioPlaybackEnabled(enabled);
  };

  useEffect(() => {
    if (sessionStatus === "DISCONNECTED") {
      connectToRealtime();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (sessionStatus === "CONNECTED") {
      updateSession(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionStatus]);

  useEffect(() => {
    if (sessionStatus === "CONNECTED") {
      updateSession();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPTTEnabled]);

  return (
    <Card className="border shadow-md bg-white py-2">
      <div className="grid grid-rows-[auto_1fr_auto] h-[70vh]">
        {/* Top Bar */}
        <CardHeader className="border-b border-gray-200 bg-gray-50 grid grid-cols-2 gap-2 p-3 [.border-b]:pb-0">
          <div className="text-sm text-gray-600">
            <span className="font-semibold">Session ID: {sessionId}</span>
          </div>
          <div className="text-sm text-gray-600 text-right">
            <span className="font-semibold">Started:</span> {sessionTimestamp}
          </div>
        </CardHeader>

        {/* Chat Area */}
        <CardContent className="overflow-y-auto p-3 grid grid-cols-1 gap-4">
          <Transcript transcriptItems={transcriptItems} />
        </CardContent>

        <CardFooter className="border-t border-gray-200 p-3 bg-gray-50 grid gap-2 [.border-t]:pt-3">
          {/* Audio Toolbar */}
          <AudioToolbar
            activeElementRef={activeElementRef}
            sessionStatus={sessionStatus}
            isPTTEnabled={isPTTEnabled}
            isAudioPlaybackEnabled={isAudioPlaybackEnabled}
            isMicrophoneMuted={isMicrophoneMuted}
            onStartTalking={handleStartTalking}
            onStopTalking={handleStopTalking}
            onTogglePTT={handleTogglePTT}
            onToggleAudioPlayback={handleToggleAudioPlayback}
            onToggleMicrophone={handleToggleMicrophone}
          />

          {/* Chat Input */}
          <ChatInput
            activeElementRef={activeElementRef}
            canSend={
              sessionStatus === "CONNECTED" &&
              dcRef.current?.readyState === "open"
            }
            onSendMessage={handleSendMessage}
          />
        </CardFooter>
      </div>
    </Card>
  );
}
