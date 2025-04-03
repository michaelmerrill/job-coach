import { useEffect, useState, useCallback, RefObject } from "react";
import { Button } from "@/components/ui/button";
import { SessionStatus } from "@/lib/types";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { MicOff, Mic, Volume2, VolumeOff } from "lucide-react";

interface AudioToolbarParams {
  activeElementRef?: RefObject<HTMLTextAreaElement | null>;
  sessionStatus: SessionStatus;
  isPTTEnabled: boolean;
  isAudioPlaybackEnabled: boolean;
  isMicrophoneMuted: boolean;
  onStartTalking: () => void;
  onStopTalking: () => void;
  onTogglePTT: (enabled: boolean) => void;
  onToggleAudioPlayback: (enabled: boolean) => void;
  onToggleMicrophone: (muted: boolean) => void;
}

export default function AudioToolbar({
  activeElementRef,
  sessionStatus,
  isPTTEnabled,
  isAudioPlaybackEnabled,
  isMicrophoneMuted,
  onStartTalking,
  onStopTalking,
  onTogglePTT,
  onToggleAudioPlayback,
  onToggleMicrophone,
}: AudioToolbarParams) {
  const [isTalking, setIsTalking] = useState(false);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.code === "Space" && isPTTEnabled && !isTalking) {
        if (document.activeElement === activeElementRef?.current) return;
        event.preventDefault();
        setIsTalking(true);
        onStartTalking();
      }
    },
    [isPTTEnabled, isTalking, activeElementRef, onStartTalking],
  );

  const handleKeyUp = useCallback(
    (event: KeyboardEvent) => {
      if (event.code === "Space" && isPTTEnabled && isTalking) {
        setIsTalking(false);
        onStopTalking();
      }
    },
    [isPTTEnabled, isTalking, onStopTalking],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  const handleTogglePTT = () => {
    onTogglePTT(!isPTTEnabled);
  };

  const handleToggleAudioPlayback = () => {
    onToggleAudioPlayback(!isAudioPlaybackEnabled);
  };

  const handleToggleMicrophone = () => {
    onToggleMicrophone(!isMicrophoneMuted);
  };

  const isConnected = sessionStatus === "CONNECTED";

  return (
    <TooltipProvider>
      <>
        <div className="flex gap-4 items-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={handleToggleMicrophone}
                variant="outline"
                size="icon"
                disabled={!isConnected}
                aria-label={
                  isMicrophoneMuted ? "Unmute microphone" : "Mute microphone"
                }
                className={cn(
                  "rounded-full",
                  isMicrophoneMuted ? "bg-red-100 text-red-600" : "bg-gray-100",
                )}
              >
                {isMicrophoneMuted ? <MicOff size={18} /> : <Mic size={18} />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                {isMicrophoneMuted ? "Unmute microphone" : "Mute microphone"}
              </p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={handleToggleAudioPlayback}
                variant="outline"
                size="icon"
                disabled={!isConnected}
                aria-label={
                  isAudioPlaybackEnabled
                    ? "Disable audio playback"
                    : "Enable audio playback"
                }
                className={cn(
                  "rounded-full",
                  !isAudioPlaybackEnabled
                    ? "bg-red-100 text-red-600"
                    : "bg-gray-100",
                )}
              >
                {isAudioPlaybackEnabled ? (
                  <Volume2 size={18} />
                ) : (
                  <VolumeOff size={18} />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Toggle audio playback</p>
            </TooltipContent>
          </Tooltip>

          <div className="flex gap-2 items-center">
            <Label htmlFor="ptt-mode" className="text-sm text-gray-500">
              Push to talk
            </Label>
            <Switch
              id="ptt-mode"
              checked={isPTTEnabled}
              onCheckedChange={handleTogglePTT}
            />
          </div>
        </div>
      </>
    </TooltipProvider>
  );
}
