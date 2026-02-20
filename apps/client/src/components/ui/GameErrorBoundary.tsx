import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class GameErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("Game error:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-[#0f0a2e] text-center px-6">
          <div className="text-5xl mb-4">&#9888;&#65039;</div>
          <h2 className="text-xl font-bold text-white mb-2">
            Failed to load game
          </h2>
          <p className="text-white/50 text-sm mb-6 max-w-sm">
            {this.state.error?.message || "An unexpected error occurred while loading the game."}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 rounded-xl bg-neon-500/20 border border-neon-400/50 text-neon-200 text-sm font-medium hover:bg-neon-500/30 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
