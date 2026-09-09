import React, { useRef, useEffect } from 'react';
import { GameState } from '../types';
import { MAP_WIDTH, MAP_HEIGHT } from '../initialState';

interface MapCanvasProps {
  gameState: GameState;
}

export const MapCanvas: React.FC<MapCanvasProps> = ({ gameState }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fowCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const fowCanvas = fowCanvasRef.current;
    if (!canvas || !fowCanvas) return;
    const ctx = canvas.getContext('2d');
    const fowCtx = fowCanvas.getContext('2d');
    if (!ctx || !fowCtx) return;

    // We only want to render entities if they are inside vision.
    // The easiest way to achieve "completely invisible" without complex path logic
    // is to draw the fog on top, completely opaque, and cut out the vision.

    // --- RENDER ENTITIES LAYER ---
    ctx.clearRect(0, 0, MAP_WIDTH, MAP_HEIGHT);
    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, MAP_WIDTH, MAP_HEIGHT);

    // Engagement Lines
    gameState.helldivers.forEach(hd => {
        if (hd.isDead) return;
        gameState.enemies.forEach(enemy => {
            const dx = hd.position.x - enemy.position.x;
            const dy = hd.position.y - enemy.position.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 300) {
                const time = Date.now();
                const pulse = (Math.sin(time / 100) + 1) / 2;

                ctx.beginPath();
                ctx.moveTo(hd.position.x, hd.position.y);
                ctx.lineTo(enemy.position.x, enemy.position.y);
                ctx.strokeStyle = `rgba(255, 0, 0, ${0.4 + pulse * 0.4})`;
                ctx.lineWidth = 1 + pulse * 2;
                ctx.stroke();
            }
        });
    });

    // Render Enemies
    ctx.fillStyle = '#ff0000';
    gameState.enemies.forEach(enemy => {
        if (enemy.health <= 0) return;
        ctx.beginPath();
        ctx.arc(enemy.position.x, enemy.position.y, 6, 0, Math.PI * 2);
        ctx.fill();
    });

    // Render Civilians
    ctx.fillStyle = '#ffffff';
    gameState.civilians.forEach(civ => {
        if (civ.isDead) {
            ctx.fillStyle = '#444444';
        } else {
            ctx.fillStyle = '#ffffff';
        }
        ctx.fillRect(civ.position.x - 3, civ.position.y - 3, 6, 6);
    });

    // Render Helldivers
    gameState.helldivers.forEach(hd => {
      if (hd.isDead) {
          ctx.fillStyle = '#555555'; // Dead body
          ctx.beginPath();
          ctx.arc(hd.position.x, hd.position.y, 6, 0, Math.PI * 2);
          ctx.fill();
          return;
      }

      ctx.fillStyle = '#2196F3';
      ctx.beginPath();
      ctx.moveTo(hd.position.x, hd.position.y - 8);
      ctx.lineTo(hd.position.x + 8, hd.position.y);
      ctx.lineTo(hd.position.x, hd.position.y + 8);
      ctx.lineTo(hd.position.x - 8, hd.position.y);
      ctx.closePath();
      ctx.fill();

      if (hd.isEngaged) {
          ctx.strokeStyle = '#FF5E00';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(hd.position.x, hd.position.y, 14, 0, Math.PI * 2);
          ctx.stroke();
      }

      ctx.fillStyle = '#FFC107';
      ctx.font = '12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(hd.name, hd.position.x, hd.position.y - 12);
    });

    // --- RENDER FOG OF WAR LAYER ---
    fowCtx.globalCompositeOperation = 'source-over';
    fowCtx.clearRect(0, 0, MAP_WIDTH, MAP_HEIGHT);
    fowCtx.fillStyle = 'rgba(0, 0, 0, 1)'; // Completely opaque
    fowCtx.fillRect(0, 0, MAP_WIDTH, MAP_HEIGHT);

    fowCtx.globalCompositeOperation = 'destination-out';

    const time = Date.now();

    gameState.helldivers.forEach(hd => {
        let visionRadius = 400;

        if (hd.isEngaged) {
            // Muzzle flashes / combat expands vision slightly and pulses
            visionRadius += 50 + Math.sin(time / 50) * 20;
        }

        if (hd.isDead && hd.timeOfDeath) {
            // Shrink over 8-10 seconds
            const timeSinceDeath = time - hd.timeOfDeath;
            const shrinkTime = 8000;
            if (timeSinceDeath < shrinkTime) {
                visionRadius = 400 * (1 - timeSinceDeath / shrinkTime);
            } else {
                visionRadius = 0;
            }
        }

        if (visionRadius > 0) {
            const gradient = fowCtx.createRadialGradient(
                hd.position.x, hd.position.y, 50,
                hd.position.x, hd.position.y, visionRadius
            );
            gradient.addColorStop(0, 'rgba(0, 0, 0, 1)');
            gradient.addColorStop(0.8, 'rgba(0, 0, 0, 0.8)');
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

            fowCtx.fillStyle = gradient;
            fowCtx.beginPath();
            fowCtx.arc(hd.position.x, hd.position.y, visionRadius, 0, Math.PI * 2);
            fowCtx.fill();
        }
    });

    // Draw active stratagem impact logic (temporarily expand vision)
    // For simplicity, we could leave this out or add a 'flares' array to state if needed.

    // --- TARGETING RETICLE OVERLAY ---
    if (gameState.targetingMode) {
        const strat = gameState.stratagems.find(s => s.id === gameState.activeStratagemId);
        if (strat) {
            fowCtx.globalCompositeOperation = 'source-over';

            const tp = gameState.targetingPosition;
            const pulse = (Math.sin(time / 150) + 1) / 2;

            fowCtx.beginPath();
            fowCtx.arc(tp.x, tp.y, strat.type === 'BOMB' ? 250 : 50, 0, Math.PI * 2);
            fowCtx.fillStyle = strat.type === 'BOMB' ? `rgba(255, 0, 0, ${0.1 + pulse * 0.1})` : `rgba(33, 150, 243, ${0.1 + pulse * 0.1})`;
            fowCtx.fill();
            fowCtx.strokeStyle = strat.type === 'BOMB' ? '#ff0000' : '#2196F3';
            fowCtx.lineWidth = 2;
            fowCtx.setLineDash([10, 10]);
            fowCtx.stroke();
            fowCtx.setLineDash([]);

            fowCtx.strokeStyle = '#ffffff';
            fowCtx.lineWidth = 1;
            fowCtx.beginPath();
            fowCtx.moveTo(tp.x - 20, tp.y);
            fowCtx.lineTo(tp.x + 20, tp.y);
            fowCtx.moveTo(tp.x, tp.y - 20);
            fowCtx.lineTo(tp.x, tp.y + 20);
            fowCtx.stroke();
        }
    }

  }, [gameState]);

  return (
    <div className="absolute inset-0 overflow-hidden bg-black flex items-center justify-center">
      <div className="relative" style={{ width: MAP_WIDTH, height: MAP_HEIGHT, transform: 'scale(0.8)' }}>
        <canvas
          ref={canvasRef}
          width={MAP_WIDTH}
          height={MAP_HEIGHT}
          className="absolute inset-0 z-0"
        />
        <canvas
          ref={fowCanvasRef}
          width={MAP_WIDTH}
          height={MAP_HEIGHT}
          className="absolute inset-0 z-10 pointer-events-none"
        />
      </div>
    </div>
  );
};
