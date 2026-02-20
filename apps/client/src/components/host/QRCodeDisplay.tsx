import QRCode from "react-qr-code";
import GlassCard from "../ui/GlassCard";

interface QRCodeDisplayProps {
  roomId: string;
}

export default function QRCodeDisplay({ roomId }: QRCodeDisplayProps) {
  const controllerUrl = `${window.location.origin}/play/${roomId}`;
  const isLocalhost =
    window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

  return (
    <GlassCard className="p-8 flex flex-col items-center gap-6">
      {isLocalhost && (
        <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg px-4 py-2 text-yellow-300 text-sm text-center">
          Please switch to your Network IP for mobile connection.
          <br />
          <span className="text-yellow-400/70 text-xs">
            Check the Vite terminal for the Network URL.
          </span>
        </div>
      )}

      <div className="bg-white p-4 rounded-xl">
        <QRCode
          value={controllerUrl}
          size={200}
          fgColor="#1e1b4b"
          bgColor="#ffffff"
        />
      </div>

      <div className="text-center">
        <p className="text-neon-300 text-sm mb-1">Room Code</p>
        <p className="text-4xl font-mono font-bold tracking-[0.3em] text-white">
          {roomId}
        </p>
      </div>

      <p className="text-neon-400/60 text-xs text-center">
        Scan the QR code or enter the room code on your phone
      </p>
    </GlassCard>
  );
}
