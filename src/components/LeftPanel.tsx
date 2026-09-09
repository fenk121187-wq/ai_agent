import React from 'react';
import { GameState } from '../types';
import { Crosshair } from 'lucide-react';

interface LeftPanelProps {
  gameState: GameState;
}

export const LeftPanel: React.FC<LeftPanelProps> = ({ gameState }) => {
  return (
    <div className="absolute top-36 left-6 w-72 flex flex-col space-y-4 z-50 pointer-events-none font-rajdhani">

      {/* Unit Status */}
      <div className="glass-panel p-4 rounded-md border-l-4 border-l-helldiver-blue relative overflow-hidden">
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-l from-transparent to-helldiver-blue/5"></div>
        <h3 className="text-xs text-zinc-400 uppercase mb-4 tracking-widest font-bold z-10 relative">Squad Status</h3>
        <div className="space-y-4 z-10 relative">
          {gameState.helldivers.map(hd => (
            <div key={hd.id} className="flex flex-col">
              <div className="flex justify-between items-center mb-1.5">
                <span className={`font-bold tracking-wider ${hd.isDead ? 'text-zinc-600 line-through' : 'text-helldiver-cyan drop-shadow-[0_0_5px_#00F0FF]'}`}>
                  {hd.name}
                </span>
                {hd.isEngaged && !hd.isDead && (
                  <Crosshair size={14} className="text-helldiver-orange animate-pulse drop-shadow-[0_0_5px_#FF5E00]" />
                )}
              </div>
              {!hd.isDead && (
                <div className="flex space-x-2">
                  {/* Health bar */}
                  <div className="flex-1 h-1 bg-zinc-900 overflow-hidden relative">
                    <div
                      className={`absolute top-0 left-0 h-full transition-all duration-300 ${hd.health > 50 ? 'bg-helldiver-cyan shadow-[0_0_5px_#00F0FF]' : hd.health > 20 ? 'bg-helldiver-orange shadow-[0_0_5px_#FF5E00]' : 'bg-red-500 shadow-[0_0_5px_#ff0000]'}`}
                      style={{ width: `${hd.health}%` }}
                    />
                  </div>
                  {/* Ammo bar */}
                  <div className="w-1/3 h-1 bg-zinc-900 overflow-hidden relative">
                    <div
                      className="absolute top-0 left-0 h-full bg-helldiver-gold shadow-[0_0_5px_#FFC107] transition-all duration-300"
                      style={{ width: `${hd.ammo}%` }}
                    />
                  </div>
                </div>
              )}
              {hd.isDead && (
                <span className="text-xs text-red-500 uppercase font-mono bg-red-500/10 px-2 py-0.5 self-start border border-red-500/30">KIA</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Stratagem Feed */}
      <div className="glass-panel p-4 rounded-md border-l-4 border-l-helldiver-gold relative overflow-hidden">
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-l from-transparent to-helldiver-gold/5"></div>
        <h3 className="text-xs text-zinc-400 uppercase mb-4 tracking-widest font-bold z-10 relative">Support Ordnance</h3>
        <div className="space-y-3 z-10 relative">
          {gameState.stratagems.map(strat => {
             const now = Date.now();
             const isReady = now >= strat.readyAt;
             const cooldownRemaining = Math.max(0, strat.readyAt - now);
             const cooldownPercent = isReady ? 100 : 100 - (cooldownRemaining / strat.cooldown) * 100;

             return (
               <div key={strat.id} className="flex flex-col">
                 <div className="flex justify-between items-center text-xs mb-1.5 font-bold uppercase tracking-wide">
                   <span className={isReady ? 'text-white' : 'text-zinc-500'}>{strat.name}</span>
                   <span className={isReady ? 'text-helldiver-gold drop-shadow-[0_0_5px_#FFC107] font-mono' : 'text-zinc-600 font-mono'}>
                     {isReady ? 'READY' : `${Math.ceil(cooldownRemaining/1000)}S`}
                   </span>
                 </div>
                 {/* Cooldown progress bar */}
                 <div className="w-full h-1 bg-zinc-900 overflow-hidden relative">
                    <div
                      className={`absolute top-0 left-0 h-full transition-all duration-100 linear ${isReady ? 'bg-helldiver-gold shadow-[0_0_5px_#FFC107]' : 'bg-zinc-600'}`}
                      style={{ width: `${cooldownPercent}%` }}
                    />
                 </div>
               </div>
             );
          })}
        </div>
      </div>

    </div>
  );
};
