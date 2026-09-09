import React, { useEffect } from 'react';
import { useGameLoop } from './useGameLoop';
import { MapCanvas } from './components/MapCanvas';
import { TopBar } from './components/TopBar';
import { LeftPanel } from './components/LeftPanel';
import { RightPanel } from './components/RightPanel';
import { StratagemInput } from './components/StratagemInput';

const App: React.FC = () => {
  const { gameState, setGameState } = useGameLoop();

  useEffect(() => {
    if (!gameState.targetingMode) return;

    const moveSpeed = 15;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
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
                const updatedStratagems = g.stratagems.map(s =>
                    s.id === strat.id ? { ...s, readyAt: Date.now() + s.cooldown } : s
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

  return (
    <div className="w-screen h-screen bg-[#050505] relative overflow-hidden font-mono select-none">

      {/* Background Vignette & Grain (Premium feel) */}
      <div className="absolute inset-0 pointer-events-none z-0"
           style={{
               background: 'radial-gradient(circle, rgba(0,0,0,0) 40%, rgba(0,0,0,0.8) 100%)',
               boxShadow: 'inset 0 0 100px rgba(0,0,0,0.9)'
           }}
      />

      {/* Main Game Map */}
      <MapCanvas gameState={gameState} />

      {/* HUD Overlays */}
      <TopBar gameState={gameState} />
      <LeftPanel gameState={gameState} />
      <RightPanel gameState={gameState} />
      <StratagemInput gameState={gameState} setGameState={setGameState} />

      {/* Targeting Status Indicator */}
      {gameState.targetingMode && (
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none z-50">
              <div className="text-red-500 font-bold text-xl uppercase tracking-widest bg-black/90 px-6 py-2 border-2 border-red-500/50 shadow-[0_0_15px_rgba(255,0,0,0.3)] animate-pulse">
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
