import React from 'react';
import { GameState } from '../types';

interface UpgradesPanelProps {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
}

export const UpgradesPanel: React.FC<UpgradesPanelProps> = ({ gameState, setGameState }) => {
  const handleUpgrade = (type: keyof GameState['upgrades']) => {
    const currentLevel = gameState.upgrades[type];
    if (currentLevel >= 5) return;

    const cost = (currentLevel + 1) * 10;

    if (gameState.samples >= cost) {
      setGameState(prev => ({
        ...prev,
        samples: prev.samples - cost,
        upgrades: {
          ...prev.upgrades,
          [type]: prev.upgrades[type] + 1
        },
        battlefeed: [...prev.battlefeed, `Super Destroyer upgrade authorized: ${type.toUpperCase()}`]
      }));
    }
  };

  const renderUpgrade = (title: string, type: keyof GameState['upgrades']) => {
    const level = gameState.upgrades[type];
    const cost = (level + 1) * 10;
    const isMax = level >= 5;
    const canAfford = gameState.samples >= cost;

    return (
      <div className="flex flex-col space-y-1 mb-3">
        <div className="flex justify-between items-center text-[11px] font-bold tracking-wider uppercase">
          <span className="text-zinc-300">{title}</span>
          <span className="text-helldiver-cyan font-mono">LVL {level}/5</span>
        </div>
        <div className="flex space-x-1 mb-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 ${i < level ? 'bg-helldiver-cyan shadow-[0_0_5px_#00F0FF]' : 'bg-zinc-800'}`}
            />
          ))}
        </div>
        <button
          onClick={() => handleUpgrade(type)}
          disabled={isMax || !canAfford}
          className={`text-[10px] py-1 px-2 font-bold uppercase transition-all border ${
            isMax
              ? 'bg-zinc-900/50 border-zinc-800 text-zinc-600 cursor-not-allowed'
              : canAfford
                ? 'bg-helldiver-cyan/10 border-helldiver-cyan/50 text-helldiver-cyan hover:bg-helldiver-cyan hover:text-black hover:shadow-[0_0_10px_#00F0FF]'
                : 'bg-zinc-900/50 border-red-900/30 text-red-500/50 cursor-not-allowed'
          }`}
          style={{ pointerEvents: 'auto' }}
        >
          {isMax ? 'MAX LEVEL' : `UPGRADE (${cost} SAMPLES)`}
        </button>
      </div>
    );
  };

  return (
    <div className="absolute bottom-36 left-6 w-72 glass-panel rounded-md p-4 z-50 flex flex-col font-rajdhani border-l-4 border-l-helldiver-orange pointer-events-none">

      <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-2">
        <h3 className="text-xs text-zinc-400 uppercase tracking-widest font-bold">Ship Upgrades</h3>
        <div className="flex items-center space-x-2 bg-black/50 px-2 py-0.5 border border-helldiver-gold/30">
          <span className="text-[10px] text-zinc-500">SAMPLES</span>
          <span className="text-helldiver-gold font-bold drop-shadow-[0_0_5px_rgba(255,193,7,0.5)] font-mono">
            {gameState.samples}
          </span>
        </div>
      </div>

      <div className="overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
        {renderUpgrade('Weapon Systems', 'weaponDamage')}
        {renderUpgrade('Titanium Armor', 'armorRating')}
        {renderUpgrade('Sensor Range', 'visionRange')}
        {renderUpgrade('Orbital Logistics', 'cooldownReduction')}
      </div>

    </div>
  );
};
