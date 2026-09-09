import React from 'react';
import { GameState } from '../types';

interface TopBarProps {
  gameState: GameState;
}

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

export const TopBar: React.FC<TopBarProps> = ({ gameState }) => {
  return (
    <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-50 pointer-events-none text-sm text-zinc-300">

      {/* Left side: Operation & Objectives */}
      <div className="flex flex-col space-y-3 w-72">
        <div className="flex items-center space-x-3 bg-black/60 backdrop-blur-md px-4 py-2 border-l-4 border-helldiver-cyan shadow-[0_0_15px_rgba(0,240,255,0.2)]">
          <span className="text-helldiver-cyan font-bold uppercase tracking-wider">{gameState.operationName}</span>
          <span className="text-zinc-600">//</span>
          <span className="uppercase text-zinc-400 text-xs tracking-widest">{gameState.sector}</span>
        </div>

        <div className="glass-panel p-4 rounded border-t-2 border-t-helldiver-orange/50 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-helldiver-orange to-transparent opacity-50"></div>
          <h3 className="text-xs text-helldiver-orange font-bold uppercase mb-3 tracking-widest flex items-center">
            <span className="w-2 h-2 bg-helldiver-orange rounded-full mr-2 animate-pulse"></span>
            Primary Objectives
          </h3>
          <div className="space-y-2">
            {gameState.objectives.map(obj => (
              <div key={obj.id} className="flex flex-col">
                <div className="flex justify-between items-center mb-1 text-xs">
                  <span className="uppercase text-zinc-300">{obj.name}</span>
                  <span className="text-helldiver-cyan font-mono">{obj.progress} / {obj.max}</span>
                </div>
                <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-helldiver-cyan shadow-[0_0_8px_#00F0FF]"
                        style={{ width: `${(obj.progress / obj.max) * 100}%` }}
                    />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Center: Mission Timer */}
      <div className="flex flex-col items-center glass-panel px-8 py-3 rounded-b-xl border-t-0 shadow-[0_10px_30px_rgba(0,0,0,0.8)] relative mt-[-24px]">
        <div className="absolute bottom-0 left-1/4 right-1/4 h-[2px] bg-helldiver-gold shadow-[0_0_10px_#FFC107]"></div>
        <span className="text-[10px] text-zinc-500 uppercase tracking-[0.3em] mb-1">Mission Time</span>
        <span className="text-4xl font-bold text-white font-mono drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] tracking-wider">
          {formatTime(gameState.missionTimeLeft)}
        </span>
      </div>

      {/* Right side: Rating & Sacrifice */}
      <div className="flex flex-col items-end space-y-3 w-72">
        <div className="glass-panel p-4 rounded border-r-4 border-r-helldiver-gold w-full flex flex-col relative overflow-hidden">
            <div className="absolute right-0 top-0 h-full w-12 bg-gradient-to-l from-helldiver-gold/10 to-transparent"></div>

            <div className="flex justify-between items-center mb-4">
                <span className="text-xs text-zinc-400 uppercase tracking-widest">Mission Rating</span>
                <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold text-helldiver-gold drop-shadow-[0_0_8px_rgba(255,193,7,0.6)] font-mono">{gameState.rating}</span>
                    <div className="flex space-x-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} className={`text-sm ${i < gameState.stars ? 'text-helldiver-gold drop-shadow-[0_0_5px_#FFC107]' : 'text-zinc-800'}`}>
                            ★
                        </span>
                        ))}
                    </div>
                </div>
            </div>

            <div className="w-full h-px bg-white/10 mb-3"></div>

            <div className="flex justify-between items-center">
                <span className="text-xs text-red-500/80 uppercase tracking-widest font-bold">Sacrifice Cost</span>
                <span className="text-xl font-bold text-red-500 font-mono drop-shadow-[0_0_8px_rgba(255,0,0,0.6)]">
                    {gameState.sacrificeScore.toLocaleString()}
                </span>
            </div>
        </div>
      </div>

    </div>
  );
};
