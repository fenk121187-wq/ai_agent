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
      case 'pending': return 'text-zinc-600 border-zinc-700';
      case 'success': return 'text-helldiver-gold border-helldiver-gold drop-shadow-[0_0_8px_rgba(255,193,7,0.8)]';
      case 'fail': return 'text-red-500 border-red-500';
    }
  };

  return (
    <div className={`w-14 h-14 flex items-center justify-center border-2 bg-zinc-900/90 ${getColor()} transition-colors duration-75`}>
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

  // Timing window variables
  const [timeRemaining, setTimeRemaining] = useState(100);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (activeCode.length > 0 && !gameState.targetingMode) {
      // Start or reset interval on active typing
      if (timerRef.current) clearInterval(timerRef.current);

      timerRef.current = window.setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 2) {
            // Timeout fail
            setFailFlash(true);
            setTimeout(() => setFailFlash(false), 300);
            setActiveCode([]);
            setMatchCode(null);
            return 100;
          }
          return prev - 2; // Drains over ~2.5 seconds
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
            // Success! Trigger targeting mode
            // Bonus points for perfect/fast input could be added here
            setGameState(g => ({
                ...g,
                targetingMode: true,
                activeStratagemId: exactMatch.id,
                battlefeed: [...g.battlefeed, `${exactMatch.name} coordinates requested...`]
            }));
            setMatchCode(null);
            return [];
        } else if (!isPrefix) {
            // Fail!
            setFailFlash(true);
            setTimeout(() => setFailFlash(false), 300);
            setMatchCode(null);
            return [];
        }

        // Reset timer on correct stroke
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
    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none z-50">

      {/* Target Code Preview & Stats */}
      {matchCode && (
        <div className="w-full flex justify-between items-end mb-2 px-2">
            <span className="text-sm font-bold text-helldiver-gold uppercase tracking-widest bg-black/80 px-3 py-1 rounded">
              {gameState.stratagems.find(s => s.code === matchCode)?.name || 'UNKNOWN'}
            </span>
            <span className="text-xs text-helldiver-gold bg-black/80 px-2 py-1 ml-4 rounded font-mono">
              SEQ: {successPercentage}%
            </span>
        </div>
      )}

      {/* Input Bar Container */}
      <div className={`relative flex flex-col p-4 bg-zinc-950/90 backdrop-blur border-t-4 shadow-2xl ${failFlash ? 'border-red-500' : matchCode ? 'border-helldiver-gold' : 'border-zinc-800'}`}>

        <div className="flex space-x-2">
            {(matchCode || ['UP','RIGHT','DOWN','LEFT'] as ArrowCode[]).map((dir, idx) => {
            if (!matchCode) {
                if (idx > 3) return null;
                return <div key={`idle-${idx}`} className="w-14 h-14 border-2 border-zinc-800 bg-zinc-900/50" />;
            }
            const state = activeCode.length > idx ? 'success' : 'pending';
            return <ArrowIcon key={idx} dir={dir} state={state} />;
            })}
        </div>

        {/* Timing Window Progress Bar */}
        {activeCode.length > 0 && !failFlash && (
            <div className="absolute -bottom-2 left-0 right-0 h-1.5 bg-zinc-800 overflow-hidden">
               <div
                  className={`h-full transition-all duration-75 ease-linear ${timeRemaining > 40 ? 'bg-helldiver-gold' : timeRemaining > 20 ? 'bg-helldiver-orange' : 'bg-red-500'}`}
                  style={{ width: `${timeRemaining}%` }}
               />
            </div>
        )}
      </div>
    </div>
  );
};
