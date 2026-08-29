// --- PLANE FILE ---
if (typeof cloudOffset === 'undefined') {
    var cloudOffset = 0;
}
if (typeof flyingNPCs === 'undefined') {
    var flyingNPCs = [];
}

if (typeof seatSlots === 'undefined') {
    var seatSlots = [
        { x: 180, y: 100, row: 1 },
        { x: 280, y: 100, row: 1 },
        { x: 380, y: 100, row: 1 },
        { x: 480, y: 100, row: 1 },
        { x: 580, y: 100, row: 1 },
        { x: 680, y: 100, row: 1 },

        { x: 180, y: 160, row: 2 },
        { x: 280, y: 160, row: 2 },
        { x: 380, y: 160, row: 2 },
        { x: 480, y: 160, row: 2 },
        { x: 580, y: 160, row: 2 },
        { x: 680, y: 160, row: 2 },

        { x: 180, y: 310, row: 3 },
        { x: 280, y: 310, row: 3 },
        { x: 380, y: 310, row: 3 },
        { x: 480, y: 310, row: 3 },
        { x: 580, y: 310, row: 3 },
        { x: 680, y: 310, row: 3 },

        { x: 180, y: 370, row: 4 },
        { x: 280, y: 370, row: 4 },
        { x: 380, y: 370, row: 4 },
        { x: 480, y: 370, row: 4 },
        { x: 580, y: 370, row: 4 },
        { x: 680, y: 370, row: 4 }
    ];
}

function drawPlaneBackground(ctx) {
    let emergency = getCurrentEmergency();

    // Outer backdrop / sky outside windows
    ctx.fillStyle = "#020408";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    cloudOffset += 0.5;
    if (cloudOffset > 1000) cloudOffset = 0;

    // Main cabin interior background (Authentic passenger-cabin gray)
    ctx.fillStyle = "#94a3b8";
    ctx.fillRect(80, 35, 750, 430);

    // Subtle ambient shadow tone for the cabin structure
    ctx.fillStyle = "#64748b";
    ctx.fillRect(80, 35, 750, 430);

    // Center Aisle Flooring
    ctx.fillStyle = "#475569";
    ctx.fillRect(100, 235, 680, 20);

    ctx.strokeStyle = "#334155";
    ctx.lineWidth = 1;
    for (let ax = 120; ax < 780; ax += 30) {
        ctx.beginPath();
        ctx.moveTo(ax, 235);
        ctx.lineTo(ax, 255);
        ctx.stroke();
    }

    // Aisle boundary outline lines running along the top and bottom of the center walkway
    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(100, 235);
    ctx.lineTo(780, 235);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(100, 255);
    ctx.lineTo(780, 255);
    ctx.stroke();

    // Overhead Bins / Cabin Ceiling Panels
    ctx.fillStyle = "#64748b";
    ctx.fillRect(80, 35, 750, 25);
    
    ctx.fillStyle = "#94a3b8";
    ctx.fillRect(150, 42, 540, 6);

    // Row divider lines
    ctx.strokeStyle = "#334155";
    ctx.lineWidth = 2;
    
    for (let rx = 170; rx < 730; rx += 100) {
        ctx.beginPath();
        ctx.moveTo(rx, 90);
        ctx.lineTo(rx + 52, 90);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(rx, 210);
        ctx.lineTo(rx + 52, 210);
        ctx.stroke();
    }

    for (let rx = 170; rx < 730; rx += 100) {
        ctx.beginPath();
        ctx.moveTo(rx, 300);
        ctx.lineTo(rx + 52, 300);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(rx, 420);
        ctx.lineTo(rx + 52, 420);
        ctx.stroke();
    }

    // Draw Passenger Seats
    for (let slot of seatSlots) {
        drawEnhancedFuturisticChair(ctx, slot.x, slot.y);
    }

    // Windows with moving clouds (Made bigger and taller)
    for (let wx = 140; wx < 780; wx += 105) {
        // Top row windows frame
        ctx.fillStyle = "#64748b";
        ctx.fillRect(wx - 4, 55, 56, 44);
        
        ctx.save();
        ctx.beginPath();
        ctx.rect(wx, 59, 48, 36);
        ctx.clip();

        ctx.fillStyle = "#0ea5e9";
        ctx.fillRect(wx, 59, 48, 36);

        ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
        for (let c = -2; c < 4; c++) {
            let cx = (wx + (c * 90) - (cloudOffset % 90));
            ctx.fillRect(cx, 69, 30, 12);
            ctx.fillRect(cx + 6, 64, 18, 7);
        }
        ctx.restore();

        // Bottom row windows frame
        ctx.fillStyle = "#64748b";
        ctx.fillRect(wx - 4, 406, 56, 32);
        
        ctx.save();
        ctx.beginPath();
        ctx.rect(wx, 410, 48, 24);
        ctx.clip();

        ctx.fillStyle = "#0ea5e9";
        ctx.fillRect(wx, 410, 48, 24);

        ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
        for (let c = -2; c < 4; c++) {
            let cx = (wx + (c * 90) - (cloudOffset % 90));
            ctx.fillRect(cx, 417, 28, 10);
            ctx.fillRect(cx + 5, 413, 16, 6);
        }
        ctx.restore();
    }

    // Rear bulkhead door / exit area
    ctx.fillStyle = "#64748b";
    ctx.fillRect(830, 35, 15, 430);
    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 2;
    ctx.strokeRect(830, 35, 15, 430);
    
    ctx.fillStyle = "#334155";
    ctx.fillRect(835, 220, 5, 40);
    ctx.fillStyle = "#22c55e";
    ctx.fillRect(837, 210, 2, 6);

    // Front Cockpit / Cargo Area transition
    ctx.fillStyle = "#020617";
    ctx.fillRect(20, 120, 60, 260);

    ctx.fillStyle = "rgba(56, 189, 248, 0.4)";
    ctx.fillRect(25, 130 + ((cloudOffset * 6) % 220), 45, 4);
    ctx.fillRect(30, 200 + ((cloudOffset * 8) % 180), 35, 3);
    ctx.fillRect(25, 290 + ((cloudOffset * 7) % 200), 40, 4);

    ctx.fillStyle = "#475569";
    ctx.fillRect(15, 115, 10, 270); 
    ctx.fillRect(75, 115, 10, 270); 
    ctx.fillRect(15, 110, 70, 10);  
    ctx.fillRect(15, 380, 70, 10);  

    ctx.fillStyle = "#334155";
    ctx.fillRect(17, 120, 6, 260);
    ctx.fillStyle = "#64748b";
    for (let ry = 130; ry < 370; ry += 25) {
        ctx.fillRect(19, ry, 2, 2);
        ctx.fillRect(79, ry, 2, 2);
    }

    ctx.fillStyle = "#64748b";
    ctx.fillRect(45, 102, 6, 12);
    ctx.fillRect(45, 386, 6, 12);
    ctx.fillStyle = "#94a3b8";
    ctx.fillRect(47, 104, 2, 8);
    ctx.fillRect(47, 388, 2, 8);

    for (let sx = 22; sx < 75; sx += 8) {
        ctx.fillStyle = "#eab308";
        ctx.fillRect(sx, 382, 4, 6);
        ctx.fillStyle = "#0f172a";
        ctx.fillRect(sx + 4, 382, 2, 6);
    }

    let flash = Math.floor(Date.now() / 250) % 2 === 0;
    ctx.fillStyle = flash ? "#ef4444" : "#f97316";
    ctx.fillRect(42, 112, 12, 6);
    
    ctx.fillStyle = "#16a34a";
    ctx.fillRect(30, 92, 36, 16);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 8px 'Segoe UI'";
    ctx.fillText("CARGO RAMP", 33, 103);

    if (extinguisher.onWall) {
        ctx.fillStyle = "#dc2626";
        ctx.fillRect(extinguisher.x, extinguisher.y, 14, 26);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(extinguisher.x + 4, extinguisher.y + 4, 6, 12);
        ctx.fillStyle = "#000000";
        ctx.fillRect(extinguisher.x + 5, extinguisher.y + 26, 4, 5);
    } else if (extinguisher.respawnTimer > 0) {
        ctx.strokeStyle = "rgba(220, 38, 38, 0.4)";
        ctx.lineWidth = 2;
        ctx.strokeRect(extinguisher.x, extinguisher.y, 14, 26);
    }
    
    if (repairKit.active) {
        ctx.fillStyle = "#10b981";
        ctx.fillRect(repairKit.x, repairKit.y, 22, 16);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(repairKit.x + 9, repairKit.y + 3, 4, 10);
        ctx.fillRect(repairKit.x + 5, repairKit.y + 6, 12, 4);

        ctx.fillStyle = "#34d399";
        ctx.font = "bold 9px 'Segoe UI'";
        ctx.textAlign = "center";
        ctx.fillText("REPAIR KIT", repairKit.x + 11, repairKit.y - 4);
        ctx.textAlign = "left";
    }

    emergency.drawEffect(ctx);
}

