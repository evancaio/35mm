// Aplicação Principal - Sessão 35mm
// 100% Front-end • Arquitetura Sem Backend • Estado Local & Roteamento Reativo

class RoletaApp {
  constructor() {
    this.currentCategoryKey = "mista";
    this.excludeDrawn = true; // Impede repetições de filmes sorteados
    this.drawnHistory = JSON.parse(localStorage.getItem("roleta_history") || "[]");
    this.categoryPools = {};
    this.roulette = null;
    this.winningMovie = null;
    this.currentBackdropCategory = null;

    this.initPools();
    this.initDOM();
    this.initRoulette();
    this.initRouter();
    this.updateSoundBtnUI();
  }

  // Inicializa o catálogo de disponíveis para cada sala
  initPools() {
    const savedPools = localStorage.getItem("roleta_pools");
    if (savedPools) {
      try {
        this.categoryPools = JSON.parse(savedPools);
      } catch (e) {
        this.resetAllPools();
      }
    } else {
      this.resetAllPools();
    }

    // Validação de integridade
    Object.keys(categoriesData).forEach(catKey => {
      if (!this.categoryPools[catKey] || !Array.isArray(this.categoryPools[catKey])) {
        this.categoryPools[catKey] = categoriesData[catKey].movies.map(m => m.id);
      }
    });
  }

  resetAllPools() {
    this.categoryPools = {
      mista: mixedMovies.map(m => m.id),
      terror: horrorMovies.map(m => m.id),
      acao: actionMovies.map(m => m.id),
      drama: dramaMovies.map(m => m.id)
    };
    this.savePools();
  }

  savePools() {
    localStorage.setItem("roleta_pools", JSON.stringify(this.categoryPools));
  }

  saveHistory() {
    localStorage.setItem("roleta_history", JSON.stringify(this.drawnHistory));
  }

  initDOM() {
    this.homeView = document.getElementById("homeView");
    this.rouletteView = document.getElementById("rouletteView");
    this.navLinks = document.querySelectorAll(".pill-nav-item");
    this.mobileMenuToggle = document.getElementById("mobileMenuToggle");
    this.navMenu = document.getElementById("navLinksMenu");
    this.soundToggleBtn = document.getElementById("soundToggleBtn");

    // Controles do palco
    this.spinBtn = document.getElementById("spinButton");
    this.categoryTitle = document.getElementById("stageCategoryTitle");
    this.sessionSubtitle = document.getElementById("stageSubtitle");
    this.sessionCodeBadge = document.getElementById("stageSessionCode");
    this.poolCounter = document.getElementById("poolCounter");
    this.excludeToggle = document.getElementById("excludeDrawnCheckbox");
    this.resetCategoryBtn = document.getElementById("resetCategoryBtn");

    // Histórico
    this.historyListContainer = document.getElementById("historyListContainer");
    this.clearHistoryBtn = document.getElementById("clearHistoryBtn");

    // Modal de revelação
    this.modalOverlay = document.getElementById("revealModalOverlay");
    this.modalCloseBtn = document.getElementById("modalCloseBtn");
    this.modalSpinAgainBtn = document.getElementById("modalSpinAgainBtn");
    this.modalBackHomeBtn = document.getElementById("modalBackHomeBtn");

    // Esteira dinâmica de pôsteres no fundo da roleta
    this.backdropWrapper = document.getElementById("cinemaBackdropWrapper");
    this.backdropContainer = document.getElementById("backdropTracksContainer");

    // The Living Vault (Mural Suave da Home)
    this.homeVaultWrapper = document.getElementById("homeVaultBackdrop");
    this.homeVaultContainer = document.getElementById("homeVaultTracksContainer");

    this.bindEvents();
    this.renderHomeCards();
    this.renderHomeVault();
  }

