import { useState, useEffect, useRef } from 'react';
import { GameState, Position } from './types';
import { generateInitialState } from './initialState';

const distance = (p1: Position, p2: Position) => {
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
};

export const useGameLoop = () => {
  const [gameState, setGameState] = useState<GameState>(generateInitialState());
  const requestRef = useRef<number>(0);
  const lastUpdateRef = useRef<number>(Date.now());

  const update = () => {
    const now = Date.now();
    const dt = (now - lastUpdateRef.current) / 1000;
    lastUpdateRef.current = now;

    setGameState((prev) => {
      const next = { ...prev };
      let newBattlefeedMsgs: string[] = [];
      let justDiedHelldivers = 0;
      let justDiedCivilians = 0;

      // Update timer
      next.missionTimeLeft = Math.max(0, next.missionTimeLeft - dt);

      // --- COMBAT & DAMAGE LOGIC ---
      next.enemies.forEach(enemy => {
          if (enemy.health <= 0) return;

          let targetFound = false;

          next.civilians.forEach(civ => {
              if (civ.isDead) return;
              if (distance(enemy.position, civ.position) < 40) {
                  civ.health -= 15 * dt;
                  targetFound = true;
                  if (civ.health <= 0) {
                      civ.health = 0;
                      civ.isDead = true;
                      justDiedCivilians++;
                      newBattlefeedMsgs.push('Civilian casualty detected.');
                  }
              }
          });

          if (targetFound) return;

          next.helldivers.forEach(hd => {
              if (hd.isDead) return;
              if (distance(enemy.position, hd.position) < 50) {
                  hd.health -= 10 * dt;
                  if (hd.health <= 0) {
                      hd.health = 0;
                      hd.isDead = true;
                      hd.timeOfDeath = now;
                      justDiedHelldivers++;
                      newBattlefeedMsgs.push(`WARNING: Helldiver ${hd.name} KIA.`);
                  }
              }
          });
      });

      next.helldivers.forEach(hd => {
          if (hd.isDead) return;
          let isEngaged = false;

          next.enemies.forEach(enemy => {
              if (enemy.health <= 0) return;
              const dist = distance(hd.position, enemy.position);

              if (dist < 300) {
                  isEngaged = true;
                  enemy.health -= 20 * dt;
              }
          });
          hd.isEngaged = isEngaged;
      });

      next.enemies = next.enemies.filter(e => e.health > 0);

      // --- ENEMY MOVEMENT AI ---
      next.enemies = next.enemies.map(enemy => {
        let nearestTarget: Position | null = null;
        let minDist = Infinity;

        next.helldivers.forEach(hd => {
          if (!hd.isDead) {
            const d = distance(enemy.position, hd.position);
            if (d < minDist) {
              minDist = d;
              nearestTarget = hd.position;
            }
          }
        });

        next.civilians.forEach(civ => {
          if (!civ.isDead) {
            const d = distance(enemy.position, civ.position);
            if (d < minDist) {
              minDist = d;
              nearestTarget = civ.position;
            }
          }
        });

        if (nearestTarget !== null) {
            const targetPos: Position = nearestTarget;
            if (minDist > 30 && minDist < 800) {
              const dx = targetPos.x - enemy.position.x;
              const dy = targetPos.y - enemy.position.y;
              const len = Math.sqrt(dx * dx + dy * dy);
              return {
                ...enemy,
                position: {
                  x: enemy.position.x + (dx / len) * 50 * dt,
                  y: enemy.position.y + (dy / len) * 50 * dt,
                }
              };
            }
        }
        return enemy;
      });

      // --- CIVILIAN PATHING (PANIC) ---
      next.civilians = next.civilians.map(civ => {
          if (civ.isDead) return civ;

          let nearestEnemyDist = Infinity;
          next.enemies.forEach(e => {
              const d = distance(civ.position, e.position);
              if (d < nearestEnemyDist) nearestEnemyDist = d;
          });

          // If enemy is close, panic and run towards nearest helldiver
          if (nearestEnemyDist < 400) {
              let nearestHd: Position | null = null;
              let nearestHdDist = Infinity;

              next.helldivers.forEach(hd => {
                  if (!hd.isDead) {
                      const d = distance(civ.position, hd.position);
                      if (d < nearestHdDist) {
                          nearestHdDist = d;
                          nearestHd = hd.position;
                      }
                  }
              });

              if (nearestHd !== null) {
                  const targetPos: Position = nearestHd;
                  // Stop right behind helldiver
                  if (nearestHdDist > 20) {
                      const dx = targetPos.x - civ.position.x;
                      const dy = targetPos.y - civ.position.y;
                      const len = Math.sqrt(dx * dx + dy * dy);
                      return {
                          ...civ,
                          position: {
                              x: civ.position.x + (dx / len) * 35 * dt,
                              y: civ.position.y + (dy / len) * 35 * dt,
                          }
                      };
                  }
              }
          }
          return civ;
      });

      // --- SCORING & RATING ---
      if (justDiedHelldivers > 0 || justDiedCivilians > 0) {
          next.sacrificeScore += (justDiedHelldivers * 5000) + (justDiedCivilians * 1000);

          if (next.sacrificeScore > 20000) {
              next.rating = 'F';
              next.stars = 1;
          } else if (next.sacrificeScore > 10000) {
              next.rating = 'C';
              next.stars = 2;
          } else if (next.sacrificeScore > 5000) {
              next.rating = 'B';
              next.stars = 3;
          } else if (next.sacrificeScore > 0) {
              next.rating = 'A';
              next.stars = 4;
          }
      }

      if (newBattlefeedMsgs.length > 0) {
          next.battlefeed = [...next.battlefeed, ...newBattlefeedMsgs];
      }

      return next;
    });

    requestRef.current = requestAnimationFrame(update);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(requestRef.current);
  }, []);

  return { gameState, setGameState };
};
