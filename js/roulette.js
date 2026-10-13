// Componente da Roleta Cinematográfica — Estilo Dark Minimalist & Awwwards
// Canvas 2D de Alta Resolução (DPR-aware) com física realista de inércia e ticks sonoros

class MovieRoulette {
  constructor(canvasId, options = {}) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext("2d");
    this.options = Object.assign({
      onSpinStart: () => {},
      onSpinTick: () => {},
      onSpinEnd: () => {},
      onPointerDeflect: () => {}
    }, options);

    this.movies = [];
    this.category = null;
    this.currentAngle = 0; // Ângulo em radianos
    this.isSpinning = false;
    this.spinDuration = 6200; // ms de giro
    this.lastPegIndex = -1;
    this.pointerDeflection = 0; // Ângulo de deflexão do ponteiro ao bater nos pinos

    // Paleta contemporânea de carvão e titânio acetinado
    this.palette = [
      { bg: "#131316", text: "#f4f4f5", border: "#222227", num: "#71717a" },
      { bg: "#1a1a1f", text: "#f4f4f5", border: "#27272e", num: "#888892" },
      { bg: "#161619", text: "#f4f4f5", border: "#242429", num: "#71717a" },
      { bg: "#1e1e24", text: "#f4f4f5", border: "#2b2b34", num: "#888892" }
    ];

    this.setupResize();
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  setMovies(movies, category) {
    this.movies = movies || [];
    this.category = category || { themeColor: "#f59e0b" };
    this.numSegments = this.movies.length || 20;
    this.arc = (2 * Math.PI) / this.numSegments;
    if (this.resize) this.resize();
    this.draw();
  }

  setupResize() {
    const resize = () => {
      if (!this.canvas) return;
      const parent = this.canvas.parentElement;
      let width = parent ? parent.getBoundingClientRect().width : 0;
      
      if (!width || width < 50) {
        width = Math.min(window.innerWidth - 48, 540);
      }
      
      const size = Math.max(Math.min(width, 560), 280);
      const dpr = window.devicePixelRatio || 1;
      
      this.canvas.style.width = `${size}px`;
      this.canvas.style.height = `${size}px`;
      this.canvas.width = Math.floor(size * dpr);
      this.canvas.height = Math.floor(size * dpr);
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      this.size = size;
      this.radius = (size / 2) - 16;
      this.draw();
    };

    window.addEventListener("resize", resize);
    this.resize = resize;
    resize();
    setTimeout(resize, 60);
    setTimeout(resize, 220);
  }

  // Disparo do giro com desaceleração exponencial física
  spinToMovie(targetMovieId, onComplete) {
    if (this.isSpinning || this.movies.length === 0) return false;

    let targetIndex = this.movies.findIndex(m => m.id === targetMovieId);
    if (targetIndex === -1) {
      targetIndex = Math.floor(Math.random() * this.movies.length);
    }

    this.isSpinning = true;
    this.options.onSpinStart();
    if (window.soundEngine) window.soundEngine.playSpinStart();

    // O ponteiro fica no topo da roleta (1.5 * PI = 270°)
    const pointerAngle = 1.5 * Math.PI;
    const jitter = (Math.random() - 0.5) * (this.arc * 0.45);
    const segmentCenter = (targetIndex + 0.5) * this.arc + jitter;

    // Número de voltas completas (entre 6 e 9 voltas)
    const extraSpins = 6 + Math.floor(Math.random() * 3);
    const targetNormalized = (pointerAngle - segmentCenter + 2 * Math.PI) % (2 * Math.PI);
    
    const currentNorm = this.currentAngle % (2 * Math.PI);
    let diff = targetNormalized - currentNorm;
    if (diff < 0) diff += 2 * Math.PI;
    const totalRotation = extraSpins * (2 * Math.PI) + diff;

    const startAngle = this.currentAngle;
    const finalAngle = startAngle + totalRotation;
    const startTime = performance.now();
    const duration = this.spinDuration;

    // Easing quintic com transição suave
    const easeOutCustom = (t) => {
      if (t < 0.08) {
        return 0.5 * Math.pow(t / 0.08, 2) * 0.04;
      }
      const p = (t - 0.08) / 0.92;
      return 0.04 + 0.96 * (1 - Math.pow(1 - p, 4.3));
    };

    let lastTickAngle = startAngle;

    const spinStep = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCustom(progress);

      this.currentAngle = startAngle + totalRotation * eased;

      // Detecção de passagem pelos pinos do segmento
      const pegAngle = this.arc;
      const currentSegmentCount = Math.floor(this.currentAngle / pegAngle);
      const lastSegmentCount = Math.floor(lastTickAngle / pegAngle);

      if (currentSegmentCount > lastSegmentCount) {
        const speedRatio = Math.max(0.15, 1 - progress);
        if (window.soundEngine) window.soundEngine.playTick(0.85 + speedRatio * 0.4);
        this.pointerDeflection = (Math.random() * 0.18 + 0.22) * (speedRatio > 0.25 ? 1 : 0.5);
        this.options.onPointerDeflect(this.pointerDeflection);
      }
      lastTickAngle = this.currentAngle;
      this.pointerDeflection *= 0.88;

      if (progress < 1) {
        requestAnimationFrame(spinStep);
      } else {
        this.currentAngle = finalAngle;
        this.isSpinning = false;
        this.pointerDeflection = 0;
        
        const winningMovie = this.movies[targetIndex];
        if (window.soundEngine) window.soundEngine.playWinFanfare();
        if (onComplete) onComplete(winningMovie);
        this.options.onSpinEnd(winningMovie);
      }
    };

