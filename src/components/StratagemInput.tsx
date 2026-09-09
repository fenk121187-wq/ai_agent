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
      case 'pending': return 'text-helldiver-orange/40 border-helldiver-orange/30 bg-black/60 shadow-[inset_0_0_5px_rgba(255,153,0,0.1)]';
      case 'success': return 'text-helldiver-orange border-helldiver-orange bg-helldiver-orange/20 drop-shadow-[0_0_10px_rgba(255,153,0,1)] shadow-[inset_0_0_15px_rgba(255,153,0,0.4)] scale-105';
      case 'fail': return 'text-red-500 border-red-500 bg-red-500/20 shadow-[0_0_20px_rgba(255,0,0,0.8)] animate-pulse';
    }
  };

  return (
    <div className={`w-14 h-16 flex items-center justify-center border-[3px] ${getColor()} transition-all duration-100 rounded-sm relative overflow-hidden`}>
      {state === 'success' && <div className="absolute inset-0 bg-helldiver-orange/20 animate-ping opacity-20"></div>}
      <svg className={`w-10 h-10 ${getRotation()} ${state === 'success' ? 'drop-shadow-[0_0_5px_#FF9900]' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
        <path strokeLinecap="square" strokeLinejoin="miter" d="M5 10l7-7m0 0l7 7m-7-7v18" />
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

      <div className="tech-panel bg-black/80 border-helldiver-orange/50 shadow-[0_0_30px_rgba(255,94,0,0.2)] backdrop-blur-lg">
        <div className="tech-panel-inner p-5 pb-4 flex flex-col relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-helldiver-orange to-transparent opacity-80"></div>

            {/* Header */}
            <div className="flex justify-between items-center mb-4 border-b border-helldiver-orange/20 pb-2">
                <div className="flex flex-col">
                    <div className="flex items-center space-x-2">
                        <span className="w-2 h-2 bg-helldiver-orange animate-pulse"></span>
                        <span className="text-helldiver-orange font-bold uppercase tracking-widest text-sm drop-shadow-[0_0_5px_rgba(255,153,0,0.8)]">STRATAGEM INPUT</span>
                    </div>
                    <span className="text-zinc-500 uppercase tracking-widest text-[9px] font-mono mt-0.5">AWAITING TACTICAL SEQUENCE</span>
                </div>
                <span className="text-helldiver-orange uppercase tracking-widest text-[10px] font-bold border border-helldiver-orange/30 px-2 py-0.5 rounded bg-helldiver-orange/10">TIMING WINDOW</span>
            </div>

            <div className="flex items-center justify-between space-x-8">

                {/* Arrow Sequence */}
                <div className={`flex space-x-2.5 transition-colors duration-150 ${failFlash ? 'drop-shadow-[0_0_15px_rgba(255,0,0,1)]' : ''}`}>
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
                <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
                    <svg className="absolute w-full h-full transform -rotate-90 drop-shadow-[0_0_8px_rgba(255,153,0,0.4)]">
                        {/* Background ring */}
                        <circle cx="40" cy="40" r="26" className="stroke-zinc-800" strokeWidth="6" fill="none" />
                        {/* Progress ring */}
                        <circle
                            cx="40" cy="40" r="26"
                            className={`${activeCode.length > 0 && !failFlash ? 'stroke-helldiver-orange drop-shadow-[0_0_8px_#FF9900]' : 'stroke-helldiver-orange/30'}`}
                            strokeWidth="6" fill="none"
                            strokeDasharray={circumference * 1.3} // Adjusted for larger radius (26/20)
                            strokeDashoffset={activeCode.length > 0 ? (circumference * 1.3) - (timeRemaining / 100) * (circumference * 1.3) : 0}
                            strokeLinecap="square"
                        />
                    </svg>
                    <div className="flex flex-col items-center justify-center absolute">
                        <span className={`font-mono font-black text-2xl leading-none ${failFlash ? 'text-red-500' : 'text-helldiver-orange drop-shadow-[0_0_5px_rgba(255,153,0,0.8)]'}`}>
                            {failFlash ? 'ERR' : `${successPercentage}%`}
                        </span>
                    </div>
                </div>

            </div>

            {/* Input Progress Bar */}
            <div className="flex items-center mt-5 space-x-3 w-full">
                <span className="text-helldiver-orange text-[10px] uppercase font-bold tracking-widest flex-shrink-0">SYS PROGRESS</span>
                <div className="flex-1 h-2.5 border border-helldiver-orange/40 bg-black/80 p-[1px] relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9InRyYW5zcGFyZW50Ii8+PHBhdGggZD0iTTAgMEg0VjRIMEoiIGZpbGw9InJnYmEoMjU1LDE1MywwLDAuMSkiLz48L3N2Zz4=')] opacity-50 z-10 pointer-events-none"></div>
                    <div
                        className={`h-full bg-gradient-to-r from-helldiver-orange to-helldiver-gold shadow-[0_0_8px_rgba(255,153,0,0.8)] transition-all duration-100 ${failFlash ? 'bg-red-500 from-red-500 to-red-600 shadow-[0_0_8px_rgba(255,0,0,0.8)]' : ''}`}
                        style={{ width: matchCode ? `${(activeCode.length / matchCode.length) * 100}%` : '80%' }}
                    ></div>
                </div>
                <span className="text-zinc-400 font-mono text-sm w-8 text-right flex-shrink-0">
                    {matchCode ? `${activeCode.length}/${matchCode.length}` : '4/6'}
                </span>
            </div>

        </div>
      </div>

    </div>
  );
};
