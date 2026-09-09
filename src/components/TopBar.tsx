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
        <div className="tech-panel w-72 shrink-0 bg-black/60 border-helldiver-orange/30 shadow-[0_0_20px_rgba(0,0,0,0.8)] backdrop-blur-md">
            <div className="tech-panel-inner relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-helldiver-orange/50 to-transparent"></div>
                <h3 className="text-helldiver-gold font-bold uppercase mb-3 tracking-widest text-sm border-b border-helldiver-orange/20 pb-1 w-full flex items-center justify-between">
                    <span>Mission Objectives</span>
                    <span className="text-[9px] text-zinc-500 font-mono tracking-tighter">OBJ-COM</span>
                </h3>
                <div className="space-y-2 w-full">
                    {gameState.objectives.map((obj, idx) => {
                        let colorClass = "text-zinc-500";
                        let progressText = `[ ${obj.progress} / ${obj.max} ]`;
                        let glowClass = "";
                        if (obj.progress >= obj.max) {
                            colorClass = "text-green-500 drop-shadow-[0_0_5px_rgba(34,197,94,0.5)]";
                            progressText = "[ SECURED ]";
                        } else if (idx === 0) {
                            colorClass = "text-red-500"; // Critical objective
                            glowClass = "drop-shadow-[0_0_3px_rgba(239,68,68,0.5)]";
                        }

                        return (
                            <div key={obj.id} className="flex items-center text-[11px] tracking-wider uppercase font-bold bg-zinc-900/40 p-1.5 rounded-sm border border-zinc-800/50">
                                <span className={`mr-2 text-[10px] ${idx === 0 && obj.progress < obj.max ? 'text-red-500 animate-pulse' : 'text-zinc-500'}`}>■</span>
                                <span className={`text-zinc-300 flex-1 ${glowClass}`}>{obj.name}</span>
                                <span className={`${colorClass} font-mono ml-2`}>{progressText}</span>
                            </div>
                        );
                    })}
                    <div className="flex items-center text-[11px] tracking-wider uppercase font-bold bg-zinc-900/40 p-1.5 rounded-sm border border-zinc-800/50">
                        <span className="text-green-500 mr-2 text-[10px] animate-pulse">■</span>
                        <span className="text-zinc-300 flex-1">Hold Extraction Zone</span>
                        <span className="text-green-500 font-mono drop-shadow-[0_0_5px_rgba(34,197,94,0.5)] ml-2">[ ACTIVE ]</span>
                    </div>
                </div>
            </div>
        </div>

        {/* Panel 2: Sacrifice Score */}
        <div className="tech-panel w-80 shrink-0 flex flex-col items-center justify-center text-center mx-4 bg-black/60 border-helldiver-orange/30 shadow-[0_0_20px_rgba(0,0,0,0.8)] backdrop-blur-md relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-helldiver-orange/50 to-transparent"></div>
            <div className="absolute -inset-1 bg-gradient-to-b from-helldiver-orange/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="tech-panel-inner flex flex-col items-center justify-center pt-2 relative z-10">
                <div className="flex items-center justify-center space-x-2 mb-1">
                    <span className="h-[1px] w-4 bg-zinc-700"></span>
                    <span className="text-zinc-400 uppercase tracking-widest text-xs font-bold">Sacrifice Score</span>
                    <span className="h-[1px] w-4 bg-zinc-700"></span>
                </div>
                <span className="text-6xl font-black text-helldiver-orange font-mono drop-shadow-[0_0_15px_rgba(255,153,0,0.6)] leading-none mb-1 tracking-tighter">
                    {gameState.sacrificeScore.toLocaleString()}
                </span>
                <div className="flex flex-col items-center mt-1">
                    <span className="text-helldiver-orange/90 uppercase tracking-widest text-[11px] font-bold bg-helldiver-orange/10 px-2 py-0.5 rounded border border-helldiver-orange/20">
                        +1,250
                    </span>
                    <span className="text-zinc-500 uppercase tracking-widest text-[9px] font-bold mt-1">Enemy Casualties</span>
                </div>
            </div>
        </div>

        {/* Panel 3: Mission Rating */}
        <div className="tech-panel w-72 shrink-0 flex flex-col items-center justify-center text-center bg-black/60 border-helldiver-orange/30 shadow-[0_0_20px_rgba(0,0,0,0.8)] backdrop-blur-md relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-helldiver-gold/50 to-transparent"></div>
            <div className="tech-panel-inner flex flex-col items-center justify-center relative z-10">
                <div className="flex items-center justify-center space-x-2 mb-2">
                    <span className="h-[1px] w-4 bg-zinc-700"></span>
                    <span className="text-zinc-400 uppercase tracking-widest text-xs font-bold">Mission Rating</span>
                    <span className="h-[1px] w-4 bg-zinc-700"></span>
                </div>
                <span className="text-5xl font-black text-helldiver-gold font-mono drop-shadow-[0_0_15px_rgba(255,193,7,0.6)] leading-none mb-3 tracking-tight">
                    {gameState.rating}
                </span>
                <div className="flex space-x-1.5 bg-black/40 p-1.5 rounded border border-zinc-800">
                    {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                        key={i}
                        size={20}
                        fill={i < gameState.stars ? "#FFC107" : "transparent"}
                        strokeWidth={i < gameState.stars ? 0 : 1}
                        className={i < gameState.stars ? "text-helldiver-gold drop-shadow-[0_0_8px_#FFC107]" : "text-zinc-700"}
                    />
                    ))}
                </div>
            </div>
        </div>

      </div>

    </div>
  );
};
