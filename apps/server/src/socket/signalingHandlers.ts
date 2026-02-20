import type { Server, Socket } from "socket.io";
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData,
  WebRTCSignal,
} from "@gameion/shared";

type GameServer = Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;
type GameSocket = Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;

export function registerSignalingHandlers(io: GameServer, socket: GameSocket) {
  // Pure relay: forward WebRTC signaling to the target socket
  socket.on("webrtc_offer", (data: WebRTCSignal) => {
    io.to(data.toSocketId).emit("webrtc_offer", data);
  });

  socket.on("webrtc_answer", (data: WebRTCSignal) => {
    io.to(data.toSocketId).emit("webrtc_answer", data);
  });

  socket.on("webrtc_ice_candidate", (data: WebRTCSignal) => {
    io.to(data.toSocketId).emit("webrtc_ice_candidate", data);
  });
}
