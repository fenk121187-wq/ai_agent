import React from 'react';
import { GameState } from '../types';

interface RightPanelProps {
  gameState: GameState;
}

export const RightPanel: React.FC<RightPanelProps> = ({ gameState }) => {
  return (
    <div className="absolute bottom-10 right-6 w-72 flex flex-col z-50 pointer-events-none font-rajdhani">

      {/* Battlefeed strictly styling as seen in reference */}
      <div className="tech-panel h-64">
        <div className="tech-panel-inner flex flex-col">

            {/* Header */}
            <h3 className="text-helldiver-gold font-bold uppercase tracking-widest text-sm mb-4">Battlefeed</h3>

            {/* Feed Content */}
            <div className="flex flex-col justify-end flex-1 overflow-hidden pb-2 pr-2">
                <div className="flex flex-col space-y-3">
                {gameState.battlefeed.slice(-5).map((msg, idx) => {
                    const isWarning = msg.includes('WARNING') || msg.includes('casualty') || msg.includes('ENGAGED');
                    const isEvac = msg.includes('evacuated');

                    let textColor = 'text-zinc-300';
                    let Icon = null;

                    if (isWarning) {
                        textColor = 'text-zinc-300';
                        Icon = <span className="text-red-500 mt-1 block">⚠</span>;
                    }
                    if (isEvac) {
                        textColor = 'text-zinc-300';
                        Icon = <span className="text-helldiver-gold text-xs mt-1 block">+12 +</span>;
                    }

                    return (
                    <div key={idx} className="flex items-start text-xs font-bold uppercase tracking-wider animate-[slideIn_0.2s_ease-out]">
                        <span className="text-zinc-500 font-mono mr-3 shrink-0 mt-0.5">07:45:11</span>
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
