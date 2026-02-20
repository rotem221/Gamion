import {
  createContext,
  useContext,
  useReducer,
  type ReactNode,
  type Dispatch,
} from "react";
import type { Player, RoomState, MenuDirection, PlayerSlot } from "@gameion/shared";
import { GAMES } from "@gameion/shared";

export interface RoomContextState {
  roomId: string | null;
  players: Player[];
  selectedGameId: string | null;
  myPlayer: Player | null;
  menuHighlight: number;
  isConnected: boolean;
  gameStarted: boolean;
  slotAssignments: Record<string, PlayerSlot> | null;
  hostSocketIds: string[];
}

const initialState: RoomContextState = {
  roomId: null,
  players: [],
  selectedGameId: null,
  myPlayer: null,
  menuHighlight: 0,
  isConnected: false,
  gameStarted: false,
  slotAssignments: null,
  hostSocketIds: [],
};

export type RoomAction =
  | { type: "SET_ROOM_STATE"; payload: RoomState }
  | { type: "PLAYER_JOINED"; payload: Player }
  | { type: "PLAYER_LEFT"; payload: string }
  | { type: "SET_MY_PLAYER"; payload: Player }
  | { type: "MENU_NAVIGATE"; payload: MenuDirection }
  | { type: "GAME_SELECTED"; payload: string }
  | { type: "GAME_STARTED"; payload: { gameId: string; slotAssignments: Record<string, PlayerSlot> } }
  | { type: "SET_CONNECTED"; payload: boolean }
  | { type: "SET_HOST_LIST"; payload: string[] }
  | { type: "GAME_ENDED" }
  | { type: "RESET" };

function roomReducer(state: RoomContextState, action: RoomAction): RoomContextState {
  switch (action.type) {
    case "SET_ROOM_STATE":
      return {
        ...state,
        roomId: action.payload.id,
        players: action.payload.players,
        selectedGameId: action.payload.selectedGameId,
        hostSocketIds: action.payload.hostSocketIds,
      };
    case "PLAYER_JOINED":
      return {
        ...state,
        players: [...state.players, action.payload],
      };
    case "PLAYER_LEFT":
      return {
        ...state,
        players: state.players.filter((p) => p.id !== action.payload),
      };
    case "SET_MY_PLAYER":
      return {
        ...state,
        myPlayer: action.payload,
      };
    case "MENU_NAVIGATE": {
      const { payload: direction } = action;
      const total = GAMES.length;
      if (direction === "select") return state;
      if (direction === "right" || direction === "down") {
        return { ...state, menuHighlight: (state.menuHighlight + 1) % total };
      }
      if (direction === "left" || direction === "up") {
        return { ...state, menuHighlight: (state.menuHighlight - 1 + total) % total };
      }
      return state;
    }
    case "GAME_SELECTED":
      return { ...state, selectedGameId: action.payload };
    case "GAME_STARTED":
      return {
        ...state,
        gameStarted: true,
        selectedGameId: action.payload.gameId,
        slotAssignments: action.payload.slotAssignments,
      };
    case "SET_CONNECTED":
      return { ...state, isConnected: action.payload };
    case "SET_HOST_LIST":
      return { ...state, hostSocketIds: action.payload };
    case "GAME_ENDED":
      return {
        ...state,
        gameStarted: false,
        selectedGameId: null,
        slotAssignments: null,
      };
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

interface RoomContextValue {
  state: RoomContextState;
  dispatch: Dispatch<RoomAction>;
}

const RoomContext = createContext<RoomContextValue | null>(null);

export function RoomProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(roomReducer, initialState);

  return (
    <RoomContext.Provider value={{ state, dispatch }}>
      {children}
    </RoomContext.Provider>
  );
}

export function useRoomContext(): RoomContextValue {
  const ctx = useContext(RoomContext);
  if (!ctx) throw new Error("useRoomContext must be used within RoomProvider");
  return ctx;
}
