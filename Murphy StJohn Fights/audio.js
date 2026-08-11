// =================================================================
//   AUDIO MANAGER (MUTED ON LAUNCH, MANUAL TOGGLE ONLY)
// =================================================================
class AudioManager {
    constructor() {
        this.isMuted = true; // Start muted completely on launch
        this.audioCtx = null;
        this.isInitialized = false;
        
        const originalPlaylist = [
            'music/1.mp3',
            'music/2.mp3',
            'music/3.mp3',
            'music/4.mp3'
        ];

        this.playlist = [...originalPlaylist];
        for (let i = this.playlist.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.playlist[i], this.playlist[j]] = [this.playlist[j], this.playlist[i]];
        }

        this.currentTrackIndex = 0;
        this.bgMusic = new Audio(this.playlist[this.currentTrackIndex]);
        this.bgMusic.volume = 0.5;

        this.bgMusic.addEventListener('ended', () => {
            this.nextTrack();
        });

        // Create a compact, mobile-friendly on-screen UI button positioned safely below the health HUD
        window.addEventListener('DOMContentLoaded', () => {
            const musicBtn = document.createElement('button');
            musicBtn.id = 'musicToggleBtn';
            musicBtn.innerText = '🔇 OFF'; // Reflect initial muted state
            musicBtn.style.position = 'fixed';
            musicBtn.style.top = '82px';  // Placed below health bar container
            musicBtn.style.left = '20px'; // Aligned with the left edge of the HUD
            musicBtn.style.zIndex = '999999';
            musicBtn.style.padding = '4px 8px';
            musicBtn.style.background = 'rgba(20, 20, 20, 0.85)';
            musicBtn.style.color = '#ff4757';
            musicBtn.style.border = '1.5px solid #ff4757';
            musicBtn.style.borderRadius = '4px';
            musicBtn.style.cursor = 'pointer';
            musicBtn.style.fontWeight = 'bold';
            musicBtn.style.fontFamily = 'sans-serif';
            musicBtn.style.fontSize = '10px';
            musicBtn.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
            musicBtn.style.transition = 'all 0.1s ease';

            musicBtn.onclick = (e) => {
                e.stopPropagation();
                this.initAudioEngine();
                const isNowMuted = this.toggleMute();
                if (isNowMuted) {
                    musicBtn.innerText = '🔇 OFF';
                    musicBtn.style.color = '#ff4757';
                    musicBtn.style.borderColor = '#ff4757';
                } else {
                    musicBtn.innerText = '🎵 ON';
                    musicBtn.style.color = '#2ed573';
                    musicBtn.style.borderColor = '#2ed573';
                }
            };

            document.body.appendChild(musicBtn);
        });
    }

    initAudioEngine() {
        if (this.isInitialized) return;
        this.isInitialized = true;

        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext && !this.audioCtx) {
            this.audioCtx = new AudioContext();
        }
    }

    playMusic() {
        if (this.isMuted) return;
        this.bgMusic.play().catch(e => {
            console.log("Music play waiting for interaction:", e);
        });
    }

    toggleMusic() {
        if (this.bgMusic.paused) {
            this.playMusic();
        } else {
            this.bgMusic.pause();
        }
    }

    nextTrack() {
        this.currentTrackIndex = (this.currentTrackIndex + 1) % this.playlist.length;
        this.bgMusic.src = this.playlist[this.currentTrackIndex];
        this.playMusic();
    }

    stopMusic() {
        this.bgMusic.pause();
        this.bgMusic.currentTime = 0;
    }

    playHit() {
        if (this.isMuted) return;
        this.triggerSynthSound(180, 50, 0.1, 'square');
    }

    playKick() {
        if (this.isMuted) return;
        this.triggerSynthSound(120, 30, 0.15, 'triangle');
    }

    playJump() {
        if (this.isMuted) return;
        this.triggerSynthSound(150, 450, 0.12, 'sine');
    }

    playDeath() {
        if (this.isMuted) return;
        this.triggerSynthSound(400, 20, 0.8, 'sawtooth');
    }

    triggerSynthSound(startFreq, endFreq, duration, type) {
        try {
            if (!this.audioCtx) {
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                this.audioCtx = new AudioContext();
            }
            if (this.audioCtx.state === 'suspended') {
                this.audioCtx.resume();
            }

            let osc = this.audioCtx.createOscillator();
            let gainNode = this.audioCtx.createGain();

            osc.type = type;
            osc.frequency.setValueAtTime(startFreq, this.audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(Math.max(endFreq, 1), this.audioCtx.currentTime + duration);

            gainNode.gain.setValueAtTime(0.4, this.audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + duration);

            osc.connect(gainNode);
            gainNode.connect(this.audioCtx.destination);

            osc.start();
            osc.stop(this.audioCtx.currentTime + duration);
        } catch (e) {
            // Ignore context blocks
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.isMuted) {
            this.bgMusic.pause();
        } else {
            this.playMusic();
        }
        return this.isMuted;
    }
}

// Global audio manager instance
const audioManager = new AudioManager();