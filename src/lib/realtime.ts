import { RefObject } from "react";

export async function fetchEphemeralKey(): Promise<string | null> {
  const response = await fetch("/api/session");
  const data = await response.json();

  if (!data.client_secret?.value) {
    console.error("Failed to fetch ephemeral key.");

    return null;
  }

  return data.client_secret.value;
}

interface CreateRealtimeConnectionParams {
  EPHEMERAL_KEY: string;
  audioElement: RefObject<HTMLAudioElement | null>;
}

export async function createRealtimeConnection({
  EPHEMERAL_KEY,
  audioElement,
}: CreateRealtimeConnectionParams): Promise<{
  pc: RTCPeerConnection;
  dc: RTCDataChannel;
  ms: MediaStream;
}> {
  const pc = new RTCPeerConnection();

  pc.ontrack = (e) => {
    if (audioElement.current) {
      audioElement.current.srcObject = e.streams[0];
    }
  };

  const ms = await navigator.mediaDevices.getUserMedia({ audio: true });
  pc.addTrack(ms.getTracks()[0]);

  const dc = pc.createDataChannel("oai-events");

  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);

  const baseURL = "https://api.openai.com/v1/realtime";
  const model = "gpt-4o-realtime-preview";

  const sdpResponse = await fetch(`${baseURL}?model=${model}`, {
    method: "POST",
    body: offer.sdp,
    headers: {
      Authorization: `Bearer ${EPHEMERAL_KEY}`,
      "Content-Type": "application/sdp",
    },
  });

  const answerSDP = await sdpResponse.text();
  const answer: RTCSessionDescriptionInit = {
    type: "answer",
    sdp: answerSDP,
  };

  await pc.setRemoteDescription(answer);

  return { pc, dc, ms };
}
