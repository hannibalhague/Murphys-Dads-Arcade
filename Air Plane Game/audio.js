// --- AUDIO FILE (Using mp3/1.mp3 with pause/resume & NPC .wav voice lines in sfx/) ---
let audioCtx = null;
let musicInterval = null;

let soundEnabled = true;
let musicEnabled = true;
let isMuted = false;

// Dedicated HTML5 Audio element pointing to mp3 folder
const bgmAudio = new Audio('mp3/1.mp3');
bgmAudio.loop = true;
bgmAudio.volume = 0.5; // Adjust volume level (0.0 to 1.0)

function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
}

function toggleSound() {
    if (isMuted) return soundEnabled;
    soundEnabled = !soundEnabled;
    return soundEnabled;
}

function toggleMusic() {
    if (isMuted) return musicEnabled;
    musicEnabled = !musicEnabled;
    if (!musicEnabled) {
        pauseBGM();
    } else if (typeof gameState !== 'undefined' && gameState === 'PLAYING') {
        startBGM();
    }
    return musicEnabled;
}

function toggleMasterMute() {
    isMuted = !isMuted;
    soundEnabled = !isMuted;
    musicEnabled = !isMuted;
    
    const muteBtn = document.getElementById('btn-mute');
    if (muteBtn) {
        if (isMuted) {
            muteBtn.textContent = '🔇 MUTED';
            muteBtn.classList.add('muted');
        } else {
            muteBtn.textContent = '🔊 AUDIO: ON';
            muteBtn.classList.remove('muted');
        }
    }

    if (isMuted) {
        pauseBGM();
    } else if (typeof gameState !== 'undefined' && gameState === 'PLAYING') {
        startBGM();
    }
    return isMuted;
}

// Bind mute button pointer events for mouse and touch screen support
window.addEventListener('DOMContentLoaded', () => {
    const muteBtn = document.getElementById('btn-mute');
    if (muteBtn) {
        muteBtn.addEventListener('pointerdown', (e) => {
            e.preventDefault();
            e.stopPropagation();
            initAudio();
            toggleMasterMute();
        });
    }
});

// Play character-specific .wav sound effects from the sfx folder labeled by name
function playNpcSound(npcName) {
    if (!soundEnabled || !npcName) return;
    
    let audioPath = `sfx/${npcName}.wav`;
    const npcAudio = new Audio(audioPath);
    npcAudio.volume = 0.8;
    npcAudio.play().catch(error => {
        console.log(`SFX file ${audioPath} not found or playback blocked:`, error);
    });
}

function playSound(type) {
    if (!soundEnabled || !audioCtx) return;
    
    // Disable annoying alarm sound completely as requested
    if (type === 'alarm') return;

    let now = audioCtx.currentTime;

    if (type === 'grab') {
        let osc = audioCtx.createOscillator();
        let gain = audioCtx.createGain();

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.15);

        gain.gain.setValueAtTime(0.01, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

        osc.start(now);
        osc.stop(now + 0.18);

    } else if (type === 'throw') {
        let osc = audioCtx.createOscillator();
        let gain = audioCtx.createGain();

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(220, now + 0.2);

        gain.gain.setValueAtTime(0.01, now); 
        gain.gain.linearRampToValueAtTime(0.0001, now + 0.2);

        osc.start(now);
        osc.stop(now + 0.2);

    } else if (type === 'extinguish') {
        let bufferSize = audioCtx.sampleRate * 0.2;
        let buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        let output = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }

        let whiteNoise = audioCtx.createBufferSource();
        whiteNoise.buffer = buffer;

        let filter = audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(600, now);

        let gain = audioCtx.createGain();
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.2);

        whiteNoise.connect(filter);
        filter.connect(gain);
        gain.connect(audioCtx.destination);

        whiteNoise.start(now);
        whiteNoise.stop(now + 0.2);

    } else if (type === 'gameover') {
        let osc1 = audioCtx.createOscillator();
        let osc2 = audioCtx.createOscillator();
        let gain = audioCtx.createGain();

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(audioCtx.destination);

        osc1.type = 'sine';
        osc2.type = 'triangle';

        osc1.frequency.setValueAtTime(329.63, now);
        osc1.frequency.setValueAtTime(293.66, now + 0.3);
        osc1.frequency.linearRampToValueAtTime(220.00, now + 1.0);

        osc2.frequency.setValueAtTime(246.94, now);
        osc2.frequency.setValueAtTime(196.00, now + 0.3);
        osc2.frequency.linearRampToValueAtTime(164.81, now + 1.0);

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.0);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 1.0);
        osc2.stop(now + 1.0);
    }
}

function startBGM() {
    if (!musicEnabled) return;
    
    bgmAudio.play().catch(error => {
        console.log("Autoplay blocked or mp3/1.mp3 file path not found:", error);
    });
}

function pauseBGM() {
    bgmAudio.pause(); // Pauses without resetting currentTime, so it resumes where it left off
}

function stopBGM() {
    bgmAudio.pause();
    bgmAudio.currentTime = 0; // Use this only if you want a complete reset
}