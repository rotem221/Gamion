import { DPad } from "./DPad";
import { ActionButtons } from "./ActionButtons";
import { useControllerInput } from "@/hooks/useControllerInput";
import type { ControllerButton, InputAction } from "@gamion/shared";

interface ControllerLayoutProps {
  playerName: string;
  roomCode: string;
  isLeader: boolean;
  onLeave: () => void;
}

export function ControllerLayout({
  playerName,
  roomCode,
  isLeader,
  onLeave,
}: ControllerLayoutProps) {
  const { sendInput } = useControllerInput();

  const handleInput = (button: ControllerButton, action: InputAction) => {
    sendInput(button, action);
  };

  return (
    <div className="fixed inset-0 bg-gamion-dark flex flex-col touch-none select-none overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-gamion-surface/80 border-b border-white/10">
        <button
          onTouchStart={(e) => {
            e.preventDefault();
            sendInput("home", "press");
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            sendInput("home", "release");
          }}
          className="px-3 py-1.5 text-xs bg-gamion-dark rounded border border-white/20 active:bg-gamion-primary touch-none"
        >
          HOME
        </button>
        <div className="text-center">
          <p className="text-sm font-semibold text-white">{playerName}</p>
          <p className="text-xs text-gray-500">
            Room {roomCode}
            {isLeader && (
              <span className="ml-1 text-gamion-secondary">&#x2605; Leader</span>
            )}
          </p>
        </div>
        <button
          onTouchStart={(e) => {
            e.preventDefault();
            sendInput("back", "press");
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            sendInput("back", "release");
          }}
          className="px-3 py-1.5 text-xs bg-gamion-dark rounded border border-white/20 active:bg-gamion-primary touch-none"
        >
          BACK
        </button>
      </div>

      {/* Main area */}
      <div className="flex-1 flex items-center justify-between px-8">
        <DPad onInput={handleInput} />
        <ActionButtons onInput={handleInput} />
      </div>

      {/* Bottom bar */}
      <div className="px-4 py-3 flex justify-center">
        <button
          onClick={onLeave}
          className="text-xs text-red-400 hover:text-red-300"
        >
          Leave Room
        </button>
      </div>
    </div>
  );
}
