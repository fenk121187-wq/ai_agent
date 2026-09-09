import React from 'react';
import { GameState } from '../types';
import { Crosshair } from 'lucide-react';

interface LeftPanelProps {
  gameState: GameState;
}

export const LeftPanel: React.FC<LeftPanelProps> = ({ gameState }) => {
  return (
    <div className="absolute top-32 left-4 w-64 flex flex-col space-y-4 z-50 pointer-events-none font-mono text-sm">

      {/* Unit Status */}
      <div className="bg-zinc-900/80 border border-zinc-800 p-3 rounded backdrop-blur">
        <h3 className="text-xs text-zinc-500 uppercase mb-3 border-b border-zinc-800 pb-1">Squad Status</h3>
        <div className="space-y-3">
          {gameState.helldivers.map(hd => (
            <div key={hd.id} className="flex flex-col">
              <div className="flex justify-between items-center mb-1">
                <span className={`font-bold ${hd.isDead ? 'text-zinc-600 line-through' : 'text-helldiver-blue'}`}>
                  {hd.name}
                </span>
                {hd.isEngaged && !hd.isDead && (
                  <Crosshair size={14} className="text-red-500 animate-pulse" />
                )}
              </div>
              {!hd.isDead && (
                <div className="flex space-x-2">
                  {/* Health bar */}
                  <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${hd.health > 50 ? 'bg-green-500' : hd.health > 20 ? 'bg-helldiver-orange' : 'bg-red-500'}`}
                      style={{ width: `${hd.health}%` }}
                    />
                  </div>
                  {/* Ammo bar */}
                  <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-zinc-400"
                      style={{ width: `${hd.ammo}%` }}
                    />
                  </div>
                </div>
              )}
              {hd.isDead && (
                <span className="text-xs text-red-500 uppercase">KIA</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Stratagem Feed */}
      <div className="bg-zinc-900/80 border border-zinc-800 p-3 rounded backdrop-blur">
        <h3 className="text-xs text-zinc-500 uppercase mb-3 border-b border-zinc-800 pb-1">Available Support</h3>
        <div className="space-y-2">
          {gameState.stratagems.map(strat => {
             const now = Date.now();
             const isReady = now >= strat.readyAt;

             return (
               <div key={strat.id} className="flex flex-col">
                 <div className="flex justify-between text-xs mb-1">
                   <span className={isReady ? 'text-white' : 'text-zinc-500'}>{strat.name}</span>
                   <span className={isReady ? 'text-helldiver-gold' : 'text-zinc-600'}>
                     {isReady ? 'READY' : 'COOLDOWN'}
                   </span>
                 </div>
               </div>
             );
          })}
        </div>
      </div>

    </div>
  );
};
