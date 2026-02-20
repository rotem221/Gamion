import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { GAMES } from "@gameion/shared";
import { useSocket } from "../../hooks/useSocket";
import { useRoom } from "../../hooks/useRoom";
import { useRoomContext } from "../../context/RoomContext";
import { getSocket } from "../../lib/socket";
import { useRemoteStreams } from "../../hooks/useRemoteStreams";
import PlayersBar from "../../components/host/PlayersBar";
import QRCodeDisplay from "../../components/host/QRCodeDisplay";
import GameGrid from "../../components/host/GameGrid";
import VideoBubbles from "../../components/host/VideoBubbles";

export default function HostLobby() {
  useSocket();
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { createRoom, navigateMenu, selectGame, startGame } = useRoom();
  const { state, dispatch } = useRoomContext();
  const [rejoined, setRejoined] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const streams = useRemoteStreams(roomId!);

  // Persist roomId to sessionStorage
  useEffect(() => {
    if (roomId) {
      sessionStorage.setItem("gameion_host_roomId", roomId);
    }
  }, [roomId]);

  // Rejoin the Socket.io room so we receive broadcasts
  useEffect(() => {
    if (!roomId || rejoined) return;

    const socket = getSocket();

    const doRejoin = () => {
      socket.emit("host_rejoin", { roomId }, (response) => {
        if (response.ok) {
          dispatch({ type: "SET_ROOM_STATE", payload: response.room });
          setRejoined(true);
        } else {
          // Room no longer exists — clear session and go back to landing
          sessionStorage.removeItem("gameion_host_roomId");
          navigate("/", { replace: true });
        }
      });
    };

    if (socket.connected) {
      doRejoin();
    } else {
      socket.once("connect", doRejoin);
    }
  }, [roomId, rejoined, dispatch]);

  // Handle "select" direction from phone DPad (select game or start game)
  useEffect(() => {
    const socket = getSocket();
    const handleMenuSelect = (direction: string) => {
      if (direction !== "select") return;
      if (state.selectedGameId) {
        startGame().catch((err) => {
          setStartError(err instanceof Error ? err.message : "Failed to start");
        });
      } else {
        const game = GAMES[state.menuHighlight];
        if (game) {
          selectGame(game.id);
        }
      }
    };
    socket.on("menu_navigate", handleMenuSelect);
    return () => { socket.off("menu_navigate", handleMenuSelect); };
  }, [state.selectedGameId, state.menuHighlight, selectGame, startGame]);

  // Navigate to game view when game starts
  useEffect(() => {
    if (state.gameStarted && state.selectedGameId && roomId) {
      navigate(`/host/${roomId}/game/${state.selectedGameId}`);
    }
  }, [state.gameStarted, state.selectedGameId, roomId, navigate]);

  // Keyboard navigation: arrows to move, Enter/Space to select/start
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!roomId) return;

      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          navigateMenu("left");
          break;
        case "ArrowRight":
          e.preventDefault();
          navigateMenu("right");
          break;
        case "ArrowUp":
          e.preventDefault();
          navigateMenu("up");
          break;
        case "ArrowDown":
          e.preventDefault();
          navigateMenu("down");
          break;
        case "Enter":
        case " ": {
          e.preventDefault();
          // If a game is already selected, start it
          if (state.selectedGameId) {
            startGame().catch((err) => {
              setStartError(err instanceof Error ? err.message : "Failed to start");
            });
          } else {
            // Select the currently highlighted game
            const game = GAMES[state.menuHighlight];
            if (game) {
              selectGame(game.id);
            }
          }
          break;
        }
      }
    },
    [roomId, state.selectedGameId, state.menuHighlight, navigateMenu, selectGame, startGame]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const handleBack = () => {
    if (roomId) {
      const socket = getSocket();
      socket.emit("leave_room", { roomId });
    }
    dispatch({ type: "RESET" });
    sessionStorage.removeItem("gameion_host_roomId");
    navigate("/");
  };

  const handleNewCode = async () => {
    setIsCreatingNew(true);
    try {
      if (roomId) {
        const socket = getSocket();
        socket.emit("leave_room", { roomId });
      }
      dispatch({ type: "RESET" });
      const newRoomId = await createRoom();
      sessionStorage.setItem("gameion_host_roomId", newRoomId);
      navigate(`/host/${newRoomId}`, { replace: true });
    } catch {
      navigate("/");
    } finally {
      setIsCreatingNew(false);
    }
  };

  if (!roomId) return null;

  return (
    <div className="min-h-dvh flex flex-col relative">
      {/* Video bubbles from phone cameras */}
      <VideoBubbles streams={streams} players={state.players} />

      {/* Top bar: back + new code */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <button
          onClick={handleBack}
          className="flex items-center gap-1.5 text-neon-300/60 hover:text-neon-300 transition-colors text-sm"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
            <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back
        </button>
        <button
          onClick={handleNewCode}
          disabled={isCreatingNew}
          className="text-neon-300/60 hover:text-neon-300 transition-colors text-sm disabled:opacity-40"
        >
          {isCreatingNew ? "Creating..." : "New Room Code"}
        </button>
      </div>

      <PlayersBar players={state.players} />

      <div className="flex-1 flex flex-col items-center justify-center gap-10 px-8 py-6">
        <QRCodeDisplay roomId={roomId} />

        <div className="w-full max-w-3xl">
          <h2 className="text-neon-300 text-sm font-medium mb-4 text-center uppercase tracking-wider">
            Select a Game
          </h2>
          <GameGrid />

          {/* Keyboard hint + start button */}
          <div className="flex flex-col items-center gap-3 mt-6">
            <p className="text-neon-400/40 text-xs">
              Use arrow keys to navigate, Enter to select
            </p>
            {state.selectedGameId && (
              <button
                onClick={() => {
                  setStartError(null);
                  startGame().catch((err) => {
                    setStartError(err instanceof Error ? err.message : "Failed to start");
                  });
                }}
                className="px-6 py-2 rounded-xl bg-neon-500/20 border border-neon-400/50 text-neon-200 text-sm font-medium hover:bg-neon-500/30 transition-colors"
              >
                Start Game (Enter)
              </button>
            )}
            {startError && (
              <p className="text-red-400 text-xs">{startError}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
