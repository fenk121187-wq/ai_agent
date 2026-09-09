import React from 'react';
import { GameState } from '../types';
import { Star } from 'lucide-react';

interface TopBarProps {
  gameState: GameState;
}

export const TopBar: React.FC<TopBarProps> = ({ gameState }) => {
  return (
    <div className="absolute top-4 left-0 right-0 px-6 flex flex-col z-50 pointer-events-none text-sm text-zinc-300 font-rajdhani">

      {/* Topmost Text Header Line (Next to HELLDIVERS TACTICAL COMMAND from App.tsx) */}
      <div className="flex justify-between items-start ml-72 pl-8">
        <div className="flex flex-col">
            <div className="flex items-center space-x-2">
                <span className="text-helldiver-orange font-bold uppercase tracking-widest text-sm">OPERATION: {gameState.operationName}</span>
            </div>
            <span className="uppercase text-zinc-400 text-xs tracking-widest">{gameState.sector}</span>
        </div>

        <div className="flex items-center space-x-4 mt-2">
            <span className="text-zinc-400 font-bold uppercase tracking-widest text-xs">TIME REMAINING</span>
            <span className="text-zinc-300 font-mono tracking-widest text-sm drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">
                {Math.floor(gameState.missionTimeLeft / 60).toString().padStart(2, '0')}:
                {Math.floor(gameState.missionTimeLeft % 60).toString().padStart(2, '0')}
            </span>
        </div>
      </div>

      {/* The 3 Main Top Panels */}
      <div className="flex justify-between items-stretch mt-6 w-full">

        {/* Panel 1: Mission Objectives */}
        <div className="tech-panel w-72 shrink-0">
            <div className="tech-panel-inner">
                <h3 className="text-helldiver-gold font-bold uppercase mb-3 tracking-widest text-sm border-b border-helldiver-orange/20 pb-1 w-full">Mission Objectives</h3>
                <div className="space-y-1.5 w-full">
                    {gameState.objectives.map((obj, idx) => {
                        let colorClass = "text-zinc-500";
                        let progressText = `[ ${obj.progress} / ${obj.max} ]`;
                        if (obj.progress >= obj.max) {
                            colorClass = "text-green-500 drop-shadow-[0_0_5px_rgba(34,197,94,0.5)]";
                            progressText = "[ SECURED ]";
                        } else if (idx === 0) {
                            colorClass = "text-red-500"; // Critical objective
                        }

                        return (
                            <div key={obj.id} className="flex items-center text-xs tracking-wider uppercase font-bold">
                                <span className="text-zinc-500 mr-2 text-[10px]">■</span>
                                <span className="text-zinc-300 flex-1">{obj.name}</span>
                                <span className={`${colorClass} font-mono`}>{progressText}</span>
                            </div>
                        );
                    })}
                    <div className="flex items-center text-xs tracking-wider uppercase font-bold">
                        <span className="text-zinc-500 mr-2 text-[10px]">■</span>
                        <span className="text-zinc-300 flex-1">Hold Extraction Zone</span>
                        <span className="text-green-500 font-mono drop-shadow-[0_0_5px_rgba(34,197,94,0.5)]">[ ACTIVE ]</span>
                    </div>
                </div>
            </div>
        </div>

        {/* Panel 2: Sacrifice Score */}
        <div className="tech-panel w-80 shrink-0 flex flex-col items-center justify-center text-center mx-4">
            <div className="tech-panel-inner flex flex-col items-center justify-center pt-2">
                <span className="text-zinc-400 uppercase tracking-widest text-xs font-bold mb-1">Sacrifice Score</span>
                <span className="text-5xl font-black text-helldiver-orange font-mono drop-shadow-[0_0_15px_rgba(255,153,0,0.4)] leading-none mb-1">
                    {gameState.sacrificeScore.toLocaleString()}
                </span>
                <span className="text-helldiver-orange/80 uppercase tracking-widest text-[10px] font-bold">
                    +1,250 <br/><span className="text-zinc-400">Enemy Casualties</span>
                </span>
            </div>
        </div>

        {/* Panel 3: Mission Rating */}
        <div className="tech-panel w-72 shrink-0 flex flex-col items-center justify-center text-center">
            <div className="tech-panel-inner flex flex-col items-center justify-center">
                <span className="text-zinc-400 uppercase tracking-widest text-xs font-bold mb-2">Mission Rating</span>
                <span className="text-5xl font-black text-helldiver-gold font-mono drop-shadow-[0_0_15px_rgba(255,193,7,0.4)] leading-none mb-3">
                    {gameState.rating}
                </span>
                <div className="flex space-x-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                        key={i}
                        size={18}
                        fill={i < gameState.stars ? "#FFC107" : "transparent"}
                        className={i < gameState.stars ? "text-helldiver-gold drop-shadow-[0_0_5px_#FFC107]" : "text-zinc-800"}
                    />
                    ))}
                </div>
            </div>
        </div>

      </div>

    </div>
  );
};
