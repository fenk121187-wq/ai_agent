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
    // Dark map background texture base
    ctx.fillStyle = '#0a0d14';
    ctx.fillRect(0, 0, MAP_WIDTH, MAP_HEIGHT);

    // Engagement Lines (Dashed red laser effect terminating in diamonds)
    gameState.helldivers.forEach(hd => {
        if (hd.isDead) return;
        gameState.enemies.forEach(enemy => {
            const dx = hd.position.x - enemy.position.x;
            const dy = hd.position.y - enemy.position.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 400) {
                const pulse = (Math.sin(time / 80) + 1) / 2;

                ctx.beginPath();
                ctx.moveTo(hd.position.x, hd.position.y);
                ctx.lineTo(enemy.position.x, enemy.position.y);

                // Red glowing lines
                ctx.shadowBlur = 10;
                ctx.shadowColor = 'rgba(255, 50, 50, 0.8)';
                ctx.strokeStyle = `rgba(255, 50, 50, ${0.4 + pulse * 0.3})`;
                ctx.lineWidth = 1.5;

                // Dashed
                ctx.setLineDash([8, 12]);
                ctx.lineDashOffset = -(time / 30) % 20;
                ctx.stroke();
                ctx.setLineDash([]);
                ctx.shadowBlur = 0;

                // Diamond at enemy position for connection point
                ctx.shadowBlur = 15;
                ctx.shadowColor = '#ff3333';
                ctx.fillStyle = '#ff5555';
                ctx.beginPath();
                ctx.moveTo(enemy.position.x, enemy.position.y - 6);
                ctx.lineTo(enemy.position.x + 6, enemy.position.y);
                ctx.lineTo(enemy.position.x, enemy.position.y + 6);
                ctx.lineTo(enemy.position.x - 6, enemy.position.y);
                ctx.closePath();
                ctx.fill();
                ctx.shadowBlur = 0;
            }
        });
    });

    // Render Enemies (Glowing Red Diamonds - visible in fog handled later, but drawn here)
    gameState.enemies.forEach(enemy => {
        if (enemy.health <= 0) return;

        ctx.shadowBlur = 12;
        ctx.shadowColor = '#ff0000';
        ctx.fillStyle = '#ff2222';

        ctx.beginPath();
        ctx.moveTo(enemy.position.x, enemy.position.y - 8);
        ctx.lineTo(enemy.position.x + 8, enemy.position.y);
        ctx.lineTo(enemy.position.x, enemy.position.y + 8);
        ctx.lineTo(enemy.position.x - 8, enemy.position.y);
        ctx.closePath();
        ctx.fill();

        // Inner bright core
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(enemy.position.x, enemy.position.y - 3);
        ctx.lineTo(enemy.position.x + 3, enemy.position.y);
        ctx.lineTo(enemy.position.x, enemy.position.y + 3);
        ctx.lineTo(enemy.position.x - 3, enemy.position.y);
        ctx.closePath();
        ctx.fill();

        ctx.shadowBlur = 0;
    });

    // Render Civilians (White glowing dots)
    gameState.civilians.forEach(civ => {
        if (civ.isDead) return;
        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#ffffff';
        ctx.beginPath();
        ctx.arc(civ.position.x, civ.position.y, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    });


    // Draw the Central Yellow Crosshair/Radar (Decorative overlay)
    const centerX = MAP_WIDTH / 2;
    const centerY = MAP_HEIGHT * 0.7; // Lower center

    ctx.strokeStyle = 'rgba(255, 193, 7, 0.2)'; // Faint Helldiver gold
    ctx.lineWidth = 1;
    ctx.shadowBlur = 0;

    // Concentric rings
    for(let r=50; r<=200; r+=50) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, r, 0, Math.PI*2);
        ctx.stroke();
    }
    // Cross lines
    ctx.beginPath();
    ctx.moveTo(centerX - 220, centerY);
    ctx.lineTo(centerX + 220, centerY);
    ctx.moveTo(centerX, centerY - 220);
    ctx.lineTo(centerX, centerY + 220);
    ctx.stroke();


    // Render Helldivers
    gameState.helldivers.forEach(hd => {
      if (hd.isDead) return;

      // Hexagon icon background
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#0088ff';
      ctx.strokeStyle = '#00bfff';
      ctx.lineWidth = 2;
      ctx.fillStyle = 'rgba(0, 191, 255, 0.1)';

      const size = 14;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI/2;
        const x = hd.position.x + size * Math.cos(angle);
        const y = hd.position.y + size * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Inner dot/icon
      ctx.fillStyle = '#ffffff';
      ctx.shadowBlur = 5;
      ctx.beginPath();
      ctx.arc(hd.position.x, hd.position.y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Draw Name tag (H-1 HELLDIVER)
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px "Rajdhani", sans-serif';
      ctx.textAlign = 'center';

      ctx.fillText(hd.name, hd.position.x, hd.position.y - 35);
      ctx.fillText("HELLDIVER", hd.position.x, hd.position.y - 20);
    });

    // --- RENDER FOG OF WAR LAYER ---
    fowCtx.globalCompositeOperation = 'source-over';
    fowCtx.clearRect(0, 0, MAP_WIDTH, MAP_HEIGHT);

    // Create a smoky/cloudy background look by layering some opacity (simplified)
    fowCtx.fillStyle = 'rgba(10, 15, 20, 0.95)';
    fowCtx.fillRect(0, 0, MAP_WIDTH, MAP_HEIGHT);

    fowCtx.globalCompositeOperation = 'destination-out';

    gameState.helldivers.forEach(hd => {
        let visionRadius = 250; // Defined blue radius

        if (hd.isDead) return; // Immediate snap off for simplicity, or keep shrink logic if desired

        if (visionRadius > 0) {
            // Cut out the fog
            const gradient = fowCtx.createRadialGradient(
                hd.position.x, hd.position.y, 50,
                hd.position.x, hd.position.y, visionRadius
            );
            gradient.addColorStop(0, 'rgba(0, 0, 0, 1)');
            gradient.addColorStop(0.7, 'rgba(0, 0, 0, 0.8)');
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

            fowCtx.fillStyle = gradient;
            fowCtx.beginPath();
            fowCtx.arc(hd.position.x, hd.position.y, visionRadius, 0, Math.PI * 2);
            fowCtx.fill();
        }
    });

    // Add blue edge glow to the cutouts by drawing over them on the main canvas
    ctx.globalCompositeOperation = 'screen';
    gameState.helldivers.forEach(hd => {
        if (hd.isDead) return;
        const gradient = ctx.createRadialGradient(
            hd.position.x, hd.position.y, 180,
            hd.position.x, hd.position.y, 250
        );
        gradient.addColorStop(0, 'rgba(0, 150, 255, 0)');
        gradient.addColorStop(0.8, 'rgba(0, 150, 255, 0.15)');
        gradient.addColorStop(1, 'rgba(0, 150, 255, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(hd.position.x, hd.position.y, 250, 0, Math.PI*2);
        ctx.fill();
    });
    ctx.globalCompositeOperation = 'source-over';


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
    <div className="absolute inset-0 overflow-hidden bg-zinc-950 flex items-center justify-center pointer-events-none">
      <div className="relative w-full h-full">
        {/* Background smoky texture simulation */}
        <div className="absolute inset-0 bg-cover bg-center opacity-30" style={{ backgroundImage: 'radial-gradient(circle at center, transparent 0%, #000 100%)' }} />

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ width: MAP_WIDTH, height: MAP_HEIGHT, transform: 'scale(1)' }}>
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
    </div>
  );
};
