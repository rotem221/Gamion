import type { ControllerButton, InputAction } from "@gamion/shared";

interface ActionButtonsProps {
  onInput: (button: ControllerButton, action: InputAction) => void;
}

export function ActionButtons({ onInput }: ActionButtonsProps) {
  const handlers = (button: ControllerButton) => ({
    onTouchStart: (e: React.TouchEvent) => {
      e.preventDefault();
      onInput(button, "press");
    },
    onTouchEnd: (e: React.TouchEvent) => {
      e.preventDefault();
      onInput(button, "release");
    },
    onTouchCancel: (e: React.TouchEvent) => {
      e.preventDefault();
      onInput(button, "release");
    },
  });

  return (
    <div className="relative w-32 h-32">
      {/* B button (left-lower) */}
      <button
        {...handlers("button-b")}
        className="absolute left-0 bottom-0 w-16 h-16 rounded-full bg-red-600 border-2 border-red-400 active:bg-red-500 active:scale-95 flex items-center justify-center touch-none select-none font-bold text-xl text-white shadow-lg transition-all"
      >
        B
      </button>
      {/* A button (right-upper) */}
      <button
        {...handlers("button-a")}
        className="absolute right-0 top-0 w-16 h-16 rounded-full bg-gamion-primary border-2 border-gamion-secondary active:bg-gamion-secondary active:scale-95 flex items-center justify-center touch-none select-none font-bold text-xl text-white shadow-lg transition-all"
      >
        A
      </button>
    </div>
  );
}