function drawEnhancedFuturisticChair(ctx, x, y) {
    // Chair support legs / base frame
    ctx.fillStyle = "#334155";
    ctx.fillRect(x - 6, y + 6, 8, 30);
    ctx.fillStyle = "#475569"; 
    ctx.fillRect(x - 4, y + 10, 4, 4);

    // Detailed Passenger Seat Base Cushion (Darker, richer airline blue)
    ctx.fillStyle = "#0284c7"; 
    ctx.fillRect(x, y, 32, 40);
    
    ctx.strokeStyle = "#0369a1";
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, 32, 40);

    // Seat Cushion Shading / Highlight for 3D depth
    ctx.fillStyle = "#0ea5e9";
    ctx.fillRect(x + 2, y + 2, 28, 6);

    // Seat Stitching & Panel Division Lines
    ctx.fillStyle = "#0369a1";
    ctx.fillRect(x + 10, y + 8, 2, 28);
    ctx.fillRect(x + 20, y + 8, 2, 28);
    ctx.fillRect(x + 2, y + 24, 28, 2);

    // Detailed Headrest with border & accent stitch
    ctx.fillStyle = "#0369a1";
    ctx.fillRect(x - 2, y - 6, 36, 8);
    ctx.fillStyle = "#0284c7";
    ctx.fillRect(x, y - 5, 32, 6);
    ctx.fillStyle = "#38bdf8";
    ctx.fillRect(x + 12, y - 3, 8, 2);

    // Detailed Armrests with bevel shading
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(x - 4, y + 12, 4, 24);
    ctx.fillRect(x + 32, y + 12, 4, 24);
    ctx.fillStyle = "#475569";
    ctx.fillRect(x - 3, y + 13, 2, 22);
    ctx.fillRect(x + 33, y + 13, 2, 22);

    // Detailed Seatbelt across the middle of the seat with clasp
    ctx.fillStyle = "#cbd5e1";
    ctx.fillRect(x + 5, y + 18, 22, 3);
    ctx.fillStyle = "#94a3b8";
    ctx.fillRect(x + 5, y + 21, 22, 1);
    ctx.fillStyle = "#f59e0b"; // Metallic Buckle accent
    ctx.fillRect(x + 13, y + 17, 6, 5);
    ctx.fillStyle = "#b45309";
    ctx.fillRect(x + 15, y + 19, 2, 2);
}