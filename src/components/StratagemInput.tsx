import React, { useEffect, useState, useRef } from 'react';
import { GameState, ArrowCode } from '../types';

interface StratagemInputProps {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
}

const ArrowIcon = ({ dir, state }: { dir: ArrowCode, state: 'pending' | 'success' | 'fail' | 'idle' }) => {
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
      case 'idle': return 'text-zinc-500/30 border-zinc-500/20 bg-black/40';
      case 'pending': return 'text-helldiver-orange/40 border-helldiver-orange/30 bg-black/60';
      case 'success': return 'text-helldiver-orange border-helldiver-orange bg-helldiver-orange/10 drop-shadow-[0_0_8px_rgba(255,153,0,0.8)] shadow-[inset_0_0_10px_rgba(255,153,0,0.2)]';
      case 'fail': return 'text-red-500 border-red-500 bg-red-500/10 shadow-[0_0_15px_rgba(255,0,0,0.6)]';
    }
  };

  return (
    <div className={`w-14 h-16 flex items-center justify-center border-2 ${getColor()} transition-all duration-150 rounded-sm`}>
      <svg className={`w-10 h-10 ${getRotation()}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
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
    : 82; // Default decorative percentage

  const circumference = 2 * Math.PI * 20;
  const strokeDashoffset = circumference - (timeRemaining / 100) * circumference;

  return (
    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col z-50 pointer-events-none font-rajdhani">

      <div className="tech-panel">
        <div className="tech-panel-inner p-4 pb-3 flex flex-col">

            {/* Header */}
            <div className="flex justify-between items-center mb-3">
                <div className="flex flex-col">
                    <span className="text-helldiver-orange font-bold uppercase tracking-widest text-sm">STRATAGEM INPUT</span>
                    <span className="text-zinc-400 uppercase tracking-widest text-[10px]">ENTER DIRECTIONAL SEQUENCE</span>
                </div>
                <span className="text-helldiver-orange uppercase tracking-widest text-[10px] font-bold">TIMING</span>
            </div>

            <div className="flex items-center space-x-6">

                {/* Arrow Sequence */}
                <div className={`flex space-x-2 transition-colors duration-150 ${failFlash ? 'drop-shadow-[0_0_10px_rgba(255,0,0,0.8)]' : ''}`}>
                    {(matchCode || ['UP','RIGHT','DOWN','DOWN','LEFT','RIGHT'] as ArrowCode[]).map((dir, idx) => {
                        let state: 'idle' | 'pending' | 'success' | 'fail' = 'idle';
                        if (matchCode) {
                            if (failFlash) state = 'fail';
                            else state = activeCode.length > idx ? 'success' : 'pending';
                        }
                        return <ArrowIcon key={idx} dir={dir} state={state} />;
                    })}
                </div>

                {/* Timing Circle Ring */}
                <div className="relative w-16 h-16 flex items-center justify-center">
                    <svg className="absolute w-full h-full transform -rotate-90">
                        {/* Background ring */}
                        <circle cx="32" cy="32" r="20" className="stroke-zinc-800" strokeWidth="4" fill="none" />
                        {/* Progress ring */}
                        <circle
                            cx="32" cy="32" r="20"
                            className={`${activeCode.length > 0 && !failFlash ? 'stroke-helldiver-orange drop-shadow-[0_0_5px_#FF9900]' : 'stroke-helldiver-orange/30'}`}
                            strokeWidth="4" fill="none"
                            strokeDasharray={circumference}
                            strokeDashoffset={activeCode.length > 0 ? strokeDashoffset : 0}
                            strokeLinecap="round"
                        />
                    </svg>
                    <div className="flex flex-col items-center justify-center absolute">
                        <span className="text-helldiver-orange font-mono font-bold text-lg leading-none">{successPercentage}%</span>
                        <span className="text-zinc-400 text-[6px] uppercase tracking-widest leading-none mt-1">WINDOW OPEN</span>
                    </div>
                </div>

            </div>

            {/* Input Progress Bar */}
            <div className="flex items-center mt-4 space-x-3 w-full">
                <span className="text-helldiver-orange text-[10px] uppercase font-bold tracking-widest">INPUT PROGRESS</span>
                <div className="flex-1 h-3 border border-helldiver-orange/40 bg-black/60 p-[2px]">
                    <div
                        className="h-full bg-gradient-to-r from-helldiver-orange to-helldiver-gold shadow-[0_0_5px_rgba(255,153,0,0.5)] transition-all duration-100"
                        style={{ width: matchCode ? `${(activeCode.length / matchCode.length) * 100}%` : '80%' }}
                    ></div>
                </div>
                <span className="text-zinc-400 font-mono text-sm">
                    {matchCode ? `${activeCode.length} / ${matchCode.length}` : '4 / 6'}
                </span>
            </div>

        </div>
      </div>

    </div>
  );
};
