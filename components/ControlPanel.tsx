
import React from 'react';
import { ResultColor } from '../types';

interface ControlPanelProps {
  onAddResult: (color: ResultColor) => void;
  isAnalyzing: boolean;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ onAddResult, isAnalyzing }) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <button
        disabled={isAnalyzing}
        onClick={() => onAddResult(ResultColor.BLUE)}
        className="group relative bg-blue-900/40 hover:bg-blue-800/60 border-2 border-blue-500/50 rounded-2xl p-6 transition-all active:scale-95 disabled:opacity-50"
      >
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.5)]">
            <i className="fa-solid fa-dice text-2xl text-white"></i>
          </div>
          <span className="font-orbitron text-blue-400 font-bold tracking-wider">AZUL</span>
        </div>
      </button>

      <button
        disabled={isAnalyzing}
        onClick={() => onAddResult(ResultColor.RED)}
        className="group relative bg-red-900/40 hover:bg-red-800/60 border-2 border-red-500/50 rounded-2xl p-6 transition-all active:scale-95 disabled:opacity-50"
      >
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.5)]">
            <i className="fa-solid fa-dice text-2xl text-white"></i>
          </div>
          <span className="font-orbitron text-red-400 font-bold tracking-wider">VERMELHO</span>
        </div>
      </button>
    </div>
  );
};

export default ControlPanel;
