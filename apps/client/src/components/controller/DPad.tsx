import type { ControllerButton, InputAction } from "@gamion/shared";

interface DPadProps {
  onInput: (button: ControllerButton, action: InputAction) => void;
}

export function DPad({ onInput }: DPadProps) {
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

  const btnBase =
    "absolute bg-gamion-surface border border-white/20 active:bg-gamion-primary flex items-center justify-center touch-none select-none transition-colors";

  return (
    <div className="relative w-40 h-40">
      {/* Up */}
      <button
        {...handlers("dpad-up")}
        className={`${btnBase} top-0 left-1/2 -translate-x-1/2 w-14 h-14 rounded-t-lg`}
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 4l-8 8h16z" />
        </svg>
      </button>
      {/* Down */}
      <button
        {...handlers("dpad-down")}
        className={`${btnBase} bottom-0 left-1/2 -translate-x-1/2 w-14 h-14 rounded-b-lg`}
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 20l8-8H4z" />
        </svg>
      </button>
      {/* Left */}
      <button
        {...handlers("dpad-left")}
        className={`${btnBase} left-0 top-1/2 -translate-y-1/2 w-14 h-14 rounded-l-lg`}
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M4 12l8-8v16z" />
        </svg>
      </button>
      {/* Right */}
      <button
        {...handlers("dpad-right")}
        className={`${btnBase} right-0 top-1/2 -translate-y-1/2 w-14 h-14 rounded-r-lg`}
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20 12l-8 8V4z" />
        </svg>
      </button>
      {/* Center */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-gamion-surface border border-white/10" />
    </div>
  );
}
