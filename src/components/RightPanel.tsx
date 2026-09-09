import React from 'react';
import { GameState } from '../types';

interface RightPanelProps {
  gameState: GameState;
}

export const RightPanel: React.FC<RightPanelProps> = ({ gameState }) => {
  return (
    <div className="absolute bottom-10 right-6 w-72 flex flex-col z-50 pointer-events-none font-rajdhani">

      {/* Battlefeed strictly styling as seen in reference */}
      <div className="tech-panel h-64 bg-black/60 border-helldiver-orange/30 shadow-[0_0_20px_rgba(0,0,0,0.8)] backdrop-blur-md">
        <div className="tech-panel-inner flex flex-col relative">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-helldiver-gold/30 to-transparent"></div>
            {/* Header */}
            <h3 className="text-helldiver-gold font-bold uppercase tracking-widest text-sm mb-4 flex justify-between items-center border-b border-helldiver-orange/20 pb-1">
              <span>Battlefeed</span>
              <span className="text-[9px] text-zinc-600 font-mono">COM-LOG</span>
            </h3>

            {/* Feed Content */}
            <div className="flex flex-col justify-end flex-1 overflow-hidden pb-2 pr-2">
                <div className="flex flex-col space-y-2">
                {gameState.battlefeed.slice(-5).map((msg, idx) => {
                    const isWarning = msg.includes('WARNING') || msg.includes('casualty') || msg.includes('ENGAGED');
                    const isEvac = msg.includes('evacuated');
                    const isSystem = msg.includes('[SYS]');

                    let textColor = 'text-zinc-300';
                    let bgOverlay = '';
                    let Icon = null;

                    if (isWarning) {
                        textColor = 'text-red-400 drop-shadow-[0_0_2px_rgba(239,68,68,0.8)]';
                        bgOverlay = 'bg-red-500/10 border-l-2 border-red-500 pl-2';
                        Icon = <span className="text-red-500 mt-0.5 block text-[10px] animate-pulse">⚠ CRITICAL EVENT</span>;
                    } else if (isEvac) {
                        textColor = 'text-helldiver-gold drop-shadow-[0_0_2px_rgba(255,193,7,0.8)]';
                        bgOverlay = 'bg-helldiver-gold/10 border-l-2 border-helldiver-gold pl-2';
                        Icon = <span className="text-helldiver-gold text-[10px] mt-0.5 block">+ EVACUATION SECURED</span>;
                    } else if (isSystem) {
                        textColor = 'text-helldiver-cyan drop-shadow-[0_0_2px_rgba(0,240,255,0.8)]';
                        bgOverlay = 'bg-helldiver-cyan/5 border-l-2 border-helldiver-cyan pl-2';
                    }

                    // Pseudo-timestamp logic (could be made real)
                    const d = new Date();
                    const timeString = `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}:${(d.getSeconds() - (5 - idx)).toString().padStart(2,'0')}`;

                    return (
                    <div key={idx} className={`flex items-start text-[11px] font-bold uppercase tracking-wider animate-[slideIn_0.2s_ease-out] py-1 ${bgOverlay}`}>
                        <span className="text-zinc-600 font-mono mr-3 shrink-0 mt-0.5 text-[9px]">{timeString}</span>
                        <div className="flex flex-col">
                            <span className={`${textColor} leading-tight`}>{msg}</span>
                            {Icon}
                        </div>
                    </div>
                    );
                })}
                </div>
            </div>

        </div>
      </div>

    </div>
  );
};
