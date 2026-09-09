import React, { useEffect, useState, useRef } from 'react';
import { GameState, ArrowCode } from '../types';

interface StratagemInputProps {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
}

const ArrowIcon = ({ dir, state }: { dir: ArrowCode, state: 'pending' | 'success' | 'fail' }) => {
  const getRotation = () => {
    switch (dir) {
      case 'UP': return 'rotate-0';
      case 'RIGHT': return 'rotate-90';
      case 'DOWN': return 'rotate-180';
      case 'LEFT': return '-rotate-90';
    }
  };

  const getColor = () => {
    switch (state) {
      case 'pending': return 'text-zinc-600 border-zinc-800 bg-zinc-900/60';
      case 'success': return 'text-helldiver-cyan border-helldiver-cyan bg-helldiver-cyan/10 drop-shadow-[0_0_8px_rgba(0,240,255,0.8)] shadow-[inset_0_0_10px_rgba(0,240,255,0.2)]';
      case 'fail': return 'text-red-500 border-red-500 bg-red-500/10 shadow-[0_0_15px_rgba(255,0,0,0.6)]';
    }
  };

  return (
    <div className={`w-14 h-14 flex items-center justify-center border-2 backdrop-blur-sm ${getColor()} transition-all duration-150`}>
      <svg className={`w-8 h-8 ${getRotation()}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
    </div>
  );
};

export const StratagemInput: React.FC<StratagemInputProps> = ({ gameState, setGameState }) => {
  const [activeCode, setActiveCode] = useState<ArrowCode[]>([]);
  const [matchCode, setMatchCode] = useState<ArrowCode[] | null>(null);
  const [failFlash, setFailFlash] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(100);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (activeCode.length > 0 && !gameState.targetingMode) {
      if (timerRef.current) clearInterval(timerRef.current);

      timerRef.current = window.setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 2) {
            setFailFlash(true);
            setTimeout(() => setFailFlash(false), 300);
            setActiveCode([]);
            setMatchCode(null);
            return 100;
          }
          return prev - 2.5;
        });
      }, 50);
    } else {
       if (timerRef.current) clearInterval(timerRef.current);
       setTimeRemaining(100);
    }

    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [activeCode.length, gameState.targetingMode]);


  useEffect(() => {
    if (gameState.targetingMode) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      let keyDir: ArrowCode | null = null;
      if (e.key === 'ArrowUp' || e.key === 'w') keyDir = 'UP';
      if (e.key === 'ArrowDown' || e.key === 's') keyDir = 'DOWN';
      if (e.key === 'ArrowLeft' || e.key === 'a') keyDir = 'LEFT';
      if (e.key === 'ArrowRight' || e.key === 'd') keyDir = 'RIGHT';

      if (!keyDir) return;

      setActiveCode(prev => {
        const next = [...prev, keyDir as ArrowCode];

        let isPrefix = false;
        let exactMatch = null;

        for (const strat of gameState.stratagems) {
           if (Date.now() < strat.readyAt) continue;

           let matches = true;
           for (let i = 0; i < next.length; i++) {
               if (strat.code[i] !== next[i]) {
                   matches = false;
                   break;
               }
           }
           if (matches) {
               isPrefix = true;
               setMatchCode(strat.code);
               if (next.length === strat.code.length) {
                   exactMatch = strat;
               }
               break;
           }
        }

        if (exactMatch) {
            setGameState(g => ({
                ...g,
                targetingMode: true,
                activeStratagemId: exactMatch.id,
                battlefeed: [...g.battlefeed, `[SYS] ${exactMatch.name} uplink established. Awaiting coordinates.`]
            }));
            setMatchCode(null);
            return [];
        } else if (!isPrefix) {
            setFailFlash(true);
            setTimeout(() => setFailFlash(false), 300);
            setMatchCode(null);
            return [];
        }

        setTimeRemaining(100);
        return next;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState.targetingMode, gameState.stratagems, setGameState]);


  if (gameState.targetingMode) return null;

  const successPercentage = matchCode
    ? Math.round((activeCode.length / matchCode.length) * 100)
    : 0;

  return (
    <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none z-50 font-rajdhani">

      {/* Target Code Preview & Stats */}
      {matchCode && (
        <div className="w-full flex justify-between items-end mb-3 px-1">
            <span className="text-lg font-bold text-helldiver-cyan uppercase tracking-widest drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]">
              {gameState.stratagems.find(s => s.code === matchCode)?.name || 'UNKNOWN'}
            </span>
            <span className="text-sm text-helldiver-cyan font-mono tracking-widest bg-black/50 px-2 py-0.5 border border-helldiver-cyan/30">
              SEQ: {successPercentage}%
            </span>
        </div>
      )}

      {/* Input Bar Container */}
      <div className={`relative flex flex-col p-5 glass-panel rounded-lg transition-colors duration-150 ${failFlash ? 'border-red-500 shadow-[0_0_30px_rgba(255,0,0,0.5)]' : matchCode ? 'border-helldiver-cyan shadow-[0_0_20px_rgba(0,240,255,0.2)]' : 'border-white/10 shadow-2xl'}`}>

        {/* Tech decorative corners */}
        <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-white/30"></div>
        <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-white/30"></div>
        <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-white/30"></div>
        <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-white/30"></div>

        <div className="flex space-x-3">
            {(matchCode || ['UP','RIGHT','DOWN','LEFT'] as ArrowCode[]).map((dir, idx) => {
            if (!matchCode) {
                if (idx > 3) return null;
                return <div key={`idle-${idx}`} className="w-14 h-14 border-2 border-white/5 bg-black/40 backdrop-blur-sm" />;
            }
            const state = activeCode.length > idx ? 'success' : 'pending';
            return <ArrowIcon key={idx} dir={dir} state={state} />;
            })}
        </div>

        {/* Timing Window Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/80 overflow-hidden rounded-b-lg">
            {activeCode.length > 0 && !failFlash && (
                <div
                    className={`h-full transition-all duration-75 ease-linear ${timeRemaining > 50 ? 'bg-helldiver-cyan shadow-[0_0_10px_#00F0FF]' : timeRemaining > 20 ? 'bg-helldiver-orange shadow-[0_0_10px_#FF5E00]' : 'bg-red-500 shadow-[0_0_10px_#ff0000]'}`}
                    style={{ width: `${timeRemaining}%` }}
                />
            )}
        </div>
      </div>
    </div>
  );
};
