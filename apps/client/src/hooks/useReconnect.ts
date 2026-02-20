import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getSocket } from "../lib/socket";
import { useRoomContext } from "../context/RoomContext";

const SESSION_KEY = "gameion_session";

interface SavedSession {
  roomId: string;
  playerId: string;
  token: string;
  name: string;
  avatar: string;
}

export function saveSession(roomId: string, playerId: string, token: string, name: string, avatar: string) {
  localStorage.setItem(SESSION_KEY, JSON.stringify({ roomId, playerId, token, name, avatar }));
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

export function getSavedSession(): SavedSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Hook for controller (phone) reconnection.
 * On socket reconnect, attempts to rejoin_room with saved session token.
 */
export function useReconnect() {
  const { dispatch } = useRoomContext();
  const navigate = useNavigate();
  const attemptedRef = useRef(false);

  useEffect(() => {
    const socket = getSocket();

    const handleReconnect = () => {
      const session = getSavedSession();
      if (!session || attemptedRef.current) return;
      attemptedRef.current = true;

      socket.emit(
        "rejoin_room",
        {
          roomId: session.roomId,
          playerId: session.playerId,
          token: session.token,
        },
        (response) => {
          attemptedRef.current = false;
          if (response.ok) {
            dispatch({
              type: "SET_MY_PLAYER",
              payload: response.player,
            });
            // Save new token with updated player ID
            saveSession(
              session.roomId,
              response.player.id,
              session.token,
              session.name,
              session.avatar
            );
          } else {
            // Session invalid — clear and redirect to join
            clearSession();
            navigate("/join", { replace: true });
          }
        }
      );
    };

    socket.on("connect", handleReconnect);

    return () => {
      socket.off("connect", handleReconnect);
    };
  }, [dispatch, navigate]);
}
