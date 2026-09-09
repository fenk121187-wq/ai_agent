import React, { useEffect } from 'react';
import { useGameLoop } from './useGameLoop';
import { MapCanvas } from './components/MapCanvas';
import { TopBar } from './components/TopBar';
import { LeftPanel } from './components/LeftPanel';
import { RightPanel } from './components/RightPanel';
import { StratagemInput } from './components/StratagemInput';
import { UpgradesPanel } from './components/UpgradesPanel';

const App: React.FC = () => {
  const { gameState, setGameState } = useGameLoop();

  // Targeting Mode Keyboard Controls
  useEffect(() => {
    if (!gameState.targetingMode) return;

    const moveSpeed = 15;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'x') {
        setGameState(g => ({ ...g, targetingMode: false, activeStratagemId: null, battlefeed: [...g.battlefeed, 'Targeting aborted.'] }));
        return;
      }

      setGameState(g => {
        let { x, y } = g.targetingPosition;
        if (e.key === 'ArrowUp' || e.key === 'w') y -= moveSpeed;
        if (e.key === 'ArrowDown' || e.key === 's') y += moveSpeed;
        if (e.key === 'ArrowLeft' || e.key === 'a') x -= moveSpeed;
        if (e.key === 'ArrowRight' || e.key === 'd') x += moveSpeed;

        if (e.key === 'Enter' || e.key === ' ') {
            const strat = g.stratagems.find(s => s.id === g.activeStratagemId);
            if (strat) {
                // Apply cooldown reduction upgrade (10% per level)
                const cdrMultiplier = 1 - (g.upgrades.cooldownReduction * 0.1);

                const updatedStratagems = g.stratagems.map(s =>
                    s.id === strat.id ? { ...s, readyAt: Date.now() + (s.cooldown * cdrMultiplier) } : s
                );

                let updatedEnemies = g.enemies;
                let bfMsg = `${strat.name} deployed.`;

                if (strat.type === 'BOMB') {
                    const blastRadius = 250;
                    updatedEnemies = g.enemies.filter(enemy => {
                        const dx = enemy.position.x - g.targetingPosition.x;
                        const dy = enemy.position.y - g.targetingPosition.y;
                        return Math.sqrt(dx*dx + dy*dy) > blastRadius;
                    });
                    bfMsg = `${strat.name} impact confirmed. Targets eliminated.`;
                }

                return {
                    ...g,
                    targetingMode: false,
                    activeStratagemId: null,
                    stratagems: updatedStratagems,
                    enemies: updatedEnemies,
                    battlefeed: [...g.battlefeed, bfMsg]
                };
            }
        }

        return { ...g, targetingPosition: { x, y } };
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState.targetingMode, setGameState]);

  // Stratagem Input Keyboard Loop
  useEffect(() => {
    if (gameState.targetingMode) return; // Don't process stratagem inputs while targeting

    const handleKeyDown = (e: KeyboardEvent) => {
        let inputArrow: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | null = null;
        if (e.key === 'ArrowUp') inputArrow = 'UP';
        if (e.key === 'ArrowDown') inputArrow = 'DOWN';
        if (e.key === 'ArrowLeft') inputArrow = 'LEFT';
        if (e.key === 'ArrowRight') inputArrow = 'RIGHT';

        if (e.key === 'x') {
            setGameState(g => ({ ...g, activeStratagemId: null, activeStratagemInputId: null, activeSequence: [], targetSequence: null }));
            return;
        }

        if (inputArrow) {
             setGameState(g => {
                if (!g.activeStratagemInputId) return g;

                const strat = g.stratagems.find(s => s.id === g.activeStratagemInputId);
                if (!strat || strat.readyAt > Date.now()) return g; // Cooldown check

                const currentSeqIndex = g.activeSequence.length;
                const expectedArrow = strat.code[currentSeqIndex];

                if (inputArrow === expectedArrow) {
                    const newSequence = [...g.activeSequence, inputArrow];

                    if (newSequence.length === strat.code.length) {
                        // Sequence complete!
                        return {
                            ...g,
                            activeSequence: [],
                            activeStratagemInputId: null,
                            targetSequence: null,
                            targetingMode: true,
                            activeStratagemId: strat.id,
                            battlefeed: [...g.battlefeed, `STRATAGEM CODED: ${strat.name.toUpperCase()}`]
                        };
                    } else {
                        // Correct input, wait for next
                        return { ...g, activeSequence: newSequence };
                    }
                } else {
                    // Wrong input, reset
                    return { ...g, activeSequence: [], battlefeed: [...g.battlefeed, 'INPUT ERROR: SEQUENCE RESET'] };
                }
             });
        }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState.targetingMode, setGameState]);


  return (
    <div className="w-screen h-screen bg-[#050505] bg-grid-pattern relative overflow-hidden font-rajdhani select-none crt-overlay">
      <style>{`
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        @keyframes slideIn {
          from { transform: translateX(10px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>

      {/* Background Vignette */}
      <div className="absolute inset-0 pointer-events-none z-0"
           style={{
               background: 'radial-gradient(circle, rgba(0,0,0,0) 40%, rgba(0,0,0,0.95) 100%)',
           }}
      />

      <MapCanvas gameState={gameState} />


      {/* Top Header Text Strip */}
      <div className="absolute top-4 left-6 z-50 pointer-events-none flex flex-col">
        <h1 className="text-4xl font-black text-zinc-100 tracking-tighter drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]">HELLDIVERS</h1>
        <h2 className="text-xs text-zinc-400 font-bold uppercase tracking-[0.3em] pl-1">TACTICAL COMMAND</h2>
      </div>

      <TopBar gameState={gameState} />
      <div className="absolute top-[8.5rem] left-6 bottom-[4rem] w-72 flex flex-col space-y-4 z-50 pointer-events-none">
         <LeftPanel gameState={gameState} />
         <UpgradesPanel gameState={gameState} setGameState={setGameState} />
      </div>
      <RightPanel gameState={gameState} />
      <StratagemInput gameState={gameState} setGameState={setGameState} />

      {/* Bottom Footer Text Strip */}
      <div className="absolute bottom-3 left-0 w-full px-6 flex justify-between text-[10px] text-zinc-500 font-bold uppercase tracking-widest z-50 pointer-events-none">
        <span>PRESS [X] TO CANCEL</span>
        <span className="ml-24">HELLDIVERS TACNET V2.6.1</span>
        <span className="flex items-center space-x-2">
          <span>SECURE UPLINK: STRONG</span>
          <div className="flex items-end space-x-0.5 h-3">
             <div className="w-1 bg-green-600 h-1"></div>
             <div className="w-1 bg-green-500 h-2"></div>
             <div className="w-1 bg-green-400 h-3"></div>
          </div>
        </span>
      </div>

      {gameState.targetingMode && (
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none z-50">
              <div className="text-red-500 font-bold text-xl uppercase tracking-widest bg-black/90 px-6 py-2 border-2 border-red-500/50 shadow-[0_0_15px_rgba(255,0,0,0.3)] animate-pulse glass-panel">
                  Targeting Coordinates [ENTER]
              </div>
              <div className="text-zinc-500 text-xs mt-2 bg-black/80 px-3 py-1 border border-zinc-800">
                  [ESC] to abort
              </div>
          </div>
      )}

    </div>
  );
};

export default App;
