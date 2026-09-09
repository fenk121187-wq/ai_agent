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
    ctx.fillStyle = '#05070a'; // Darker, more contrast
    ctx.fillRect(0, 0, MAP_WIDTH, MAP_HEIGHT);

    // Draw Tactical Grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x <= MAP_WIDTH; x += 100) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, MAP_HEIGHT);
    }
    for (let y = 0; y <= MAP_HEIGHT; y += 100) {
      ctx.moveTo(0, y);
      ctx.lineTo(MAP_WIDTH, y);
    }
    ctx.stroke();

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

    // Render Enemies (Glowing Red Triangles / Bug marks - visible in fog handled later, but drawn here)
    gameState.enemies.forEach(enemy => {
        if (enemy.health <= 0) return;

        ctx.shadowBlur = 15;
        ctx.shadowColor = '#ff0033';
        ctx.fillStyle = '#ff1133';

        // Sharp triangle facing down/center
        ctx.beginPath();
        ctx.moveTo(enemy.position.x, enemy.position.y - 6);
        ctx.lineTo(enemy.position.x + 6, enemy.position.y + 6);
        ctx.lineTo(enemy.position.x - 6, enemy.position.y + 6);
        ctx.closePath();
        ctx.fill();

        // Inner bright core
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(enemy.position.x, enemy.position.y - 1);
        ctx.lineTo(enemy.position.x + 2, enemy.position.y + 3);
        ctx.lineTo(enemy.position.x - 2, enemy.position.y + 3);
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

      // Directional Vision Arc Hint
      ctx.beginPath();
      ctx.arc(hd.position.x, hd.position.y, 30, -Math.PI*0.8, -Math.PI*0.2);
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.3)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Hexagon icon background
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#00f0ff';
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 2;
      ctx.fillStyle = 'rgba(0, 240, 255, 0.15)';

      const size = 16;
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

      // Inner chevron
      ctx.fillStyle = '#ffffff';
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(hd.position.x, hd.position.y - 6);
      ctx.lineTo(hd.position.x + 6, hd.position.y + 4);
      ctx.lineTo(hd.position.x, hd.position.y + 2);
      ctx.lineTo(hd.position.x - 6, hd.position.y + 4);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;

      // Draw Name tag
      ctx.fillStyle = '#00f0ff';
      ctx.font = 'bold 12px "Rajdhani", sans-serif';
      ctx.textAlign = 'center';
      (ctx as any).letterSpacing = '1px'; // Handle type check gracefully

      ctx.fillText(hd.name, hd.position.x, hd.position.y - 35);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.font = '10px "Rajdhani", sans-serif';
      ctx.fillText("HELLDIVER", hd.position.x, hd.position.y - 22);
      (ctx as any).letterSpacing = '0px';
    });

    // --- RENDER FOG OF WAR LAYER ---
    fowCtx.globalCompositeOperation = 'source-over';
    fowCtx.clearRect(0, 0, MAP_WIDTH, MAP_HEIGHT);

    // Create a deeply atmospheric smoky/cloudy background
    // We'll use a very dark blue/black base to match a premium tactical map
    fowCtx.fillStyle = 'rgba(4, 7, 12, 0.98)';
    fowCtx.fillRect(0, 0, MAP_WIDTH, MAP_HEIGHT);

    // Overlay scanlines on the fog itself before cutting it out
    fowCtx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    for (let y = 0; y < MAP_HEIGHT; y += 4) {
      fowCtx.fillRect(0, y, MAP_WIDTH, 1);
    }

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

    // Add glowing tech edge to the cutouts by drawing over them on the main canvas
    ctx.globalCompositeOperation = 'screen';
    gameState.helldivers.forEach(hd => {
        if (hd.isDead) return;
        const gradient = ctx.createRadialGradient(
            hd.position.x, hd.position.y, 150,
            hd.position.x, hd.position.y, 250
        );
        gradient.addColorStop(0, 'rgba(0, 240, 255, 0)');
        gradient.addColorStop(0.9, 'rgba(0, 240, 255, 0.1)');
        gradient.addColorStop(1, 'rgba(0, 240, 255, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(hd.position.x, hd.position.y, 250, 0, Math.PI*2);
        ctx.fill();

        // A faint inner ring for tactical feel
        ctx.beginPath();
        ctx.arc(hd.position.x, hd.position.y, 150, 0, Math.PI*2);
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.05)';
        ctx.lineWidth = 1;
        ctx.stroke();
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
    <div className="absolute inset-0 overflow-hidden bg-[#030508] flex items-center justify-center pointer-events-none">
      <div className="relative w-full h-full">
        {/* Deep map vignette */}
        <div className="absolute inset-0 bg-cover bg-center z-20 opacity-80" style={{ backgroundImage: 'radial-gradient(circle at center, transparent 30%, #000 100%)' }} />

        {/* CRT Scanline Overlay */}
        <div className="absolute inset-0 z-30 opacity-10 pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'repeating-linear-gradient(transparent, transparent 2px, rgba(0,0,0,0.8) 2px, rgba(0,0,0,0.8) 4px)' }} />

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
