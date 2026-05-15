/* ============================================================
   RM CLÍNICA — app.js
   Refatoração:
   - Roteamento via hash (#/home, #/odonto…) → URLs compartilháveis
   - Botão "voltar" do browser funciona
   - Throttle no scroll (requestAnimationFrame)
   - Focus trap no menu mobile
   - Suporte completo a teclado (Esc, setas)
   - Reveals respeitam prefers-reduced-motion
   - Sem onclick inline
   ============================================================ */

(() => {
  'use strict';

  // ─── BANCO DE DADOS DE ESPECIALIDADES ───
  const SPECIALTIES = {
    'odonto-01':  { cat: 'Odontologia',     catRoute: 'odonto',   title: 'Clínico Geral', desc: 'Atendimento odontológico completo para prevenção, diagnóstico e tratamentos.' },
    'odonto-02':  { cat: 'Odontologia',     catRoute: 'odonto',   title: 'Harmonização Facial', desc: 'Conjunto de procedimentos estéticos e funcionais que buscam equilibrar traços faciais, melhorar contornos e valorizar a estética natural do paciente com segurança e individualização.' },
    'odonto-03':  { cat: 'Odontologia',     catRoute: 'odonto',   title: 'Clareamento Dental', desc: 'Procedimento estético destinado a clarear os dentes de forma segura e controlada.' },
    'odonto-04':  { cat: 'Odontologia',     catRoute: 'odonto',   title: 'Facetas em Resina', desc: 'Técnica estética conservadora e minimamente invasiva, utilizada para corrigir formato, cor, tamanho e pequenas imperfeições dentárias, proporcionando um sorriso mais harmônico e natural.' },
    'odonto-05':  { cat: 'Odontologia',     catRoute: 'odonto',   title: 'Implantodontia', desc: 'Implantes dentários unitários e protocolo.' },
    'odonto-06':  { cat: 'Odontologia',     catRoute: 'odonto',   title: 'Prótese Dentária', desc: 'Reabilitação oral através de próteses fixas, removíveis ou sobre implantes.' },
    'odonto-07':  { cat: 'Odontologia',     catRoute: 'odonto',   title: 'Odontopediatria', desc: 'Atendimento odontológico especializado para bebês, crianças e adolescentes.' },
    'odonto-08':  { cat: 'Odontologia',     catRoute: 'odonto',   title: 'Dentística Restauradora e Estética', desc: 'Reconstrução dental e estética dental.' },
    'odonto-09':  { cat: 'Odontologia',     catRoute: 'odonto',   title: 'Endodontia', desc: 'Tratamento de canal.' },
    'odonto-10':  { cat: 'Odontologia',     catRoute: 'odonto',   title: 'Periodontia', desc: 'Gengiva e estruturas de sustentação dos dentes.' },
    'odonto-11':  { cat: 'Odontologia',     catRoute: 'odonto',   title: 'Ortodontia Fixa e Alinhadores Invisíveis', desc: 'Alinhamento dos dentes e correção da mordida com aparelhos fixos tradicionais ou alinhadores transparentes.' },
    'odonto-12':  { cat: 'Odontologia',     catRoute: 'odonto',   title: 'Ortopedia Funcional dos Maxilares', desc: 'Desenvolvimento ósseo e funcional da face, principalmente em crianças e adolescentes.' },
    'odonto-13':  { cat: 'Odontologia',     catRoute: 'odonto',   title: 'Estomatologia', desc: 'Diagnóstico e tratamento de alterações da boca, língua, gengiva e mucosas.' },
    'odonto-14':  { cat: 'Odontologia',     catRoute: 'odonto',   title: 'Disfunção Temporomandibular e Dor Orofacial (DTM)', desc: 'Tratamento de dores faciais, estalos na mandíbula, limitação de abertura bucal e desconfortos musculares relacionados à articulação temporomandibular.' },
    'odonto-15':  { cat: 'Odontologia',     catRoute: 'odonto',   title: 'Bruxismo', desc: 'Tratamento para apertamento e ranger dos dentes, frequentemente associados a maloclusão, estresse e alterações musculares.' },
    'odonto-16':  { cat: 'Odontologia',     catRoute: 'odonto',   title: 'Laserterapia Odontológica', desc: 'Tecnologia utilizada para acelerar cicatrização, reduzir inflamações, aliviar dores e auxiliar em tratamentos pós-operatórios.' },
    'odonto-17':  { cat: 'Odontologia',     catRoute: 'odonto',   title: 'Odontologia Preventiva', desc: 'Foco na prevenção de doenças bucais através de acompanhamento periódico, limpeza profissional, orientação de higiene e diagnóstico precoce, promovendo saúde a longo prazo.' },

    'saude-01':   { cat: 'Saúde Integrada', catRoute: 'saude',    title: 'Clínica Médica', desc: 'Atendimento voltado à prevenção, diagnóstico e tratamento clínico de diversas condições de saúde.' },
    'saude-02':   { cat: 'Saúde Integrada', catRoute: 'saude',    title: 'Nutrição Clínica e Esportiva', desc: 'Planejamento alimentar personalizado voltado à saúde, performance, emagrecimento, ganho de massa muscular e melhoria da qualidade de vida.' },
    'saude-03':   { cat: 'Saúde Integrada', catRoute: 'saude',    title: 'Endocrinologia', desc: 'Diagnóstico e tratamento de alterações hormonais e metabólicas, incluindo tireoide, diabetes, obesidade e distúrbios hormonais.' },
    'saude-04':   { cat: 'Saúde Integrada', catRoute: 'saude',    title: 'Ginecologia Endócrina', desc: 'Área focada na saúde hormonal feminina, tratando alterações menstruais, menopausa, síndrome dos ovários policísticos (SOP), fertilidade e equilíbrio hormonal.' },
    'saude-05':   { cat: 'Saúde Integrada', catRoute: 'saude',    title: 'Psiquiatria', desc: 'Diagnóstico, prevenção e tratamento de transtornos mentais, emocionais e comportamentais, promovendo saúde mental e qualidade de vida.' },
    'saude-06':   { cat: 'Saúde Integrada', catRoute: 'saude',    title: 'Psicologia', desc: 'Acompanhamento psicológico voltado ao equilíbrio emocional, desenvolvimento pessoal, gestão do estresse, ansiedade, autoestima e bem-estar mental.' },
    'saude-07':   { cat: 'Saúde Integrada', catRoute: 'saude',    title: 'Fonoaudiologia', desc: 'Prevenção, avaliação e tratamento da comunicação, fala, voz, audição, linguagem e funções relacionadas à respiração e deglutição.' },
    'saude-08':   { cat: 'Saúde Integrada', catRoute: 'saude',    title: 'Fisioterapia', desc: 'Tratamento especializado para prevenção e reabilitação de dores, lesões musculares, articulares e posturais, promovendo funcionalidade e qualidade de vida.' },
    'saude-09':   { cat: 'Saúde Integrada', catRoute: 'saude',    title: 'Acupuntura', desc: 'Terapia integrativa que utiliza estímulos em pontos específicos do corpo para auxiliar no equilíbrio físico e emocional, alívio de dores e melhora do bem-estar.' },
    'saude-10':   { cat: 'Saúde Integrada', catRoute: 'saude',    title: 'Gastroenterologia', desc: 'Diagnóstico e tratamento de doenças do sistema digestivo, incluindo estômago, intestino, fígado e alterações gastrointestinais.' },

    'bem-01':     { cat: 'Bem-Estar',       catRoute: 'bemestar', title: 'Biomedicina Estética', desc: 'Procedimentos estéticos voltados ao rejuvenescimento, cuidados faciais e corporais, promovendo harmonia, autoestima e bem-estar.' },
    'bem-02':     { cat: 'Bem-Estar',       catRoute: 'bemestar', title: 'Estética Corporal', desc: 'Tratamentos voltados à melhora do contorno corporal, flacidez, gordura localizada, celulite e qualidade da pele, com foco em saúde estética e autoestima.' }
  };

  // ─── ROUTING (hash-based) ───
  const VALID_ROUTES = ['home', 'odonto', 'saude', 'bemestar', 'coworking', 'detail'];
  let previousRoute = 'home';

  function parseHash() {
    const raw = location.hash.replace(/^#\/?/, '');
    if (!raw) return { route: 'home', param: null };
    const parts = raw.split('/');
    return { route: parts[0] || 'home', param: parts[1] || null };
  }

  function showPage(route, param = null) {
    if (!VALID_ROUTES.includes(route)) route = 'home';

    document.querySelectorAll('.page-section').forEach(p => p.hidden = true);
    const target = document.getElementById('page-' + route);
    if (target) target.hidden = false;

    // Active nav state
    document.querySelectorAll('[data-route]').forEach(link => {
      const isActive = link.dataset.route === route;
      link.classList.toggle('active', isActive);
      if (isActive && link.matches('a')) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });

    // Render detail page
    if (route === 'detail' && param && SPECIALTIES[param]) {
      const data = SPECIALTIES[param];
      document.getElementById('detail-cat').textContent = data.cat;
      document.getElementById('detail-title').textContent = data.title;
      document.getElementById('detail-desc').textContent = data.desc;
      const catLink = document.getElementById('detail-cat-link');
      catLink.textContent = data.cat;
      catLink.href = '#/' + data.catRoute;
      catLink.dataset.route = data.catRoute;
      document.title = `${data.title} · RM Clínica`;
    } else if (route !== 'detail') {
      previousRoute = route;
      document.title = 'RM Clínica · Odontologia, Saúde Integrada e Bem-Estar | Domo Business · SBC';
    }

    // Update page meta
    const pageMeta = {
      home:       'Excelência em saúde no ABC Paulista. Odontologia, especialidades médicas e bem-estar.',
      odonto:     'Odontologia premium em São Bernardo. Estética, implantes e reabilitação oral.',
      saude:      'Especialidades médicas e abordagem integrada para sua longevidade.',
      bemestar:   'Biomedicina estética e cuidados corporais no ABC Paulista.',
      coworking:  'Coworking saúde no Domo Business. Salas equipadas para profissionais.'
    };
    if (pageMeta[route]) {
      const desc = document.querySelector('meta[name="description"]');
      if (desc) desc.setAttribute('content', pageMeta[route]);
    }

    closeMobileMenu();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleRoute() {
    const { route, param } = parseHash();
    showPage(route, param);
  }

  window.addEventListener('hashchange', handleRoute);

  // ─── RENDER GRIDS ───
  function renderSpecGrids() {
    const grids = {
      'grid-odonto': 'odonto',
      'grid-saude': 'saude',
      'grid-bemestar': 'bem'
    };
    Object.entries(grids).forEach(([gridId, prefix]) => {
      const container = document.getElementById(gridId);
      if (!container) return;
      container.innerHTML = '';
      Object.entries(SPECIALTIES)
        .filter(([id]) => id.startsWith(prefix))
        .forEach(([id, item]) => {
          const card = document.createElement('button');
          card.type = 'button';
          card.className = 'spec-card';
          card.setAttribute('aria-label', `Ver detalhes sobre ${item.title}`);
          card.innerHTML = `
            <h3 class="serif">${item.title}</h3>
            <p>${item.desc}</p>
            <span class="spec-card-cta">Ver detalhes →</span>
          `;
          card.addEventListener('click', () => {
            location.hash = `#/detail/${id}`;
          });
          container.appendChild(card);
        });
    });
  }

  // ─── MOBILE MENU ───
  const menuBtn = document.getElementById('menuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  const closeMenuBtn = document.getElementById('closeMenu');
  let lastFocused = null;

  function openMobileMenu() {
    lastFocused = document.activeElement;
    mobileMenu.hidden = false;
    menuBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    // Focus primeiro link após render
    requestAnimationFrame(() => {
      const firstLink = mobileMenu.querySelector('a, button');
      if (firstLink) firstLink.focus();
    });
  }
  function closeMobileMenu() {
    if (!mobileMenu || mobileMenu.hidden) return;
    mobileMenu.hidden = true;
    menuBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    if (lastFocused) lastFocused.focus();
  }

  if (menuBtn) menuBtn.addEventListener('click', openMobileMenu);
  if (closeMenuBtn) closeMenuBtn.addEventListener('click', closeMobileMenu);

  // Esc fecha menu
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (!mobileMenu.hidden) closeMobileMenu();
      if (lightbox.classList.contains('open')) closeLightbox();
    }
  });

  // Focus trap no menu mobile
  mobileMenu?.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    const focusable = mobileMenu.querySelectorAll('a, button');
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault(); last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault(); first.focus();
    }
  });

  // ─── SCROLL (throttle via rAF) ───
  const nav = document.getElementById('mainNav');
  const heroImg = document.getElementById('heroImg');
  const waFloat = document.getElementById('waFloat');
  let ticking = false;

  function onScroll() {
    const y = window.scrollY;
    if (nav) nav.classList.toggle('nav-scrolled', y > 60);
    if (waFloat) waFloat.classList.toggle('visible', y > 60);
    if (heroImg && y < window.innerHeight) {
      heroImg.style.transform = `translateY(${y * 0.2}px) scale(${1 + (y * 0.0001)})`;
    }
    ticking = false;
  }
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(onScroll);
      ticking = true;
    }
  }, { passive: true });

  // ─── REVEAL ON SCROLL (uma vez só) ───
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
  } else {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target); // dispara uma vez só
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -50px 0px' });
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  }

  // ─── GALERIA ───
  const slides = document.querySelectorAll('.domo-slide');
  const dotsContainer = document.getElementById('galleryDots');
  const lightbox = document.getElementById('lightbox');
  const lbImg = document.getElementById('lightbox-img');
  let slideIndex = 0;
  let slideInterval = null;

  function buildDots() {
    if (!dotsContainer || slides.length === 0) return;
    dotsContainer.innerHTML = '';
    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'gallery-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', `Ir para imagem ${i + 1}`);
      dot.addEventListener('click', () => { showSlide(i); resetSlideInterval(); });
      dotsContainer.appendChild(dot);
    });
  }

  function showSlide(n) {
    if (slides.length === 0) return;
    slides.forEach(s => s.classList.remove('active'));
    slideIndex = ((n % slides.length) + slides.length) % slides.length;
    slides[slideIndex].classList.add('active');
    if (dotsContainer) {
      dotsContainer.querySelectorAll('.gallery-dot').forEach((d, i) => {
        d.classList.toggle('active', i === slideIndex);
      });
    }
    if (lbImg && lightbox.classList.contains('open')) {
      lbImg.src = slides[slideIndex].src;
      lbImg.alt = slides[slideIndex].alt;
    }
  }

  function changeSlide(step) {
    showSlide(slideIndex + step);
    resetSlideInterval();
  }

  function resetSlideInterval() {
    if (slideInterval) clearInterval(slideInterval);
    if (reduceMotion || slides.length === 0) return;
    slideInterval = setInterval(() => showSlide(slideIndex + 1), 6000);
  }

  function openLightbox() {
    if (!lightbox || !lbImg) return;
    lbImg.src = slides[slideIndex].src;
    lbImg.alt = slides[slideIndex].alt;
    lightbox.hidden = false;
    requestAnimationFrame(() => lightbox.classList.add('open'));
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(() => lightbox.hidden = true, 400);
  }

  // Event delegation para galeria
  document.addEventListener('click', (e) => {
    const galleryBtn = e.target.closest('[data-gallery]');
    if (galleryBtn) {
      e.preventDefault();
      const action = galleryBtn.dataset.gallery;
      if (action === 'prev') changeSlide(-1);
      else if (action === 'next') changeSlide(1);
      else if (action === 'expand') openLightbox();
      return;
    }

    const closeAction = e.target.closest('[data-action="close-lightbox"]');
    if (closeAction) { closeLightbox(); return; }

    const backAction = e.target.closest('[data-action="back"]');
    if (backAction) {
      e.preventDefault();
      if (history.length > 1) history.back();
      else location.hash = '#/' + previousRoute;
      return;
    }

    // Lightbox click fora da imagem fecha
    if (e.target === lightbox) closeLightbox();
  });

  // Teclado para lightbox
  document.addEventListener('keydown', (e) => {
    if (!lightbox || !lightbox.classList.contains('open')) return;
    if (e.key === 'ArrowRight') changeSlide(1);
    if (e.key === 'ArrowLeft') changeSlide(-1);
  });

  // ─── FONT PICKER ───
  // As fontes alternativas só são carregadas sob demanda (não pesam o load inicial).
  // A escolha persiste em localStorage.
  const FONT_THEMES = {
    editorial: {
      label: 'Editorial',
      // Cormorant + Jost — já vêm carregadas (padrão), não precisa baixar de novo
      googleFonts: null
    },
    haute: {
      label: 'Haute Couture',
      googleFonts: 'family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400&family=Outfit:wght@300;400;500;600'
    },
    couture: {
      label: 'Maison',
      googleFonts: 'family=DM+Serif+Display:ital@0;1&family=DM+Sans:ital,wght@0,400;0,500;0,600;1,400'
    },
    atelier: {
      label: 'Atelier',
      googleFonts: 'family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,400&family=Manrope:wght@300;400;500;600'
    },
    grand: {
      label: 'Grand Hotel',
      googleFonts: 'family=Cinzel:wght@400;500;600&family=Inter:wght@300;400;500;600'
    }
  };

  const FONT_STORAGE_KEY = 'rm-clinica-font-theme';
  const loadedFonts = new Set(['editorial']); // padrão já está no <head>

  function loadFontStylesheet(theme) {
    if (loadedFonts.has(theme)) return;
    const config = FONT_THEMES[theme];
    if (!config || !config.googleFonts) return;

    // Verifica se já existe (evita duplicatas)
    if (document.querySelector(`link[data-font-theme="${theme}"]`)) {
      loadedFonts.add(theme);
      return;
    }

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?${config.googleFonts}&display=swap`;
    link.dataset.fontTheme = theme;
    link.onload = () => loadedFonts.add(theme);
    link.onerror = () => { /* falha silenciosa, fallback do CSS assume */ };
    document.head.appendChild(link);
  }

  function applyFontTheme(theme) {
    if (!FONT_THEMES[theme]) theme = 'editorial';

    // Dispara o load em background (não bloqueia)
    loadFontStylesheet(theme);

    // Aplica imediatamente — o stack de font-family no CSS tem fallbacks,
    // então a UI nunca fica em branco enquanto a fonte carrega
    Object.keys(FONT_THEMES).forEach(t => document.body.classList.remove('font-' + t));
    document.body.classList.add('font-' + theme);

    document.querySelectorAll('.font-option').forEach(btn => {
      btn.setAttribute('aria-checked', btn.dataset.theme === theme ? 'true' : 'false');
    });

    try { localStorage.setItem(FONT_STORAGE_KEY, theme); } catch (e) { /* ok */ }
  }

  function initFontPicker() {
    const toggle = document.getElementById('fontPickerToggle');
    const panel = document.getElementById('fontPickerPanel');
    const picker = document.getElementById('fontPicker');
    if (!toggle || !panel) return;

    // Pré-carrega as fontes ao passar o mouse sobre o botão (prefetch suave)
    let prefetched = false;
    toggle.addEventListener('mouseenter', () => {
      if (prefetched) return;
      prefetched = true;
      // Prefetch apenas das URLs (browser cacheia, mas não aplica ainda)
      Object.entries(FONT_THEMES).forEach(([theme, config]) => {
        if (!config.googleFonts || loadedFonts.has(theme)) return;
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.as = 'style';
        link.href = `https://fonts.googleapis.com/css2?${config.googleFonts}&display=swap`;
        document.head.appendChild(link);
      });
    }, { once: true });

    // Toggle do painel — stopPropagation evita que o click-outside feche imediatamente
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = !panel.hidden;
      panel.hidden = isOpen;
      toggle.setAttribute('aria-expanded', String(!isOpen));
    });

    // Fecha ao clicar fora — só se o painel está aberto E o clique foi realmente fora
    document.addEventListener('click', (e) => {
      if (panel.hidden) return;
      if (picker.contains(e.target)) return;
      panel.hidden = true;
      toggle.setAttribute('aria-expanded', 'false');
    });

    // Esc fecha
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !panel.hidden) {
        panel.hidden = true;
        toggle.setAttribute('aria-expanded', 'false');
        toggle.focus();
      }
    });

    // Cliques nas opções
    panel.querySelectorAll('.font-option').forEach(btn => {
      btn.addEventListener('click', () => {
        applyFontTheme(btn.dataset.theme);
      });
    });

    // Restaura preferência salva
    let saved = 'editorial';
    try { saved = localStorage.getItem(FONT_STORAGE_KEY) || 'editorial'; } catch (e) { /* ok */ }
    applyFontTheme(saved);
  }

  // ─── INIT ───
  let initialized = false;
  function init() {
    if (initialized) return;
    initialized = true;
    renderSpecGrids();
    buildDots();
    resetSlideInterval();
    initFontPicker();
    handleRoute(); // entra na rota correta da URL
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    // DOM já está pronto (script com defer ou cache)
    init();
  }
})();