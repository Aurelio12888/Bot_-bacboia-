
import React, { useState, useRef, useEffect } from 'react';
import { ResultColor, GameResult } from './types';
import { performTurboAnalysis } from './services/geminiService';

const App: React.FC = () => {
  const [history, setHistory] = useState<GameResult[]>([]);
  const [currentSignal, setCurrentSignal] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  useEffect(() => {
    let interval: number;
    if (isAnalyzing) {
      setProgress(0);
      interval = window.setInterval(() => {
        setProgress(prev => (prev < 98 ? prev + (100 - prev) * 0.4 : prev));
      }, 80);
    } else {
      setProgress(100);
    }
    return () => clearInterval(interval);
  }, [isAnalyzing]);

  const processImage = async (base64: string) => {
    setIsAnalyzing(true);
    setPreviewImage(`data:image/jpeg;base64,${base64}`);
    setCurrentSignal(null);
    
    try {
      const result = await performTurboAnalysis(base64);
      if (result.history.length > 0) {
        setHistory(result.history.map((c, i) => ({ 
          id: `${i}-${Date.now()}`, 
          color: c, 
          timestamp: Date.now() 
        })));
      }
      setCurrentSignal(result.signal);
    } catch (err) {
      setCurrentSignal("❌ ERRO DE CONEXÃO. VERIFIQUE SUA INTERNET.");
    } finally {
      setIsAnalyzing(false);
      setProgress(100);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        processImage(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    setIsCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      alert("Permita o uso da câmera para o scanner.");
      setIsCameraActive(false);
    }
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        // Alta resolução para o OCR não falhar
        canvasRef.current.width = 1280;
        canvasRef.current.height = 720;
        
        // FILTROS DE PRÉ-PROCESSAMENTO: Aumentar contraste ajuda a IA a ver as cores
        ctx.filter = 'contrast(1.4) saturate(1.3) brightness(1.1)';
        ctx.drawImage(videoRef.current, 0, 0, 1280, 720);
        
        const base64 = canvasRef.current.toDataURL('image/jpeg', 0.85).split(',')[1];
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        setIsCameraActive(false);
        processImage(base64);
      }
    }
  };

  return (
    <div className="h-screen w-screen bg-[#020205] text-white font-inter overflow-hidden flex flex-col">
      
      {/* HEADER HUD */}
      <div className="h-14 border-b border-white/5 flex items-center px-6 justify-between bg-black/60 backdrop-blur-2xl z-50">
        <div className="flex items-center gap-3">
          <div className={`w-2.5 h-2.5 rounded-full ${isAnalyzing ? 'bg-indigo-500 animate-ping' : 'bg-green-500 shadow-[0_0_10px_#22c55e]'}`}></div>
          <span className="font-orbitron font-bold text-[10px] tracking-[0.4em] text-slate-300">BANTU PHANTOM V16</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[7px] font-bold text-indigo-400 tracking-widest uppercase">Stealth Mode Active</span>
          {isAnalyzing && (
            <div className="w-20 h-1 bg-white/5 mt-1 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 transition-all duration-300" style={{ width: `${progress}%` }}></div>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto max-w-2xl mx-auto w-full pb-32">
        
        {/* VIEWPORT */}
        <div className="relative aspect-[16/9] w-full bg-slate-900/40 rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl group">
          {isCameraActive ? (
            <div className="w-full h-full relative">
              <video ref={videoRef} className="w-full h-full object-cover" />
              <div className="absolute inset-0 border-[40px] border-black/40 pointer-events-none">
                 <div className="w-full h-full border-2 border-indigo-500/30 border-dashed rounded-xl flex items-center justify-center">
                    <span className="text-[8px] font-orbitron text-white/40 tracking-[0.5em] uppercase">Centralize o Bead Plate</span>
                 </div>
              </div>
              <button onClick={takePhoto} className="absolute bottom-6 left-1/2 -translate-x-1/2 w-20 h-20 bg-white rounded-full border-[6px] border-indigo-500/20 shadow-2xl active:scale-90 flex items-center justify-center">
                 <div className="w-14 h-14 bg-indigo-600 rounded-full flex items-center justify-center">
                    <i className="fa-solid fa-bolt-lightning text-white"></i>
                 </div>
              </button>
            </div>
          ) : previewImage ? (
            <div className="relative w-full h-full">
              <img src={previewImage} className="w-full h-full object-cover opacity-80" alt="Preview" />
              {isAnalyzing && <div className="scanner-line"></div>}
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-950/20 to-transparent">
              <i className="fa-solid fa-microchip text-4xl text-indigo-500/20 mb-4"></i>
              <p className="text-[9px] font-orbitron font-bold tracking-[0.4em] text-indigo-500/40 uppercase">Aguardando Captura Digital</p>
            </div>
          )}
        </div>

        {/* HUD DE SINAL */}
        {currentSignal && (
          <div className="w-full bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in duration-300">
             <div className="flex items-center justify-between mb-6">
                <span className="text-[10px] font-orbitron font-bold text-indigo-400 uppercase tracking-widest">Relatório de Probabilidade</span>
                <i className="fa-solid fa-shield-halved text-indigo-500/50"></i>
             </div>
             <pre className="whitespace-pre-wrap font-orbitron text-xl font-bold text-white leading-tight">
               {currentSignal}
             </pre>
          </div>
        )}

        {/* BOTOES DE ACAO */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-sm px-6 grid grid-cols-2 gap-4">
          <button onClick={startCamera} disabled={isAnalyzing} className="flex flex-col items-center gap-2 bg-white text-black py-4 rounded-3xl font-orbitron font-bold shadow-2xl active:scale-95 transition-all">
            <i className="fa-solid fa-camera-viewfinder"></i>
            <span className="text-[8px] tracking-widest">SCANNER</span>
          </button>
          <button onClick={() => fileInputRef.current?.click()} disabled={isAnalyzing} className="flex flex-col items-center gap-2 bg-indigo-600 text-white py-4 rounded-3xl font-orbitron font-bold shadow-2xl active:scale-95 transition-all">
            <i className="fa-solid fa-cloud-arrow-up"></i>
            <span className="text-[8px] tracking-widest">UPLOAD</span>
          </button>
        </div>

        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
      </div>

      <canvas ref={canvasRef} className="hidden" />

      {/* FOOTER HISTORICO */}
      {history.length > 0 && (
        <div className="px-6 py-4 bg-black/80 backdrop-blur-md border-t border-white/5 flex gap-2 overflow-x-auto no-scrollbar justify-center">
          {history.map((h, i) => (
            <div key={i} className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center text-[10px] font-black transition-all ${
              h.color === ResultColor.BLUE ? 'bg-blue-600 border-blue-400 text-white shadow-[0_0_10px_rgba(59,130,246,0.5)]' :
              h.color === ResultColor.RED ? 'bg-red-600 border-red-400 text-white shadow-[0_0_10px_rgba(239,68,68,0.5)]' :
              'bg-green-600 border-green-400 text-white shadow-[0_0_10px_rgba(34,197,94,0.5)]'
            }`}>
              {h.color === ResultColor.BLUE ? 'A' : h.color === ResultColor.RED ? 'V' : 'E'}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default App;
