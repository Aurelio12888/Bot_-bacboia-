
import React, { useRef, useState, useEffect } from 'react';

interface LiveMonitorProps {
  onFrameCaptured: (base64: string) => void;
  isSyncing: boolean;
}

const LiveMonitor: React.FC<LiveMonitorProps> = ({ onFrameCaptured, isSyncing }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isStarting, setIsStarting] = useState(false);

  const startScreenCapture = async () => {
    setIsStarting(true);
    try {
      const mediaStream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: "never" } as any,
        audio: false
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error("Error sharing screen:", err);
    } finally {
      setIsStarting(false);
    }
  };

  useEffect(() => {
    let interval: number;
    if (stream && isSyncing) {
      interval = window.setInterval(() => {
        captureFrame();
      }, 4000);
    }
    return () => clearInterval(interval);
  }, [stream, isSyncing]);

  const captureFrame = () => {
    if (videoRef.current && canvasRef.current && stream?.active) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
        try {
          const base64 = canvasRef.current.toDataURL('image/jpeg', 0.5).split(',')[1];
          onFrameCaptured(base64);
        } catch (e) {
          console.error(e);
        }
      }
    }
  };

  return (
    <div className="relative h-full flex flex-col justify-center bg-black overflow-hidden border-x border-slate-800">
      {!stream ? (
        <button 
          onClick={startScreenCapture}
          className="mx-auto flex flex-col items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          <div className="w-12 h-12 rounded-full border-2 border-dashed border-indigo-500/50 flex items-center justify-center animate-pulse">
            <i className="fa-solid fa-crosshairs text-xl"></i>
          </div>
          <span className="text-[10px] font-orbitron font-bold tracking-widest uppercase">Ativar Scanner de Tela</span>
        </button>
      ) : (
        <>
          <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover opacity-60" />
          <div className="absolute inset-0 scanner-line pointer-events-none opacity-30"></div>
          <button 
            onClick={() => { stream.getTracks().forEach(t => t.stop()); setStream(null); }}
            className="absolute top-2 right-2 p-1.5 bg-red-500/20 hover:bg-red-500/40 text-red-500 rounded-lg transition-all"
          >
            <i className="fa-solid fa-power-off text-xs"></i>
          </button>
        </>
      )}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default LiveMonitor;