  // Gera The Living Vault na Home: 5 faixas densas com os 80 clássicos cobrindo a tela toda
  renderHomeVault() {
    if (!this.homeVaultContainer) return;

    // Combina todos os 80 filmes de forma intercalada
    const allMovies = [];
    const maxLen = Math.max(mixedMovies.length, horrorMovies.length, actionMovies.length, dramaMovies.length);
    for (let i = 0; i < maxLen; i++) {
      if (mixedMovies[i]) allMovies.push(mixedMovies[i]);
      if (horrorMovies[i]) allMovies.push(horrorMovies[i]);
      if (actionMovies[i]) allMovies.push(actionMovies[i]);
      if (dramaMovies[i]) allMovies.push(dramaMovies[i]);
    }

    const numRows = 5;
    let html = "";

    for (let r = 0; r < numRows; r++) {
      const sliceSize = 25;
      const offset = (r * 15) % allMovies.length;
      const rowSlice = [];

      for (let i = 0; i < sliceSize; i++) {
        rowSlice.push(allMovies[(offset + i) % allMovies.length]);
      }

      // Duplicar para loop contínuo infinito
      const doubleSlice = [...rowSlice, ...rowSlice];

      const postersHtml = doubleSlice.map(movie => `
        <div class="vault-poster-item" title="${movie.title} (${movie.year})">
          <img src="${movie.poster}" alt="${movie.title}" loading="lazy" onerror="this.src='${getFallbackPoster(movie.title, movie.year, movie.genre)}'">
        </div>
      `).join("");

      html += `
        <div class="vault-row">
          <div class="vault-row-inner">
            ${postersHtml}
          </div>
        </div>
      `;
    }

    this.homeVaultContainer.innerHTML = html;
  }

  // Gera esteira contínua com os pôsteres dos filmes da sessão no fundo da roleta (cobertura total sem espaço vazio)
  renderGenreBackdrop(categoryKey) {
    if (!this.backdropContainer) return;
    this.currentBackdropCategory = categoryKey;
    const catData = categoriesData[categoryKey] || categoriesData.mista;
    const movies = catData.movies || mixedMovies;

    // 18 linhas verticais preenchem 100% da viewport em qualquer resolução (até 4K rotacionado)
    const numRows = 18;
    let html = "";

    for (let r = 0; r < numRows; r++) {
      const offset = (r * 3) % movies.length;
      const rowSlice = [];

      for (let i = 0; i < movies.length; i++) {
        rowSlice.push(movies[(offset + i) % movies.length]);
      }

      // Período exato de 40 pôsteres duplicados, repetido 3 vezes = 120 pôsteres por linha (~15.600px de largura)
      // O loop CSS de -33.333% a -66.666% inicia com buffer total de pôsteres à esquerda e à direita
      const periodSlice = [...rowSlice, ...rowSlice];
      const tripleSlice = [...periodSlice, ...periodSlice, ...periodSlice];

      const cardsHtml = tripleSlice.map(movie => `
        <div class="mini-poster-card" title="${movie.title} (${movie.year})">
          <img src="${movie.poster}" alt="${movie.title}" loading="lazy" onerror="this.src='${getFallbackPoster(movie.title, movie.year, movie.genre)}'">
        </div>
      `).join("");

      html += `
        <div class="backdrop-row">
          <div class="backdrop-row-inner">
            ${cardsHtml}
          </div>
        </div>
      `;
    }

    this.backdropContainer.innerHTML = html;
  }

  initRoulette() {
    this.roulette = new MovieRoulette("rouletteCanvas", {
      onSpinStart: () => {
        this.spinBtn.disabled = true;
        this.spinBtn.querySelector(".btn-label").textContent = "SORTEANDO...";
      },
      onSpinEnd: (winner) => {
        this.spinBtn.disabled = false;
        this.spinBtn.querySelector(".btn-label").textContent = "GIRAR A ROLETA";
        this.onMovieWon(winner);
      }
    });
  }

