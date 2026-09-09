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
    <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start z-50 pointer-events-none text-sm font-mono text-zinc-300">

      {/* Left side: Operation & Objectives */}
      <div className="flex flex-col space-y-2">
        <div className="flex items-center space-x-2">
          <span className="text-helldiver-orange font-bold uppercase">{gameState.operationName}</span>
          <span className="text-zinc-500">|</span>
          <span className="uppercase">{gameState.sector}</span>
        </div>

        <div className="bg-zinc-900/80 border border-zinc-800 p-2 rounded w-64 backdrop-blur">
          <h3 className="text-xs text-zinc-500 uppercase mb-2">Primary Objectives</h3>
          {gameState.objectives.map(obj => (
            <div key={obj.id} className="flex justify-between items-center mb-1">
              <span>{obj.name}</span>
              <span className="text-helldiver-gold">{obj.progress}/{obj.max}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Center: Mission Timer */}
      <div className="flex flex-col items-center">
        <span className="text-xs text-zinc-500 uppercase tracking-widest">Mission Time</span>
        <span className="text-3xl font-bold text-white drop-shadow-md">
          {formatTime(gameState.missionTimeLeft)}
        </span>
      </div>

      {/* Right side: Rating & Sacrifice */}
      <div className="flex flex-col items-end space-y-2">
        <div className="flex items-center space-x-4 bg-zinc-900/80 border border-zinc-800 p-2 rounded backdrop-blur">
          <div className="flex flex-col items-end">
            <span className="text-xs text-zinc-500 uppercase">Current Rating</span>
            <div className="flex items-center space-x-1">
              <span className="text-xl font-bold text-helldiver-gold">{gameState.rating}</span>
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className={`text-sm ${i < gameState.stars ? 'text-helldiver-gold' : 'text-zinc-700'}`}>
                    ★
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="w-px h-8 bg-zinc-700"></div>
          <div className="flex flex-col items-start">
            <span className="text-xs text-red-500 uppercase font-bold">Sacrifice Value</span>
            <span className="text-xl font-bold text-red-400">{gameState.sacrificeScore.toLocaleString()}</span>
          </div>
        </div>
      </div>

    </div>
  );
};
