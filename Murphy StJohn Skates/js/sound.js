// =======================
// js/sound.js - FINAL SHUFFLE PLAYLIST (TRACKS 1-5 & DEFAULT)
// =======================
window.Sound = {
    sfx: {},
    music: {},
    currentMusic: null,
    fadeTime: 600,
    playlist: ['1', '2', '3', '4', '5'],
    playlistIndex: 0,
    isShuffle: true,

    shufflePlaylist() {
        for (let i = this.playlist.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.playlist[i], this.playlist[j]] = [this.playlist[j], this.playlist[i]];
        }
    },

    loadSFX(name, src, volume = 1.0) {
        const a = new Audio(src);
        a.volume = volume;
        this.sfx[name] = a;
    },

    play(name, { pitchMin = 0.95, pitchMax = 1.05 } = {}) {
        const base = this.sfx[name];
        if (!base) return;

        const clone = base.cloneNode();
        clone.volume = base.volume;
        clone.playbackRate = pitchMin + Math.random() * (pitchMax - pitchMin);
        
        clone.play().catch(e => {});
    },

    loadMusic(name, src, volume = 0.8) {
        const a = new Audio(src);
        a.loop = false; // Required so 'ended' triggers automatically

        a.addEventListener('ended', () => {
            this.playNextInPlaylist();
        });

        this.music[name] = { audio: a, targetVol: volume, fadeInterval: null, src: src };
    },

    // Call this function at the start of EVERY game session/match
    startGameMusic() {
        if (this.playlistIndex >= this.playlist.length || this.playlistIndex === 0) {
            this.shufflePlaylist();
            this.playlistIndex = 0;
        }

        const trackName = this.playlist[this.playlistIndex];
        this.playlistIndex++;
        
        this.playMusic(trackName);
    },

    playNextInPlaylist() {
        if (this.playlist.length === 0) return;

        if (this.playlistIndex >= this.playlist.length) {
            this.shufflePlaylist();
            this.playlistIndex = 0;
        }

        const trackName = this.playlist[this.playlistIndex];
        this.playlistIndex++;

        this.playMusic(trackName);
    },

    playMusic(name) {
        if (this.currentMusic === name && this.music[name] && !this.music[name].audio.paused) return;

        const next = this.music[name];
        if (!next) {
            if (this.music['default']) {
                this.playMusic('default');
            } else {
                console.warn(`Music track not found: ${name}`);
            }
            return;
        }

        if (next.fadeInterval) {
            clearInterval(next.fadeInterval);
            next.fadeInterval = null;
        }

        const prev = this.music[this.currentMusic];
        this.currentMusic = name;

        if (prev && prev.audio !== next.audio) {
            const p = prev.audio;
            if (prev.fadeInterval) clearInterval(prev.fadeInterval);

            prev.fadeInterval = setInterval(() => {
                p.volume = Math.max(0, p.volume - 0.05);
                if (p.volume <= 0) {
                    p.pause();
                    clearInterval(prev.fadeInterval);
                    prev.fadeInterval = null;
                }
            }, this.fadeTime / 20);
        }

        const n = next.audio;
        n.currentTime = 0;
        const target = next.targetVol;
        n.volume = 0;

        const playPromise = n.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                next.fadeInterval = setInterval(() => {
                    n.volume = Math.min(target, n.volume + 0.05);
                    if (n.volume >= target) {
                        n.volume = target;
                        clearInterval(next.fadeInterval);
                        next.fadeInterval = null;
                    }
                }, this.fadeTime / 20);
            }).catch(error => {
                const unlockAudio = () => {
                    n.play().then(() => {
                        window.removeEventListener('click', unlockAudio);
                        window.removeEventListener('keydown', unlockAudio);
                    }).catch(e => {});
                };
                window.addEventListener('click', unlockAudio);
                window.addEventListener('keydown', unlockAudio);
            });
        }
    }
};