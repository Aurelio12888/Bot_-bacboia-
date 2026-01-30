
import React from 'react';
import { GameResult, ResultColor } from '../types';

interface ResultHistoryProps {
  history: GameResult[];
}

const ResultHistory: React.FC<ResultHistoryProps> = ({ history }) => {
  return (
    <div className="flex-1 bg-slate-900/40 border border-white/5 rounded-2xl p-6 flex flex-col gap-4">
      <div className="flex justify-between items-center border-b border-white/5 pb-2">
        <span className="text-[10px] font-orbitron text-slate-500 font-bold tracking-widest uppercase">Visual Cache</span>
        <span className="text-[10px] font-bold text-indigo-500">{history.length} DETECTADOS</span>
      </div>
      
      <div className="flex flex-wrap gap-3">
        {history.length === 0 ? (
          <div className="w-full py-8 text-center">
             <p className="text-slate-600 text-[10px] font-bold animate-pulse">AGUARDANDO DADOS DO WEBCRO...</p>
          </div>
        ) : (
          history.map((res) => (
            <div
              key={res.id}
              className={`w-10 h-10 rounded-xl flex items-center justify-center text-[12px] font-black shadow-xl transform transition-all hover:scale-110 ${
                res.color === ResultColor.BLUE
                  ? 'bg-gradient-to-br from-blue-600 to-blue-900 border border-blue-400/50 text-white shadow-blue-900/40'
                  : 'bg-gradient-to-br from-red-600 to-red-900 border border-red-400/50 text-white shadow-red-900/40'
              }`}
            >
              {res.color === ResultColor.BLUE ? 'A' : 'V'}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ResultHistory;