    requestAnimationFrame(spinStep);
    return true;
  }

  animate() {
    this.draw();
    if (!this.isSpinning) {
      if (Math.abs(this.pointerDeflection) > 0.001) {
        this.pointerDeflection *= 0.84;
      } else {
        this.pointerDeflection = 0;
      }
    }
    requestAnimationFrame(this.animate);
  }

  draw() {
    if (!this.ctx || !this.size || this.size < 100) return;
    const ctx = this.ctx;
    const cx = this.size / 2;
    const cy = this.size / 2;
    const r = this.radius;
    const themeColor = this.category ? this.category.themeColor : "#f59e0b";

    ctx.clearRect(0, 0, this.size, this.size);

    ctx.save();
    ctx.translate(cx, cy);

    // 1. Sombra e caixa da roleta
    ctx.save();
    ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
    ctx.shadowBlur = 30;
    ctx.shadowOffsetY = 15;
    ctx.beginPath();
    ctx.arc(0, 0, r + 8, 0, 2 * Math.PI);
    ctx.fillStyle = "#0d0d10";
    ctx.fill();
    ctx.restore();

    // 2. Anel exterior de Titânio Fosco com friso luminoso
    ctx.beginPath();
    ctx.arc(0, 0, r + 6, 0, 2 * Math.PI);
    ctx.lineWidth = 10;
    ctx.strokeStyle = "#1a1a20";
    ctx.stroke();

    // Friso de luz na cor temática
    ctx.beginPath();
    ctx.arc(0, 0, r + 1, 0, 2 * Math.PI);
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = themeColor;
    ctx.stroke();

    // 3. Fatias da Roleta
    ctx.save();
    ctx.rotate(this.currentAngle);

    for (let i = 0; i < this.numSegments; i++) {
      const movie = this.movies[i];
      const startAngle = i * this.arc;
      const endAngle = (i + 1) * this.arc;
      const palette = this.palette[i % this.palette.length];

      // Segmento
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, r, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = palette.bg;
      ctx.fill();

      // Divisória sutil
      ctx.strokeStyle = palette.border;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Pino metálico minimalista na borda
      const pegAngle = startAngle;
      const pegX = Math.cos(pegAngle) * (r - 4);
      const pegY = Math.sin(pegAngle) * (r - 4);
      ctx.beginPath();
      ctx.arc(pegX, pegY, 2.2, 0, 2 * Math.PI);
      ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
      ctx.fill();

      // Texto do filme no segmento
      if (movie) {
        ctx.save();
        ctx.rotate(startAngle + this.arc / 2);
        ctx.textAlign = "right";
        ctx.textBaseline = "middle";

        // Número do índice na borda exterior
        ctx.font = "600 9px 'Plus Jakarta Sans', sans-serif";
        ctx.fillStyle = palette.num;
        ctx.fillText(String(i + 1).padStart(2, "0"), r - 12, 0);

        // Título do filme
        ctx.font = "700 11px 'Plus Jakarta Sans', sans-serif";
        ctx.fillStyle = palette.text;

        let displayTitle = movie.title;
        if (displayTitle.length > 22) {
          displayTitle = displayTitle.slice(0, 20) + "…";
        }
        ctx.fillText(displayTitle, r - 32, 0);

        ctx.restore();
      }
    }

    ctx.restore(); // Fim do disco rotativo

    // 4. Vignette escura interna
    const vignette = ctx.createRadialGradient(0, 0, r * 0.75, 0, 0, r);
    vignette.addColorStop(0, "rgba(0,0,0,0)");
    vignette.addColorStop(1, "rgba(0,0,0,0.5)");
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, 2 * Math.PI);
    ctx.fillStyle = vignette;
    ctx.fill();

    // 5. Hub Central (Disco Minimalista estilo Onyx)
    const hubRadius = 42;
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.6)";
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(0, 0, hubRadius, 0, 2 * Math.PI);
    ctx.fillStyle = "#121215";
    ctx.fill();
    ctx.restore();

    // Borda luminosa do hub
    ctx.beginPath();
    ctx.arc(0, 0, hubRadius, 0, 2 * Math.PI);
    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, hubRadius - 6, 0, 2 * Math.PI);
    ctx.lineWidth = 1;
    ctx.strokeStyle = themeColor;
    ctx.stroke();

    // Monograma / Nome central
    ctx.font = "800 11px 'Plus Jakarta Sans', sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("35MM", 0, 0);

    // 6. Ponteiro de Precisão Superior
    this.drawPointer(ctx, 0, -r, this.pointerDeflection, themeColor);

    ctx.restore();
  }

  drawPointer(ctx, x, y, deflection = 0, themeColor = "#f59e0b") {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(deflection);

    ctx.shadowColor = "rgba(0,0,0,0.7)";
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 3;

    // Base do ponteiro
    ctx.beginPath();
    ctx.arc(0, -8, 11, 0, 2 * Math.PI);
    ctx.fillStyle = "#18181c";
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Agulha geométrica minimalista
    ctx.beginPath();
    ctx.moveTo(-8, -4);
    ctx.lineTo(0, 24);
    ctx.lineTo(8, -4);
    ctx.closePath();
    ctx.fillStyle = themeColor;
    ctx.fill();

    // Centro do pino
    ctx.beginPath();
    ctx.arc(0, -8, 3.5, 0, 2 * Math.PI);
    ctx.fillStyle = "#ffffff";
    ctx.fill();

    ctx.restore();
  }
}
