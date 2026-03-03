import { QRCodeSVG } from "qrcode.react";

interface QRCodeProps {
  roomCode: string;
  size?: number;
}

export function QRCode({ roomCode, size = 180 }: QRCodeProps) {
  const joinUrl = `${window.location.origin}/join/${roomCode}`;

  return (
    <div className="bg-white p-3 rounded-lg inline-block">
      <QRCodeSVG
        value={joinUrl}
        size={size}
        bgColor="#ffffff"
        fgColor="#0f0d1a"
        level="M"
      />
    </div>
  );
}
