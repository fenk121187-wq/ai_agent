import React from 'react';
import { GameState } from '../types';
import { Hexagon, Plane, Crosshair, Package, Shield } from 'lucide-react';

interface LeftPanelProps {
  gameState: GameState;
}

const StratagemIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'BOMB': return <Plane size={24} className="text-helldiver-gold" />;
    case 'LASER': return <Crosshair size={24} className="text-helldiver-gold" />;
    case 'SHIELD': return <Shield size={24} className="text-helldiver-gold" />;
    case 'RESUPPLY': return <Package size={24} className="text-helldiver-gold" />;
    default: return <Plane size={24} className="text-helldiver-gold" />;
  }
};

export const LeftPanel: React.FC<LeftPanelProps> = ({ gameState }) => {
  return (
    <div className="w-full flex flex-col space-y-4 font-rajdhani">

      {/* Stratagem Feed */}
      <div className="tech-panel">
        <div className="tech-panel-inner">
            <h3 className="text-helldiver-gold font-bold uppercase mb-4 tracking-widest text-sm border-b border-helldiver-orange/20 pb-1">Stratagem Feed</h3>
            <div className="space-y-4">
            {gameState.stratagems.map(strat => {
                const now = Date.now();
                const isReady = now >= strat.readyAt;
                const cooldownRemaining = Math.max(0, strat.readyAt - now);

                return (
                <div key={strat.id} className="flex items-center space-x-4">
                    <div className="w-10 h-10 border border-helldiver-orange/30 flex items-center justify-center bg-black/50">
                        <StratagemIcon type={strat.type} />
                    </div>
                    <div className="flex flex-col">
                        <span className={`text-[11px] font-bold tracking-widest uppercase leading-tight ${isReady ? 'text-zinc-300' : 'text-zinc-500'}`}>
                            {strat.name.replace(' ', '\n')}
                        </span>
                        <span className={`text-[10px] tracking-widest font-bold mt-0.5 ${isReady ? 'text-helldiver-gold' : 'text-helldiver-orange'}`}>
                            {isReady ? 'READY' : `COOLDOWN\n00:${Math.ceil(cooldownRemaining/1000).toString().padStart(2, '0')}`}
                        </span>
                    </div>
                </div>
                );
            })}
            </div>
        </div>
      </div>

      {/* Unit Status */}
      <div className="tech-panel">
        <div className="tech-panel-inner">
            <h3 className="text-helldiver-gold font-bold uppercase mb-4 tracking-widest text-sm border-b border-helldiver-orange/20 pb-1">Unit Status</h3>
            <div className="space-y-3">
            {gameState.helldivers.map(hd => (
                <div key={hd.id} className="flex items-center p-2 border border-helldiver-blue/30 bg-black/40">
                    <div className="relative mr-3 flex items-center justify-center">
                        <Hexagon size={28} className="text-helldiver-blue fill-helldiver-blue/20" />
                        <span className="absolute text-[8px] font-bold text-white">
                            {hd.isDead ? 'X' : ''}
                        </span>
                    </div>
                    <div className="flex flex-col flex-1">
                        <span className={`text-[11px] font-bold tracking-widest uppercase ${hd.isDead ? 'text-zinc-600 line-through' : 'text-zinc-300'}`}>
                            {hd.name}
                        </span>
                        {!hd.isDead && (
                            <div className="flex justify-between items-center text-[10px] text-zinc-500 font-mono mt-1">
                                <span>{Math.round(hd.health)}%</span>
                                <span>AMMO {Math.floor(hd.ammo / 25)}/4</span>
                            </div>
                        )}
                        {hd.isDead && (
                            <span className="text-[10px] text-red-500 font-mono mt-1">KIA</span>
                        )}
                    </div>
                </div>
            ))}
            </div>
        </div>
      </div>

    </div>
  );
};
