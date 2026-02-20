import { GAMES } from "@gameion/shared";
import { useRoomContext } from "../../context/RoomContext";
import { useRoom } from "../../hooks/useRoom";
import GameCard from "./GameCard";

export default function GameGrid() {
  const { state } = useRoomContext();
  const { selectGame } = useRoom();
  const { players, menuHighlight } = state;

  return (
    <div className="grid grid-cols-2 gap-6 max-w-2xl mx-auto">
      {GAMES.map((game, index) => {
        const isDisabled = game.exactPlayers !== undefined
          ? players.length !== game.exactPlayers
          : players.length < game.minPlayers || players.length > game.maxPlayers;

        const disabledReason = game.exactPlayers !== undefined
          ? `Requires exactly ${game.exactPlayers} players`
          : players.length < game.minPlayers
          ? `Requires at least ${game.minPlayers} players`
          : undefined;

        return (
          <GameCard
            key={game.id}
            game={game}
            isHighlighted={menuHighlight === index}
            isDisabled={isDisabled}
            disabledReason={disabledReason}
            onClick={() => selectGame(game.id)}
          />
        );
      })}
    </div>
  );
}