  bindEvents() {
    // Giro
    this.spinBtn.addEventListener("click", () => {
      if (window.soundEngine) window.soundEngine.playButtonClick();
      this.triggerSpin();
    });

    // Som
    this.soundToggleBtn.addEventListener("click", () => {
      if (window.soundEngine) {
        soundEngine.toggleMute();
        this.updateSoundBtnUI();
      }
    });

    // Menu Mobile
    if (this.mobileMenuToggle && this.navMenu) {
      this.mobileMenuToggle.addEventListener("click", () => {
        this.navMenu.classList.toggle("mobile-open");
      });

      this.navLinks.forEach(link => {
        link.addEventListener("click", () => {
          this.navMenu.classList.remove("mobile-open");
        });
      });
    }

    // Toggle de não repetição
    this.excludeToggle.addEventListener("change", (e) => {
      this.excludeDrawn = e.target.checked;
      this.updatePoolCounter();
    });

    // Resetar sala
    this.resetCategoryBtn.addEventListener("click", () => {
      if (window.soundEngine) window.soundEngine.playButtonClick();
      this.resetCategoryPool(this.currentCategoryKey);
    });

    // Limpar histórico
    if (this.clearHistoryBtn) {
      this.clearHistoryBtn.addEventListener("click", () => {
        this.drawnHistory = [];
        this.saveHistory();
        this.renderHistory();
      });
    }

    // Modal
    this.modalCloseBtn.addEventListener("click", () => this.closeModal());
    this.modalOverlay.addEventListener("click", (e) => {
      if (e.target === this.modalOverlay) this.closeModal();
    });

    this.modalBackHomeBtn.addEventListener("click", () => {
      this.closeModal();
      window.location.hash = "home";
    });

    this.modalSpinAgainBtn.addEventListener("click", () => {
      this.closeModal();
      setTimeout(() => this.triggerSpin(), 250);
    });

    // Fechar modal com tecla Esc
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.modalOverlay.classList.contains("active")) {
        this.closeModal();
      }
    });
  }

  updateSoundBtnUI() {
    if (!window.soundEngine || !this.soundToggleBtn) return;
    const isMuted = soundEngine.isMuted();
    const iconOn = this.soundToggleBtn.querySelector(".sound-icon-on");
    const iconOff = this.soundToggleBtn.querySelector(".sound-icon-off");
    const label = this.soundToggleBtn.querySelector(".sound-label");

    if (isMuted) {
      if (iconOn) iconOn.style.display = "none";
      if (iconOff) iconOff.style.display = "block";
      if (label) label.textContent = "MUDO";
      this.soundToggleBtn.classList.add("muted");
    } else {
      if (iconOn) iconOn.style.display = "block";
      if (iconOff) iconOff.style.display = "none";
      if (label) label.textContent = "ÁUDIO";
      this.soundToggleBtn.classList.remove("muted");
    }
  }

  // Roteamento via Hash da URL (#home, #mista, #terror, #acao, #drama)
  initRouter() {
    const handleRoute = () => {
      let hash = window.location.hash.replace("#", "").toLowerCase();
      if (!hash || hash === "" || hash === "home") {
        this.showHomeView();
      } else if (categoriesData[hash]) {
        this.showRouletteView(hash);
      } else {
        this.showHomeView();
      }
    };

    window.addEventListener("hashchange", handleRoute);
    handleRoute();
  }

  showHomeView() {
    this.homeView.classList.add("active");
    this.rouletteView.classList.remove("active");
    this.updateActiveNavLink("home");
    this.renderHomeCards();

    // Ativar The Living Vault na Home
    if (this.homeVaultWrapper) {
      this.homeVaultWrapper.classList.add("vault-active");
    }

    // Desativar esteira inclinada da roleta
    if (this.backdropWrapper) {
      this.backdropWrapper.classList.remove("backdrop-active");
    }

    // Resetar glow para neutro
    document.documentElement.style.setProperty("--current-theme", "#f59e0b");
    document.documentElement.style.setProperty("--current-glow", "rgba(245, 158, 11, 0.15)");

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  showRouletteView(categoryKey) {
    this.currentCategoryKey = categoryKey;
    const catData = categoriesData[categoryKey];
    if (!catData) return;

    this.homeView.classList.remove("active");
    this.rouletteView.classList.add("active");
    this.updateActiveNavLink(categoryKey);

    // Desativar The Living Vault da Home
    if (this.homeVaultWrapper) {
      this.homeVaultWrapper.classList.remove("vault-active");
    }

    // Ativar e renderizar a esteira temática com os 20 filmes do gênero escolhido
    if (this.backdropWrapper) {
      this.backdropWrapper.classList.add("backdrop-active");
    }
    if (this.currentBackdropCategory !== categoryKey) {
      this.renderGenreBackdrop(categoryKey);
    }

    // Ajustar iluminação reativa
    const themeGlows = {
      mista: "rgba(245, 158, 11, 0.25)",
      terror: "rgba(239, 68, 68, 0.25)",
      acao: "rgba(249, 115, 22, 0.25)",
      drama: "rgba(6, 182, 212, 0.25)"
    };
    document.documentElement.style.setProperty("--current-theme", catData.themeColor);
    document.documentElement.style.setProperty("--current-glow", themeGlows[categoryKey] || "rgba(245, 158, 11, 0.25)");

    // Atualizar títulos
    this.categoryTitle.textContent = catData.name;
    this.sessionSubtitle.textContent = catData.subtitle;
    this.sessionCodeBadge.textContent = catData.sessionCode;

    // Carregar filmes na roleta
    this.roulette.setMovies(catData.movies, catData);
    if (this.roulette && this.roulette.resize) {
      this.roulette.resize();
      setTimeout(() => this.roulette.resize(), 60);
      setTimeout(() => this.roulette.resize(), 200);
    }

    this.updatePoolCounter();
    this.renderHistory();

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  updateActiveNavLink(activeKey) {
    this.navLinks.forEach(link => {
      const linkHash = link.getAttribute("href").replace("#", "").toLowerCase();
      if (linkHash === activeKey || (activeKey === "home" && linkHash === "home")) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });
  }

  // Renderiza os 4 Cards com Full-Bleed Cinema Backdrop (Estilo Apple TV+ / Awwwards Site of the Day)
  renderHomeCards() {
    const container = document.getElementById("sessionsCardsGrid");
    if (!container) return;

    // Curadoria dos pôsteres de maior impacto para o fundo cinematográfico de cada sala
    const heroMovieByCat = {
      mista: (categoriesData.mista.movies.find(m => m.id === "mix-3") || categoriesData.mista.movies[0]), // Interestelar
      terror: (categoriesData.terror.movies.find(m => m.id === "hor-1") || categoriesData.terror.movies[0]), // O Iluminado
      acao: (categoriesData.acao.movies.find(m => m.id === "act-1") || categoriesData.acao.movies[0]), // Mad Max: Estrada da Fúria
      drama: (categoriesData.drama.movies.find(m => m.id === "dra-1") || categoriesData.drama.movies[0]) // O Poderoso Chefão
    };

    container.innerHTML = Object.keys(categoriesData).map(key => {
      const cat = categoriesData[key];
      const pool = this.categoryPools[key] || [];
      const hero = heroMovieByCat[key] || cat.movies[0] || {};

      // Pôsteres de amostra dos outros filmes da sessão para a stack de avatares
      const sampleMovies = cat.movies.filter(m => m.id !== hero.id).slice(0, 3);
      const m1 = sampleMovies[0] || cat.movies[1] || {};
      const m2 = sampleMovies[1] || cat.movies[2] || {};
      const m3 = sampleMovies[2] || cat.movies[3] || {};

      return `
        <a href="#${cat.id}" class="session-card full-bleed-card" data-category="${cat.id}">
          <!-- Backdrop Full-Bleed em Alta Definição com Zoom no Hover -->
          <div class="card-bleed-poster-layer">
            <img src="${hero.poster}" alt="${hero.title}" class="card-bleed-img" loading="lazy" onerror="this.src='${getFallbackPoster(hero.title, hero.year, hero.genre)}'">
            <div class="card-bleed-gradient"></div>
            <div class="card-bleed-glow"></div>
          </div>

          <!-- Barra Superior do Card (Vidro Fosco & Amostra de Títulos) -->
          <div class="card-bleed-top-bar">
            <div class="card-session-pill">
              <span class="session-dot"></span>
              <span>${cat.sessionCode}</span>
            </div>

            <div class="card-peeks-group" title="Inclui ${m1.title}, ${m2.title}, ${m3.title} e mais 17 títulos">
              <div class="peeks-stack">
                <img src="${m1.poster}" alt="${m1.title}" class="peek-avatar" onerror="this.style.display='none'">
                <img src="${m2.poster}" alt="${m2.title}" class="peek-avatar" onerror="this.style.display='none'">
                <img src="${m3.poster}" alt="${m3.title}" class="peek-avatar" onerror="this.style.display='none'">
              </div>
              <span class="peeks-counter">+17</span>
            </div>
          </div>

          <!-- Conteúdo Inferior Editorial (Apple TV+ / Awwwards Typography) -->
          <div class="card-bleed-content">
            <div class="card-genre-tag">${cat.badge}</div>
            <h3 class="card-bleed-title">${cat.name}</h3>
            <p class="card-bleed-tagline">${cat.tagline}</p>

            <div class="card-bleed-footer">
              <div class="card-availability-badge">
                <span class="live-dot"></span>
                <span>${pool.length} de 20 disponíveis</span>
              </div>
              <span class="card-enter-btn">
                <span>Girar Sala</span>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </span>
            </div>
          </div>
        </a>
      `;
    }).join("");
  }

  updatePoolCounter() {
    const available = this.categoryPools[this.currentCategoryKey] || [];
    this.poolCounter.textContent = `${available.length} DISPONÍVEIS`;

    if (available.length === 0 && this.excludeDrawn) {
      this.poolCounter.textContent = `TODOS SORTEADOS`;
    }
  }

  resetCategoryPool(categoryKey) {
    const cat = categoriesData[categoryKey];
    if (!cat) return;
    this.categoryPools[categoryKey] = cat.movies.map(m => m.id);
    this.savePools();
    this.updatePoolCounter();
    this.renderHomeCards();
  }

  // Disparo do sorteio
  triggerSpin() {
    if (this.roulette.isSpinning) return;

    let availableIds = this.categoryPools[this.currentCategoryKey];

    if (this.excludeDrawn && (!availableIds || availableIds.length === 0)) {
      this.resetCategoryPool(this.currentCategoryKey);
      availableIds = this.categoryPools[this.currentCategoryKey];
    }

    const randomTargetId = availableIds[Math.floor(Math.random() * availableIds.length)];

    this.roulette.spinToMovie(randomTargetId, (winner) => {
      if (this.excludeDrawn) {
        this.categoryPools[this.currentCategoryKey] = this.categoryPools[this.currentCategoryKey].filter(id => id !== winner.id);
        this.savePools();
        this.updatePoolCounter();
        this.renderHomeCards();
      }
    });
  }

  onMovieWon(movie) {
    this.winningMovie = movie;

    const historyEntry = {
      id: movie.id,
      title: movie.title,
      year: movie.year,
      categoryName: categoriesData[this.currentCategoryKey].name,
      timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    };

    this.drawnHistory.unshift(historyEntry);
    if (this.drawnHistory.length > 25) this.drawnHistory.pop();
    this.saveHistory();
    this.renderHistory();

    this.showRevealModal(movie);
  }

  showRevealModal(movie) {
    const titleEl = document.getElementById("revealedTitle");
    const origTitleEl = document.getElementById("revealedOriginalTitle");
    const yearEl = document.getElementById("revealedYear");
    const genreEl = document.getElementById("revealedGenre");
    const durationEl = document.getElementById("revealedDuration");
    const ratingEl = document.getElementById("revealedRating");
    const synopsisEl = document.getElementById("revealedSynopsis");
    const directorEl = document.getElementById("revealedDirector");
    const posterImg = document.getElementById("revealedPosterImg");
    const posterGlow = document.getElementById("revealedPosterGlow");
    const streamingsEl = document.getElementById("revealedStreamings");

    titleEl.textContent = movie.title;
    origTitleEl.textContent = movie.originalTitle ? `Original: ${movie.originalTitle}` : "";
    yearEl.textContent = movie.year;
    genreEl.textContent = movie.genre;
    durationEl.textContent = movie.duration;
    ratingEl.textContent = `★ ${movie.rating}`;
    synopsisEl.textContent = movie.synopsis;
    directorEl.innerHTML = `Direção: <strong>${movie.director}</strong>`;

    if (posterGlow) {
      posterGlow.style.backgroundImage = `url('${movie.poster}')`;
    }

    if (streamingsEl) {
      const streamings = movie.streamings && movie.streamings.length > 0 
        ? movie.streamings 
        : ["Prime Video", "Apple TV+"];
      
      streamingsEl.innerHTML = streamings.map(provider => getStreamingBadgeHtml(provider)).join("");
    }

    posterImg.onerror = () => {
      posterImg.onerror = null;
      posterImg.src = getFallbackPoster(movie.title, movie.year, movie.genre);
    };
    posterImg.src = movie.poster;

    this.modalOverlay.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  closeModal() {
    this.modalOverlay.classList.remove("active");
    document.body.style.overflow = "";
  }

  renderHistory() {
    if (!this.historyListContainer) return;

    if (this.drawnHistory.length === 0) {
      this.historyListContainer.innerHTML = `<p class="history-empty-msg">Nenhum filme sorteado ainda.</p>`;
      return;
    }

    this.historyListContainer.innerHTML = this.drawnHistory.map(item => `
      <div class="history-item">
        <div>
          <div class="history-item-title">${item.title}</div>
          <div class="history-item-meta">${item.categoryName} • ${item.year}</div>
        </div>
        <div class="history-item-meta">${item.timestamp}</div>
      </div>
    `).join("");
  }
}

// Gerador de Badges com Ícones Oficiais de Streaming
function getStreamingBadgeHtml(providerName) {
  const providers = {
    "Netflix": {
      name: "Netflix",
      color: "#ff4d58",
      bg: "rgba(229, 9, 20, 0.12)",
      border: "rgba(229, 9, 20, 0.35)",
      icon: `<svg viewBox="0 0 24 24" width="13" height="13" fill="#E50914"><path d="M5.398 0v24c1.865-.34 3.75-.724 5.617-1.127V10.42l5.727 12.39c2.046-.484 4.072-.993 6.096-1.522V0h-5.617v12.247L11.493 0H5.398z"/></svg>`
    },
    "Max": {
      name: "Max",
      color: "#60a5fa",
      bg: "rgba(0, 43, 231, 0.14)",
      border: "rgba(96, 165, 250, 0.35)",
      icon: `<svg viewBox="0 0 24 24" width="13" height="13" fill="#3b82f6"><circle cx="12" cy="12" r="10" fill="#002BE7"/><path d="M7 8l2.5 4L12 8l2.5 4L17 8v8h-2.2v-4.5L12.5 15h-1L9.2 11.5V16H7V8z" fill="#fff"/></svg>`
    },
    "Prime Video": {
      name: "Prime Video",
      color: "#38bdf8",
      bg: "rgba(0, 168, 225, 0.12)",
      border: "rgba(56, 189, 248, 0.35)",
      icon: `<svg viewBox="0 0 24 24" width="13" height="13" fill="#00A8E1"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l6 4.5-6 4.5z"/></svg>`
    },
    "Disney+": {
      name: "Disney+",
      color: "#7dd3fc",
      bg: "rgba(17, 60, 207, 0.18)",
      border: "rgba(125, 211, 252, 0.35)",
      icon: `<svg viewBox="0 0 24 24" width="13" height="13" fill="#38bdf8"><path d="M12 3c-4.97 0-9 4.03-9 9 0 2.12.74 4.07 1.97 5.61L9.4 12.2c-.24-.46-.4-.97-.4-1.52 0-1.88 1.52-3.4 3.4-3.4.67 0 1.29.2 1.81.53l3.18-3.18C15.82 3.63 13.98 3 12 3zm6.63 4.37l-3.18 3.18c.34.52.55 1.15.55 1.82 0 1.88-1.52 3.4-3.4 3.4-.55 0-1.06-.16-1.52-.4l-5.41 5.41C7.93 21.26 9.88 22 12 22c4.97 0 9-4.03 9-9 0-1.98-.63-3.82-1.37-5.63z"/></svg>`
    },
    "Apple TV+": {
      name: "Apple TV+",
      color: "#f3f4f6",
      bg: "rgba(255, 255, 255, 0.08)",
      border: "rgba(255, 255, 255, 0.25)",
      icon: `<svg viewBox="0 0 24 24" width="13" height="13" fill="#ffffff"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.38c.62-.75 1.04-1.8 0.93-2.85-.9.04-1.99.6-2.63 1.35-.56.65-1.05 1.71-.92 2.73 1 .08 2.03-.49 2.62-1.23z"/></svg>`
    },
    "Paramount+": {
      name: "Paramount+",
      color: "#93c5fd",
      bg: "rgba(0, 100, 255, 0.14)",
      border: "rgba(147, 197, 253, 0.35)",
      icon: `<svg viewBox="0 0 24 24" width="13" height="13" fill="#60a5fa"><path d="M12 2L9.5 8.5H2.5L8 12.5L5.5 19L12 15L18.5 19L16 12.5L21.5 8.5H14.5L12 2Z"/></svg>`
    },
    "Telecine": {
      name: "Telecine",
      color: "#f87171",
      bg: "rgba(227, 27, 35, 0.12)",
      border: "rgba(248, 113, 113, 0.35)",
      icon: `<svg viewBox="0 0 24 24" width="13" height="13" fill="#ef4444"><path d="M4 4h7v7H4V4zm9 0h7v7h-7V4zM4 13h7v7H4v-7zm9 0h7v7h-7v-7z"/></svg>`
    },
    "Globoplay": {
      name: "Globoplay",
      color: "#fb7185",
      bg: "rgba(251, 8, 45, 0.12)",
      border: "rgba(251, 113, 133, 0.35)",
      icon: `<svg viewBox="0 0 24 24" width="13" height="13" fill="#fb7185"><circle cx="12" cy="12" r="10"/><path d="M9.5 8.5l7 3.5-7 3.5v-7z" fill="#fff"/></svg>`
    },
    "MUBI": {
      name: "MUBI",
      color: "#bfdbfe",
      bg: "rgba(0, 32, 64, 0.3)",
      border: "rgba(191, 219, 254, 0.35)",
      icon: `<svg viewBox="0 0 24 24" width="13" height="13" fill="#93c5fd"><circle cx="6" cy="12" r="2.5"/><circle cx="12" cy="12" r="2.5"/><circle cx="18" cy="12" r="2.5"/></svg>`
    }
  };

  const p = providers[providerName] || {
    name: providerName,
    color: "#f4f4f5",
    bg: "rgba(255, 255, 255, 0.06)",
    border: "rgba(255, 255, 255, 0.15)",
    icon: `<svg viewBox="0 0 24 24" width="13" height="13" fill="#f4f4f5"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8" fill="#141312"/></svg>`
  };

  return `
    <div class="streaming-badge" style="border-color: ${p.border}; background: ${p.bg};">
      <span class="streaming-badge-icon">${p.icon}</span>
      <span class="streaming-badge-name" style="color: ${p.color};">${p.name}</span>
    </div>
  `;
}

// Inicializar aplicativo ao carregar o DOM
document.addEventListener("DOMContentLoaded", () => {
  window.app = new RoletaApp();
});
