import { useEffect, useRef } from "react";
import { connectSocket, getSocket } from "../lib/socket";
import { useRoomContext } from "../context/RoomContext";
import { useGameStore } from "../stores/gameStore";
import { useBowlingStore } from "../stores/bowlingStore";

export function useSocket() {
  const { dispatch } = useRoomContext();
  const listenersAttached = useRef(false);

  useEffect(() => {
    const socket = connectSocket();

    if (listenersAttached.current) return;
    listenersAttached.current = true;

    socket.on("connect", () => {
      dispatch({ type: "SET_CONNECTED", payload: true });
    });

    socket.on("disconnect", () => {
      dispatch({ type: "SET_CONNECTED", payload: false });
    });

    socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
      dispatch({ type: "SET_CONNECTED", payload: false });
    });

    socket.on("room_state", (state) => {
      dispatch({ type: "SET_ROOM_STATE", payload: state });
    });

    socket.on("player_joined", (player) => {
      dispatch({ type: "PLAYER_JOINED", payload: player });
    });

    socket.on("player_left", (playerId) => {
      dispatch({ type: "PLAYER_LEFT", payload: playerId });
    });

    socket.on("menu_navigate", (direction) => {
      dispatch({ type: "MENU_NAVIGATE", payload: direction });
    });

    socket.on("game_selected", (gameId) => {
      dispatch({ type: "GAME_SELECTED", payload: gameId });
    });

    // Phase 2: Game started
    socket.on("game_started", ({ gameId, slotAssignments }) => {
      dispatch({ type: "GAME_STARTED", payload: { gameId, slotAssignments } });

      const gameStore = useGameStore.getState();
      gameStore.setPlaying(true, gameId);
      gameStore.setSlotAssignments(slotAssignments);
    });

    // Phase 2: Apply input (host receives game inputs)
    socket.on("apply_input", (data) => {
      useGameStore.getState().applyInput(data);
    });

    // Phase 2: Host list (for WebRTC on phone side)
    socket.on("host_list", (hostIds) => {
      dispatch({ type: "SET_HOST_LIST", payload: hostIds });
    });

    // Phase 3: Bowling events
    socket.on("bowling_state", (state) => {
      useBowlingStore.getState().setGameState(state);
    });

    socket.on("bowling_throw_result", (result) => {
      useBowlingStore.getState().setThrowResult(result);
    });

    socket.on("bowling_your_turn", ({ playerId }) => {
      const myId = socket.id;
      useBowlingStore.getState().setMyTurn(playerId === myId);
    });

    // Exit game — return to lobby
    socket.on("game_ended", () => {
      dispatch({ type: "GAME_ENDED" });
      useGameStore.getState().reset();
      useBowlingStore.getState().reset();
    });
  }, [dispatch]);

  return getSocket();
}
