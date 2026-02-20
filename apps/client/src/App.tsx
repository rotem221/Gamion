import { ConnectionStatus } from "@/components/ConnectionStatus";
import { Home } from "@/pages/Home";

function App() {
  return (
    <div className="min-h-screen bg-gamion-dark text-white font-display">
      <Home />
      <ConnectionStatus />
    </div>
  );
}

export default App;
