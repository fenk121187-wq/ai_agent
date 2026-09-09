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

      <TopBar gameState={gameState} />
      <LeftPanel gameState={gameState} />
      <UpgradesPanel gameState={gameState} setGameState={setGameState} />
      <RightPanel gameState={gameState} />
      <StratagemInput gameState={gameState} setGameState={setGameState} />

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
