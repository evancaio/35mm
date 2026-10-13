// Sistema de Áudio Procedural usando Web Audio API
// Elimina necessidade de arquivos de áudio externos, evitando falhas de carregamento e latência.

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.muted = localStorage.getItem("roleta_muted") === "true";
    this.initialized = false;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.initialized = true;
      }
    } else if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    localStorage.setItem("roleta_muted", this.muted);
    return this.muted;
  }

  isMuted() {
    return this.muted;
  }

  // Clique de catraca mecânica/ponteiro da roleta
  playTick(pitchRatio = 1.0) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      // Ruído metálico/madeira vintage
      osc.type = "triangle";
      const baseFreq = 420 + Math.random() * 80;
      osc.frequency.setValueAtTime(baseFreq * pitchRatio, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.035);

      filter.type = "bandpass";
      filter.frequency.setValueAtTime(1200, this.ctx.currentTime);
      filter.Q.setValueAtTime(3, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.035);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(this.ctx.currentTime);
      osc.stop(this.ctx.currentTime + 0.04);
    } catch (e) {
      console.warn("Audio error:", e);
    }
  }

  // Início do giro - Som de engrenagem / motor mecânico
  playSpinStart() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(110, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(320, this.ctx.currentTime + 0.28);

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(this.ctx.currentTime);
      osc.stop(this.ctx.currentTime + 0.32);
    } catch (e) {
      console.warn("Audio error:", e);
    }
  }

  // Clique de botão físico estilo projetor/máquina vintage
  playButtonClick() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "square";
      osc.frequency.setValueAtTime(240, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(60, this.ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.06);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(this.ctx.currentTime);
      osc.stop(this.ctx.currentTime + 0.07);
    } catch (e) {
      console.warn("Audio error:", e);
    }
  }

  // Revelação cinematográfica: acorde triunfal caloroso
  playWinFanfare() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const chords = [
        [220, 277.18, 329.63, 440], // A Major
        [293.66, 369.99, 440, 587.33] // D Major
      ];

      const now = this.ctx.currentTime;

      // Primeiro sino
      chords[0].forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + idx * 0.03);

        gain.gain.setValueAtTime(0.08, now + idx * 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + idx * 0.03);
        osc.stop(now + 1.3);
      });

      // Acorde cinematográfico brilhante em crescendo
      setTimeout(() => {
        if (!this.ctx) return;
        const chimeNow = this.ctx.currentTime;
        chords[1].forEach((freq) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = "triangle";
          osc.frequency.setValueAtTime(freq, chimeNow);

          gain.gain.setValueAtTime(0.1, chimeNow);
          gain.gain.exponentialRampToValueAtTime(0.0001, chimeNow + 1.6);

          osc.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start(chimeNow);
          osc.stop(chimeNow + 1.8);
        });
      }, 250);

    } catch (e) {
      console.warn("Audio error:", e);
    }
  }
}

// Instância global de áudio
const soundEngine = new SoundEngine();
window.soundEngine = soundEngine;
