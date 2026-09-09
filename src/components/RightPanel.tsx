import React from 'react';
import { GameState } from '../types';
import { ShieldAlert } from 'lucide-react';

interface RightPanelProps {
  gameState: GameState;
}

export const RightPanel: React.FC<RightPanelProps> = ({ gameState }) => {
  return (
    <div className="absolute top-36 right-6 w-72 flex flex-col space-y-4 z-50 pointer-events-none font-rajdhani">

      {/* Civilian Heatmap Toggle Info */}
      <div className="glass-panel p-3 rounded-md border-r-4 border-r-helldiver-cyan/50 flex justify-between items-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent to-helldiver-cyan/5"></div>
        <span className="text-zinc-400 uppercase text-xs tracking-widest font-bold z-10">Civilian Bio-Signatures</span>
        <div className="flex items-center space-x-2 z-10">
            <span className="text-white font-mono font-bold">{gameState.civilians.filter(c => !c.isDead).length}</span>
            <span className="text-[10px] bg-helldiver-cyan/20 text-helldiver-cyan px-1 rounded">DETECTED</span>
        </div>
      </div>

      {/* Battlefeed */}
      <div className="glass-panel p-0 rounded-md border border-white/5 h-72 flex flex-col relative overflow-hidden">
        {/* Header */}
        <div className="bg-black/60 px-3 py-2 border-b border-white/5 flex items-center space-x-2">
            <ShieldAlert size={14} className="text-helldiver-orange animate-pulse" />
            <h3 className="text-xs text-zinc-500 uppercase tracking-widest font-bold">Live Battlefeed</h3>
        </div>

        {/* Feed Content */}
        <div className="p-3 flex flex-col justify-end flex-1 overflow-hidden">
            <div className="flex flex-col space-y-1.5 font-mono text-[11px]">
            {gameState.battlefeed.slice(-8).map((msg, idx) => {
                const isWarning = msg.includes('WARNING') || msg.includes('casualty');
                const isUpgrade = msg.includes('authorized');

                let textColor = 'text-zinc-400';
                if (isWarning) textColor = 'text-red-400 drop-shadow-[0_0_2px_#ff0000]';
                if (isUpgrade) textColor = 'text-helldiver-cyan drop-shadow-[0_0_2px_#00F0FF]';

                return (
                <div key={idx} className={`${textColor} animate-[slideIn_0.2s_ease-out]`}>
                    <span className="text-zinc-600 mr-2 opacity-50">&gt;</span>
                    {msg}
                </div>
                );
            })}
            </div>
        </div>

        {/* Scanner line overlay */}
        <div className="absolute top-0 left-0 w-full h-[2px] bg-helldiver-cyan/30 shadow-[0_0_5px_#00F0FF] animate-[scan_3s_linear_infinite] pointer-events-none"></div>
      </div>

    </div>
  );
};
