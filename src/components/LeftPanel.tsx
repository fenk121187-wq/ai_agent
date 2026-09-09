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
      <div className="tech-panel bg-black/60 border-helldiver-orange/30 shadow-[0_0_20px_rgba(0,0,0,0.8)] backdrop-blur-md">
        <div className="tech-panel-inner relative">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-helldiver-orange/50 via-helldiver-gold/30 to-transparent"></div>
            <h3 className="text-helldiver-gold font-bold uppercase mb-4 tracking-widest text-sm border-b border-helldiver-orange/20 pb-1 flex justify-between items-center">
              <span>Stratagem Feed</span>
              <span className="text-[9px] text-zinc-600 font-mono">SYS-LNK</span>
            </h3>
            <div className="space-y-3">
            {gameState.stratagems.map(strat => {
                const now = Date.now();
                const isReady = now >= strat.readyAt;
                const cooldownRemaining = Math.max(0, strat.readyAt - now);

                return (
                <div key={strat.id} className="flex items-center space-x-3 p-1.5 bg-zinc-900/30 rounded border border-zinc-800/50 hover:bg-zinc-800/50 transition-colors">
                    <div className={`w-11 h-11 border ${isReady ? 'border-helldiver-gold/50 shadow-[0_0_10px_rgba(255,193,7,0.2)]' : 'border-zinc-700'} flex items-center justify-center bg-black/70`}>
                        <StratagemIcon type={strat.type} />
                    </div>
                    <div className="flex flex-col flex-1">
                        <span className={`text-[11px] font-bold tracking-widest uppercase leading-tight ${isReady ? 'text-zinc-200 drop-shadow-[0_0_2px_rgba(255,255,255,0.5)]' : 'text-zinc-500'}`}>
                            {strat.name.replace(' ', '\n')}
                        </span>
                        <div className="flex items-center mt-0.5">
                            <span className={`w-1.5 h-1.5 mr-1.5 rounded-full ${isReady ? 'bg-helldiver-gold animate-pulse shadow-[0_0_5px_#FFC107]' : 'bg-helldiver-orange/50'}`}></span>
                            <span className={`text-[10px] tracking-widest font-bold ${isReady ? 'text-helldiver-gold' : 'text-helldiver-orange'}`}>
                                {isReady ? 'READY' : `COOLDOWN 00:${Math.ceil(cooldownRemaining/1000).toString().padStart(2, '0')}`}
                            </span>
                        </div>
                    </div>
                </div>
                );
            })}
            </div>
        </div>
      </div>

      {/* Unit Status */}
      <div className="tech-panel bg-black/60 border-helldiver-orange/30 shadow-[0_0_20px_rgba(0,0,0,0.8)] backdrop-blur-md">
        <div className="tech-panel-inner relative">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-helldiver-blue/50 via-helldiver-cyan/30 to-transparent"></div>
            <h3 className="text-helldiver-blue font-bold uppercase mb-4 tracking-widest text-sm border-b border-helldiver-blue/20 pb-1 flex justify-between items-center">
              <span>Unit Status</span>
              <span className="text-[9px] text-zinc-600 font-mono">BIO-MON</span>
            </h3>
            <div className="space-y-2">
            {gameState.helldivers.map(hd => (
                <div key={hd.id} className="flex items-center p-2 border border-helldiver-blue/20 bg-zinc-900/40 rounded shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]">
                    <div className="relative mr-3 flex items-center justify-center">
                        <Hexagon size={28} className={`${hd.isDead ? 'text-red-500 fill-red-500/10' : 'text-helldiver-cyan fill-helldiver-blue/20 drop-shadow-[0_0_5px_rgba(0,240,255,0.5)]'}`} />
                        <span className={`absolute text-[9px] font-black ${hd.isDead ? 'text-red-500' : 'text-white'}`}>
                            {hd.isDead ? 'X' : ''}
                        </span>
                    </div>
                    <div className="flex flex-col flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className={`text-[12px] font-black tracking-widest uppercase ${hd.isDead ? 'text-red-500/80 line-through' : 'text-zinc-200'}`}>
                              {hd.name}
                          </span>
                          {!hd.isDead && (
                            <span className="text-[8px] bg-helldiver-blue/20 text-helldiver-cyan px-1 rounded border border-helldiver-blue/30 font-mono">VTL-OK</span>
                          )}
                        </div>

                        {!hd.isDead && (
                            <div className="flex justify-between items-center text-[10px] text-zinc-400 font-mono">
                                <div className="flex items-center space-x-1">
                                    <span className="text-helldiver-cyan">HP</span>
                                    <span>{Math.round(hd.health)}%</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                    <span className="text-helldiver-orange">AMMO</span>
                                    <span>{Math.floor(hd.ammo / 25)}/4</span>
                                </div>
                            </div>
                        )}
                        {hd.isDead && (
                            <span className="text-[10px] text-red-500 font-mono animate-pulse font-bold tracking-widest">CRITICAL - KIA</span>
                        )}

                        {/* Health Bar (Decorative but responsive to health) */}
                        {!hd.isDead && (
                          <div className="w-full h-1 bg-black mt-1.5 border border-zinc-800">
                             <div className="h-full bg-helldiver-cyan shadow-[0_0_5px_#00F0FF]" style={{ width: `${hd.health}%` }}></div>
                          </div>
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
