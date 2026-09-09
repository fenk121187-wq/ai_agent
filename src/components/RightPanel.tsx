import React from 'react';
import { GameState } from '../types';

interface RightPanelProps {
  gameState: GameState;
}

export const RightPanel: React.FC<RightPanelProps> = ({ gameState }) => {
  return (
    <div className="absolute top-32 right-4 w-64 flex flex-col space-y-4 z-50 pointer-events-none font-mono text-sm">

      {/* Civilian Heatmap Toggle Info */}
      <div className="bg-zinc-900/80 border border-zinc-800 p-3 rounded backdrop-blur text-xs flex justify-between items-center">
        <span className="text-zinc-400 uppercase">Civilian Bio-Signatures</span>
        <span className="text-green-500 font-bold">{gameState.civilians.filter(c => !c.isDead).length} DETECTED</span>
      </div>

      {/* Battlefeed */}
      <div className="bg-zinc-900/80 border border-zinc-800 p-3 rounded backdrop-blur h-64 overflow-hidden flex flex-col justify-end">
        <div className="flex flex-col space-y-1">
          {gameState.battlefeed.slice(-8).map((msg, idx) => (
            <div key={idx} className="text-xs text-zinc-400">
              <span className="text-zinc-600 mr-2">&gt;</span>{msg}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
