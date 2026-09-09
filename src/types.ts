export type Position = {
  x: number;
  y: number;
};

export type ArrowCode = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export interface Helldiver {
  id: string;
  name: string;
  position: Position;
  health: number; // 0-100
  ammo: number; // 0-100
  isDead: boolean;
  isEngaged: boolean;
  timeOfDeath?: number; // timestamp
}

export interface Enemy {
  id: string;
  position: Position;
  health: number;
  targetId?: string; // id of Helldiver or Civilian
}

export interface Civilian {
  id: string;
  position: Position;
  health: number;
  isDead: boolean;
  panicDestination?: Position;
}

export interface Stratagem {
  id: string;
  name: string;
  code: ArrowCode[];
  cooldown: number; // in ms
  readyAt: number; // timestamp
  color: string;
  type: 'BOMB' | 'REINFORCE' | 'SUPPLY' | 'VISION';
}

export interface Objective {
  id: string;
  name: string;
  progress: number;
  max: number;
  position: Position;
}

export interface GameState {
  helldivers: Helldiver[];
  enemies: Enemy[];
  civilians: Civilian[];
  stratagems: Stratagem[];
  objectives: Objective[];
  missionTimeLeft: number; // in seconds
  sacrificeScore: number;
  rating: string;
  stars: number;
  operationName: string;
  sector: string;
  activeInputSequence: ArrowCode[];
  activeStratagemId: string | null;
  targetingMode: boolean;
  targetingPosition: Position;
  battlefeed: string[];
}
