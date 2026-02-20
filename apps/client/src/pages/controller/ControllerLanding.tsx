import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import GlassCard from "../../components/ui/GlassCard";
import NeonButton from "../../components/ui/NeonButton";

export default function ControllerLanding() {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [showScanner, setShowScanner] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<number | null>(null);

  const handleCodeSubmit = () => {
    const trimmed = code.trim();
    if (trimmed.length >= 4) {
      navigate(`/play/${trimmed}`);
    }
  };

  const stopCamera = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setShowScanner(false);
  };

  const startScanner = async () => {
    setCameraError(null);
    setShowScanner(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // Use BarcodeDetector if available
      if ("BarcodeDetector" in window) {
        const detector = new (window as any).BarcodeDetector({ formats: ["qr_code"] });
        scanIntervalRef.current = window.setInterval(async () => {
          if (!videoRef.current || videoRef.current.readyState < 2) return;
          try {
            const barcodes = await detector.detect(videoRef.current);
            for (const barcode of barcodes) {
              const url = barcode.rawValue;
              // Extract roomId from URL: .../play/XXXX
              const match = url.match(/\/play\/([A-Z0-9]+)/i);
              if (match) {
                stopCamera();
                navigate(`/play/${match[1]}`);
                return;
              }
            }
          } catch {
            // Detection frame error, ignore
          }
        }, 300);
      } else {
        setCameraError("QR scanning not supported on this browser. Please enter the code manually.");
      }
    } catch {
      setCameraError("Could not access camera. Please enter the code manually.");
      setShowScanner(false);
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="text-4xl mb-3">🎮</div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-neon-300 to-neon-500 bg-clip-text text-transparent">
          GAMEION
        </h1>
        <p className="text-neon-300/60 text-sm mt-2">
          Join a game room
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="w-full max-w-xs"
      >
        <GlassCard className="p-6 flex flex-col gap-5">
          {/* Manual code entry */}
          <div>
            <label className="text-neon-300/80 text-sm mb-2 block">
              Room Code
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/[^A-Za-z0-9]/g, "").slice(0, 6))}
              onKeyDown={(e) => e.key === "Enter" && handleCodeSubmit()}
              placeholder="Enter 4-digit code"
              maxLength={6}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-center text-2xl font-mono tracking-[0.3em] placeholder-white/30 placeholder:text-base placeholder:tracking-normal outline-none focus:border-neon-400 transition-colors"
            />
          </div>

          <NeonButton
            onClick={handleCodeSubmit}
            disabled={code.trim().length < 4}
            className="w-full"
          >
            Join Room
          </NeonButton>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-neon-300/40 text-xs">or</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <NeonButton
            onClick={showScanner ? stopCamera : startScanner}
            className="w-full"
          >
            {showScanner ? "Close Camera" : "Scan QR Code"}
          </NeonButton>

          {cameraError && (
            <p className="text-red-400 text-xs text-center">{cameraError}</p>
          )}
        </GlassCard>

        {/* QR Scanner */}
        <AnimatePresence>
          {showScanner && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 overflow-hidden"
            >
              <GlassCard className="p-3">
                <div className="relative rounded-lg overflow-hidden aspect-square bg-black">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  {/* Scan overlay */}
                  <div className="absolute inset-0 border-2 border-neon-400/50 rounded-lg pointer-events-none">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-neon-400 rounded-tl-lg" />
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-neon-400 rounded-tr-lg" />
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-neon-400 rounded-bl-lg" />
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-neon-400 rounded-br-lg" />
                  </div>
                </div>
                <p className="text-neon-300/50 text-xs text-center mt-2">
                  Point camera at QR code on the host screen
                </p>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
