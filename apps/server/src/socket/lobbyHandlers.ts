import type { Server, Socket } from "socket.io";
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData,
} from "@gameion/shared";
import { GAMES } from "@gameion/shared";
import { roomStore } from "../state/roomStore.js";

type GameServer = Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;
type GameSocket = Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;

export function registerLobbyHandlers(io: GameServer, socket: GameSocket) {
  socket.on("navigate_menu", (data) => {
    const { roomId, direction } = data;

    // Allow both leader (phone) and host (desktop) to navigate
    if (!roomStore.isLeader(roomId, socket.id) && !roomStore.isHost(roomId, socket.id)) {
      socket.emit("error", "Only the leader or host can navigate the menu");
      return;
    }

    io.to(roomId).emit("menu_navigate", direction);
  });

  socket.on("select_game", (data) => {
    const { roomId, gameId } = data;

    const room = roomStore.get(roomId);
    if (!room) {
      socket.emit("error", "Room not found");
      return;
    }

    // Allow both leader and host to select
    if (!roomStore.isLeader(roomId, socket.id) && !roomStore.isHost(roomId, socket.id)) {
      socket.emit("error", "Only the leader or host can select a game");
      return;
    }

    const game = GAMES.find((g) => g.id === gameId);
    if (!game) {
      socket.emit("error", "Game not found");
      return;
    }

    const playerCount = room.players.length;
    if (game.exactPlayers !== undefined && playerCount !== game.exactPlayers) {
      socket.emit("error", `This game requires exactly ${game.exactPlayers} players`);
      return;
    }
    if (playerCount < game.minPlayers) {
      socket.emit("error", `This game requires at least ${game.minPlayers} players`);
      return;
    }
    if (playerCount > game.maxPlayers) {
      socket.emit("error", `This game supports at most ${game.maxPlayers} players`);
      return;
    }

    room.selectedGameId = gameId;
    console.log(`Game "${game.title}" selected in room ${roomId}`);
    io.to(roomId).emit("game_selected", gameId);
  });
}
