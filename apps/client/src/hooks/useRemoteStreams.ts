import { useEffect, useRef, useState } from "react";
import SimplePeer from "simple-peer";
import { getSocket } from "../lib/socket";
import { fetchIceServers } from "../lib/iceServers";
import type { WebRTCSignal } from "@gameion/shared";

/**
 * Host-side hook: receives video/audio streams from phones.
 * Creates one SimplePeer instance per incoming offer (initiator = false).
 */
export function useRemoteStreams(roomId: string) {
  const peersRef = useRef<Map<string, SimplePeer.Instance>>(new Map());
  const [streams, setStreams] = useState<Map<string, MediaStream>>(new Map());

  useEffect(() => {
    const socket = getSocket();

    const handleOffer = async (data: WebRTCSignal) => {
      // Don't create duplicate peers
      if (peersRef.current.has(data.fromSocketId)) {
        const existing = peersRef.current.get(data.fromSocketId)!;
        existing.signal(data.payload as SimplePeer.SignalData);
        return;
      }

      const iceServers = await fetchIceServers();

      const peer = new SimplePeer({
        initiator: false,
        trickle: true,
        config: { iceServers },
      });

      peer.on("signal", (signalData) => {
        if (signalData.type === "answer") {
          socket.emit("webrtc_answer", {
            roomId,
            fromSocketId: socket.id!,
            toSocketId: data.fromSocketId,
            type: "answer",
            payload: signalData,
          });
        } else if ("candidate" in signalData) {
          socket.emit("webrtc_ice_candidate", {
            roomId,
            fromSocketId: socket.id!,
            toSocketId: data.fromSocketId,
            type: "ice_candidate",
            payload: signalData,
          });
        }
      });

      peer.on("stream", (remoteStream: MediaStream) => {
        setStreams((prev) => new Map(prev).set(data.fromSocketId, remoteStream));
      });

      peer.on("close", () => {
        setStreams((prev) => {
          const next = new Map(prev);
          next.delete(data.fromSocketId);
          return next;
        });
        peersRef.current.delete(data.fromSocketId);
      });

      peer.on("error", (err) => {
        console.warn(`Peer error from ${data.fromSocketId}:`, err.message);
      });

      // Apply the offer signal
      peer.signal(data.payload as SimplePeer.SignalData);
      peersRef.current.set(data.fromSocketId, peer);
    };

    const handleIce = (data: WebRTCSignal) => {
      const peer = peersRef.current.get(data.fromSocketId);
      if (peer) peer.signal(data.payload as SimplePeer.SignalData);
    };

    socket.on("webrtc_offer", handleOffer);
    socket.on("webrtc_ice_candidate", handleIce);

    return () => {
      socket.off("webrtc_offer", handleOffer);
      socket.off("webrtc_ice_candidate", handleIce);
      for (const peer of peersRef.current.values()) {
        peer.destroy();
      }
      peersRef.current.clear();
    };
  }, [roomId]);

  return streams;
}
