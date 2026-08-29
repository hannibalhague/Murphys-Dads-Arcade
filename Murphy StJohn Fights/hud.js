// =================================================================
//   HUD RENDERER SCRIPT (UPDATED TO "PIT THROWS")
// =================================================================
const HUD = {
    draw(ctx, player, level, paused, score, levelTimer, highScores, isGameOver, pitThrowsCount, lives) {
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0); // Render HUD in absolute screen space

        // 1. Health Bar & Stamina
        const barX = 20;
        const barY = 20;
        const barWidth = 200;
        const barHeight = 16;

        // Background container
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(barX - 4, barY - 4, barWidth + 8, barHeight + 35);

        // HP Label & Bar
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText(`HP (${player.name})`, barX, barY + 12);

        ctx.fillStyle = '#4a5568';
        ctx.fillRect(barX, barY + 16, barWidth, barHeight);

        const hpPercent = Math.max(0, player.health / player.maxHealth);
        ctx.fillStyle = hpPercent > 0.25 ? '#48bb78' : '#e53e3e';
        ctx.fillRect(barX, barY + 16, barWidth * hpPercent, barHeight);

        ctx.strokeStyle = '#2d3748';
        ctx.lineWidth = 2;
        ctx.strokeRect(barX, barY + 16, barWidth, barHeight);

        // Lives Indicator (Hearts / Icons)
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText('LIVES:', barX, barY + 44);

        for (let i = 0; i < Math.max(0, lives); i++) {
            ctx.fillStyle = '#e53e3e';
            ctx.beginPath();
            const hx = barX + 45 + (i * 18);
            const hy = barY + 40;
            ctx.arc(hx, hy, 6, 0, Math.PI * 2);
            ctx.fill();
        }

        // 2. Score & Level / Timer Board (Top Right)
        const screenWidth = ctx.canvas.width;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(screenWidth - 230, 20, 210, 55);

        ctx.fillStyle = '#e2e8f0';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText(`LEVEL: ${level}`, screenWidth - 220, barY + 14);
        ctx.fillText(`SCORE: ${score}`, screenWidth - 120, barY + 14);

        const mins = Math.floor(Math.max(0, levelTimer) / 60);
        const secs = Math.floor(Math.max(0, levelTimer) % 60);
        const timeStr = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
        
        ctx.fillStyle = levelTimer < 10 ? '#fc8181' : '#e2e8f0';
        ctx.fillText(`TIME: ${timeStr}`, screenWidth - 220, barY + 36);
        ctx.fillText(`PIT THROWS: ${pitThrowsCount}`, screenWidth - 120, barY + 36);

        // 3. Pause Screen Overlay
        if (paused) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
            ctx.fillRect(0, 0, screenWidth, ctx.canvas.height);

            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 36px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('GAME PAUSED', screenWidth / 2, ctx.canvas.height / 2 - 20);

            ctx.font = '16px sans-serif';
            ctx.fillStyle = '#cbd5e0';
            ctx.fillText('Press P or Start Button to Resume', screenWidth / 2, ctx.canvas.height / 2 + 20);
            ctx.textAlign = 'left'; // Reset alignment
        }

        // 4. Game Over / High Scores Screen
        if (isGameOver) {
            ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
            ctx.fillRect(0, 0, screenWidth, ctx.canvas.height);

            ctx.fillStyle = '#e53e3e';
            ctx.font = 'bold 36px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('GAME OVER', screenWidth / 2, ctx.canvas.height / 2 - 70);

            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 16px sans-serif';
            ctx.fillText(`Final Score: ${score}`, screenWidth / 2, ctx.canvas.height / 2 - 30);

            ctx.fillStyle = '#cbd5e0';
            ctx.font = '14px sans-serif';
            ctx.fillText('--- HIGH SCORES ---', screenWidth / 2, ctx.canvas.height / 2);

            if (highScores && highScores.length > 0) {
                highScores.forEach((hs, index) => {
                    ctx.fillText(`${index + 1}. ${hs}`, screenWidth / 2, ctx.canvas.height / 2 + 22 + (index * 18));
                });
            }

            ctx.fillStyle = '#38bdf8';
            ctx.font = 'bold 15px sans-serif';
            ctx.fillText('Press ENTER or Back Button to Restart', screenWidth / 2, ctx.canvas.height / 2 + 125);
            ctx.textAlign = 'left'; // Reset alignment
        }

        ctx.restore();
    }
};