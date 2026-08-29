// --- CONFIG FILE ---
const CONFIG = {
    gameState: 'START',
    currentLevel: 1,
    levelTwoThreshold: 30,
    levelThreeThreshold: 60, // Score threshold or trigger for Level 3
    score: 0,
    passengersRescued: 0,
    planeIntegrity: 100,
    fireTimer: 0,
    fireSpreadProgress: 0,
    passengers: [],
    particles: [],
    planeDebris: [], // Array for falling plane pieces and shadows in Level 3
    extinguisher: { x: 105, y: 180, isCarried: false, onWall: true, charges: 25, respawnTimer: 0 },
    repairKit: { x: 500, y: 250, active: false, spawnTimer: 0 },
    activeInputs: { xDir: 0, yDir: 0, actionTriggered: false, shiftPressed: false, facingDir: 'right' },
    playerName: "CAPTAIN",
    highScores: [
        { name: "ACE", score: 5000, rescued: 20 },
        { name: "BOB", score: 4200, rescued: 16 },
        { name: "SUE", score: 3800, rescued: 14 },
        { name: "DAN", score: 3100, rescued: 11 },
        { name: "ZAC", score: 2500, rescued: 9 },
        { name: "KIM", score: 2000, rescued: 7 },
        { name: "LIZ", score: 1000, rescued: 3 },
        { name: "BOY", score: 500, rescued: 1 },
        { name: "NEW", score: 100, rescued: 0 }
    ]
};

let gameState = CONFIG.gameState;
let currentLevel = CONFIG.currentLevel;
const levelTwoThreshold = CONFIG.levelTwoThreshold;
const levelThreeThreshold = CONFIG.levelThreeThreshold;
let score = CONFIG.score;
let passengersRescued = CONFIG.passengersRescued;
let planeIntegrity = CONFIG.planeIntegrity;
let fireTimer = CONFIG.fireTimer;
let fireSpreadProgress = CONFIG.fireSpreadProgress;
let passengers = CONFIG.passengers;
let particles = CONFIG.particles;
let planeDebris = CONFIG.planeDebris;
let extinguisher = CONFIG.extinguisher;
let repairKit = CONFIG.repairKit;
let activeInputs = CONFIG.activeInputs;
let playerName = CONFIG.playerName;
let highScores = CONFIG.highScores;

// Load saved high scores from localStorage if available
try {
    const savedScores = localStorage.getItem('panic_high_scores');
    if (savedScores) {
        highScores = JSON.parse(savedScores);
    }
} catch (e) {
    console.log("Could not load local storage high scores");
}

function checkHighScore(finalScore) {
    for (let i = 0; i < highScores.length; i++) {
        if (finalScore > highScores[i].score) {
            return true;
        }
    }
    return highScores.length < 10;
}

function addHighScore(name, finalScore, rescued) {
    highScores.push({ name: name.substring(0, 8).toUpperCase() || "PILOT", score: Math.floor(finalScore), rescued: rescued });
    highScores.sort((a, b) => b.score - a.score);
    if (highScores.length > 10) {
        highScores = highScores.slice(0, 10);
    }
    try {
        localStorage.setItem('panic_high_scores', JSON.stringify(highScores));
    } catch (e) {}
}