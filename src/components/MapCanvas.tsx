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

    const time = Date.now();

    // --- RENDER ENTITIES LAYER ---
    ctx.clearRect(0, 0, MAP_WIDTH, MAP_HEIGHT);
    // Darker, richer background
    ctx.fillStyle = '#020202';
    ctx.fillRect(0, 0, MAP_WIDTH, MAP_HEIGHT);

    // Engagement Lines (Laser effect)
    gameState.helldivers.forEach(hd => {
        if (hd.isDead) return;
        gameState.enemies.forEach(enemy => {
            const dx = hd.position.x - enemy.position.x;
            const dy = hd.position.y - enemy.position.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 300) {
                const pulse = (Math.sin(time / 80) + 1) / 2;

                ctx.beginPath();
                ctx.moveTo(hd.position.x, hd.position.y);
                ctx.lineTo(enemy.position.x, enemy.position.y);

                // Neon glow
                ctx.shadowBlur = 10;
                ctx.shadowColor = '#FF5E00';
                ctx.strokeStyle = `rgba(255, 94, 0, ${0.4 + pulse * 0.4})`;
                ctx.lineWidth = 1 + pulse;

                // Animated dashes for laser fire effect
                ctx.setLineDash([10, 15]);
                ctx.lineDashOffset = -(time / 20) % 25;
                ctx.stroke();

                ctx.setLineDash([]);
                ctx.shadowBlur = 0;
            }
        });
    });

    // Render Enemies (Glowing Red Triangles)
    gameState.enemies.forEach(enemy => {
        if (enemy.health <= 0) return;

        ctx.shadowBlur = 8;
        ctx.shadowColor = '#ff0000';
        ctx.fillStyle = '#ff3333';

        ctx.beginPath();
        // Pointing generally towards center for now
        ctx.moveTo(enemy.position.x, enemy.position.y - 6);
        ctx.lineTo(enemy.position.x + 5, enemy.position.y + 5);
        ctx.lineTo(enemy.position.x - 5, enemy.position.y + 5);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;
    });

    // Render Civilians (White glowing dots)
    gameState.civilians.forEach(civ => {
        if (civ.isDead) {
            ctx.fillStyle = '#222';
            ctx.shadowBlur = 0;
        } else {
            ctx.fillStyle = '#ffffff';
            ctx.shadowBlur = 5;
            ctx.shadowColor = '#ffffff';
        }
        ctx.beginPath();
        ctx.arc(civ.position.x, civ.position.y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    });

    // Render Helldivers (Advanced Chevron)
    gameState.helldivers.forEach(hd => {
      if (hd.isDead) {
          ctx.fillStyle = '#333';
          ctx.beginPath();
          ctx.arc(hd.position.x, hd.position.y, 6, 0, Math.PI * 2);
          ctx.fill();
          return;
      }

      // Glow based on engagement
      ctx.shadowBlur = hd.isEngaged ? 15 : 8;
      ctx.shadowColor = hd.isEngaged ? '#FF5E00' : '#00F0FF';
      ctx.fillStyle = '#00F0FF';

      // Draw Chevron
      ctx.beginPath();
      ctx.moveTo(hd.position.x, hd.position.y - 10);
      ctx.lineTo(hd.position.x + 8, hd.position.y + 6);
      ctx.lineTo(hd.position.x, hd.position.y + 2);
      ctx.lineTo(hd.position.x - 8, hd.position.y + 6);
      ctx.closePath();
      ctx.fill();

      // Draw engaged indicator ring
      if (hd.isEngaged) {
          const pulse = (Math.sin(time / 100) + 1) / 2;
          ctx.strokeStyle = '#FF5E00';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(hd.position.x, hd.position.y, 16 + pulse * 4, 0, Math.PI * 2);
          ctx.stroke();
      }

      ctx.shadowBlur = 0;

      // Draw Name tag
      ctx.fillStyle = '#FFC107';
      ctx.font = 'bold 12px "Share Tech Mono"';
      ctx.textAlign = 'center';
      ctx.fillText(hd.name, hd.position.x, hd.position.y - 15);
    });

    // --- RENDER FOG OF WAR LAYER ---
    fowCtx.globalCompositeOperation = 'source-over';
    fowCtx.clearRect(0, 0, MAP_WIDTH, MAP_HEIGHT);
    fowCtx.fillStyle = 'rgba(0, 0, 0, 1)'; // Completely opaque
    fowCtx.fillRect(0, 0, MAP_WIDTH, MAP_HEIGHT);

    fowCtx.globalCompositeOperation = 'destination-out';

    gameState.helldivers.forEach(hd => {
        // Base vision from upgrades
        let visionRadius = 400 + (gameState.upgrades.visionRange * 50);

        if (hd.isEngaged) {
            visionRadius += 50 + Math.sin(time / 50) * 20;
        }

        if (hd.isDead && hd.timeOfDeath) {
            const timeSinceDeath = time - hd.timeOfDeath;
            const shrinkTime = 8000;
            if (timeSinceDeath < shrinkTime) {
                visionRadius = (400 + (gameState.upgrades.visionRange * 50)) * (1 - timeSinceDeath / shrinkTime);
            } else {
                visionRadius = 0;
            }
        }

        if (visionRadius > 0) {
            const gradient = fowCtx.createRadialGradient(
                hd.position.x, hd.position.y, 50,
                hd.position.x, hd.position.y, visionRadius
            );
            // Softer gradient for AAA feel
            gradient.addColorStop(0, 'rgba(0, 0, 0, 1)');
            gradient.addColorStop(0.6, 'rgba(0, 0, 0, 0.9)');
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

            fowCtx.fillStyle = gradient;
            fowCtx.beginPath();
            fowCtx.arc(hd.position.x, hd.position.y, visionRadius, 0, Math.PI * 2);
            fowCtx.fill();
        }
    });

    // --- TARGETING RETICLE OVERLAY ---
    if (gameState.targetingMode) {
        const strat = gameState.stratagems.find(s => s.id === gameState.activeStratagemId);
        if (strat) {
            fowCtx.globalCompositeOperation = 'source-over';

            const tp = gameState.targetingPosition;
            const pulse = (Math.sin(time / 100) + 1) / 2;

            fowCtx.shadowBlur = 15;
            fowCtx.shadowColor = strat.type === 'BOMB' ? '#ff0000' : '#00F0FF';

            // Area of effect
            fowCtx.beginPath();
            fowCtx.arc(tp.x, tp.y, strat.type === 'BOMB' ? 250 : 50, 0, Math.PI * 2);
            fowCtx.fillStyle = strat.type === 'BOMB' ? `rgba(255, 0, 0, ${0.1 + pulse * 0.15})` : `rgba(0, 240, 255, ${0.1 + pulse * 0.15})`;
            fowCtx.fill();
            fowCtx.strokeStyle = strat.type === 'BOMB' ? '#ff0000' : '#00F0FF';
            fowCtx.lineWidth = 2;
            fowCtx.setLineDash([15, 15]);
            fowCtx.lineDashOffset = time / 20;
            fowCtx.stroke();
            fowCtx.setLineDash([]);

            // Crosshair
            fowCtx.strokeStyle = '#ffffff';
            fowCtx.lineWidth = 1.5;
            fowCtx.beginPath();
            fowCtx.moveTo(tp.x - 25, tp.y);
            fowCtx.lineTo(tp.x + 25, tp.y);
            fowCtx.moveTo(tp.x, tp.y - 25);
            fowCtx.lineTo(tp.x, tp.y + 25);
            fowCtx.stroke();

            fowCtx.shadowBlur = 0;
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
          className="absolute inset-0 z-0 mix-blend-screen"
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
