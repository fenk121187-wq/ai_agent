import { GameState } from './types';

export const MAP_WIDTH = 2000;
export const MAP_HEIGHT = 1500;

export const generateInitialState = (): GameState => {
  return {
    helldivers: [
      { id: 'h1', name: 'K1', position: { x: 500, y: 700 }, health: 100, ammo: 100, isDead: false, isEngaged: false },
      { id: 'h2', name: 'J2', position: { x: 520, y: 720 }, health: 100, ammo: 100, isDead: false, isEngaged: false },
      { id: 'h3', name: 'L3', position: { x: 480, y: 740 }, health: 100, ammo: 100, isDead: false, isEngaged: false },
      { id: 'h4', name: 'P4', position: { x: 550, y: 680 }, health: 100, ammo: 100, isDead: false, isEngaged: false },
    ],
    enemies: Array.from({ length: 15 }).map((_, i) => ({
      id: `e${i}`,
      position: { x: 800 + Math.random() * 600, y: 400 + Math.random() * 600 },
      health: 100,
    })),
    civilians: Array.from({ length: 8 }).map((_, i) => ({
      id: `c${i}`,
      position: { x: 450 + Math.random() * 200, y: 650 + Math.random() * 200 },
      health: 100,
      isDead: false,
    })),
    stratagems: [
      { id: 's1', name: 'Orbital Strike', code: ['RIGHT', 'RIGHT', 'UP'], cooldown: 15000, readyAt: 0, color: '#FF5E00', type: 'BOMB' },
      { id: 's2', name: 'Eagle Airstrike', code: ['UP', 'RIGHT', 'DOWN', 'RIGHT'], cooldown: 8000, readyAt: 0, color: '#FF5E00', type: 'BOMB' },
      { id: 's3', name: 'Reinforce', code: ['UP', 'DOWN', 'RIGHT', 'LEFT', 'UP'], cooldown: 30000, readyAt: 0, color: '#2196F3', type: 'REINFORCE' },
      { id: 's4', name: 'Resupply', code: ['DOWN', 'DOWN', 'UP', 'RIGHT'], cooldown: 45000, readyAt: 0, color: '#FFC107', type: 'SUPPLY' },
    ],
    objectives: [
      { id: 'o1', name: 'Extract Civilians', progress: 0, max: 20, position: { x: 300, y: 800 } },
      { id: 'o2', name: 'Destroy Bug Nests', progress: 1, max: 4, position: { x: 1200, y: 500 } },
    ],
    missionTimeLeft: 40 * 60, // 40 mins
    sacrificeScore: 0,
    samples: 0,
    upgrades: {
      weaponDamage: 0,
      armorRating: 0,
      visionRange: 0,
      cooldownReduction: 0,
    },
    rating: 'A',
    stars: 4,
    operationName: 'Operation Valiant Enclosure',
    sector: 'Turing Sector',
    activeInputSequence: [],
    activeStratagemId: null,
    targetingMode: false,
    targetingPosition: { x: MAP_WIDTH / 2, y: MAP_HEIGHT / 2 },
    battlefeed: ['Deployment successful.', 'Awaiting command.'],
  };
};
