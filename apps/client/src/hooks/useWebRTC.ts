import { useEffect, useRef, useState, useCallback } from "react";
import SimplePeer from "simple-peer";
import { getSocket } from "../lib/socket";
import { STUN_SERVERS } from "@gameion/shared";
import type { WebRTCSignal } from "@gameion/shared";

/**
 * Phone-side hook: streams mic/cam to all hosts in the room.
 * Creates one SimplePeer instance per host (initiator = phone).
 */
export function useWebRTC(roomId: string) {
  const peersRef = useRef<Map<string, SimplePeer.Instance>>(new Map());
  const streamRef = useRef<MediaStream | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);

  const startStreaming = useCallback(async (hostSocketIds: string[]) => {
    const socket = getSocket();

    // navigator.mediaDevices requires a secure context (HTTPS or localhost)
    if (!navigator.mediaDevices?.getUserMedia) {
      setMediaError("Camera requires HTTPS. Use localhost or enable HTTPS.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240, facingMode: "user" },
        audio: true,
      });
      streamRef.current = stream;
      setIsStreaming(true);

      for (const hostId of hostSocketIds) {
        if (peersRef.current.has(hostId)) continue;

        const peer = new SimplePeer({
          initiator: true,
          stream,
          trickle: true,
          config: { iceServers: STUN_SERVERS },
        });

        peer.on("signal", (signalData) => {
          if (signalData.type === "offer") {
            socket.emit("webrtc_offer", {
              roomId,
              fromSocketId: socket.id!,
              toSocketId: hostId,
              type: "offer",
              payload: signalData,
            });
          } else if ("candidate" in signalData) {
            socket.emit("webrtc_ice_candidate", {
              roomId,
              fromSocketId: socket.id!,
              toSocketId: hostId,
              type: "ice_candidate",
              payload: signalData,
            });
          }
        });

        peer.on("error", (err) => {
          console.warn(`Peer error with host ${hostId}:`, err.message);
        });

        peersRef.current.set(hostId, peer);
      }
    } catch (err) {
      setMediaError(err instanceof Error ? err.message : "Camera/mic access denied");
    }
  }, [roomId]);

  const stopStreaming = useCallback(() => {
    for (const peer of peersRef.current.values()) {
      peer.destroy();
    }
    peersRef.current.clear();

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }

    setIsStreaming(false);
  }, []);

  useEffect(() => {
    const socket = getSocket();

    // Handle answers from hosts
    const handleAnswer = (data: WebRTCSignal) => {
      const peer = peersRef.current.get(data.fromSocketId);
      if (peer) peer.signal(data.payload as SimplePeer.SignalData);
    };

    // Handle ICE candidates from hosts
    const handleIce = (data: WebRTCSignal) => {
      const peer = peersRef.current.get(data.fromSocketId);
      if (peer) peer.signal(data.payload as SimplePeer.SignalData);
    };

    socket.on("webrtc_answer", handleAnswer);
    socket.on("webrtc_ice_candidate", handleIce);

    return () => {
      socket.off("webrtc_answer", handleAnswer);
      socket.off("webrtc_ice_candidate", handleIce);
      stopStreaming();
    };
  }, [roomId, stopStreaming]);

  return { isStreaming, mediaError, startStreaming, stopStreaming };
}
