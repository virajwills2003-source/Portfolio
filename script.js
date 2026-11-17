/**
 * DEVELOPER PORTFOLIO - J.H.P.W. VIRAJ
 * Optimized Interactive Logic, Sticky Scrollytelling & Low-RAM Mobile Engine
 */

document.addEventListener('DOMContentLoaded', () => {
  const root = document.documentElement;
  const prefersReducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const mobileQuery = window.matchMedia('(max-width: 768px)');
  const touchQuery = window.matchMedia('(hover: none) and (pointer: coarse)');

  function detectLowPerfMode() {
    const lowMem = typeof navigator.deviceMemory === 'number' && navigator.deviceMemory <= 4;
    const lowCores = typeof navigator.hardwareConcurrency === 'number' && navigator.hardwareConcurrency <= 4;
    return prefersReducedMotionQuery.matches || lowMem || lowCores || (mobileQuery.matches && touchQuery.matches);
  }

  let isLowPerf = detectLowPerfMode();
  root.classList.toggle('low-perf-mode', isLowPerf);

  /* ==========================================
     1. STATE & CACHED REFERENCES
     ========================================== */
  const scrollyWrapper = document.querySelector('.scrolly-section-wrapper');
  const scrollyViewport = document.querySelector('.scrolly-sticky-viewport');
  const scrollyCanvas = document.getElementById('scrollyCanvas');
  const scrubberProgress = document.getElementById('scrubberProgress');

  const gateOverlay = document.getElementById('gateOverlay');
  const gateLeft = document.getElementById('gateLeft');
  const gateRight = document.getElementById('gateRight');
  const gateEmblem = document.getElementById('gateEmblem');

  const stages = [
    document.getElementById('scrollyStage1'),
    document.getElementById('scrollyStage2'),
    document.getElementById('scrollyStage3'),
    document.getElementById('scrollyStage4')
  ];
  const sentenceElements = Array.from(document.querySelectorAll('#scrollyStage2 .hero-sentence'));
  const archElements = Array.from(document.querySelectorAll('#scrollyStage4 .arch-item'));
  const skillEntries = Array.from(document.querySelectorAll('.scrolly-skill-item')).map(item => ({
    fill: item.querySelector('.scrolly-progress-fill'),
    valText: item.querySelector('.skill-val'),
    targetVal: parseInt(item.getAttribute('data-target'), 10) || 0,
    lastVal: -1
  }));

  let isHeroInView = true;
  let activeStageIndex = 0;

  /* ==========================================
     2. DYNAMIC TYPING EFFECT (PAUSES OFFSCREEN)
     ========================================== */
  const typingElement = document.getElementById('typingText');
  const linesToType = [
    'HND IT Student at SLIATE',
    'Software & Web Developer',
    'Java | PHP | JavaScript | SQL | C# | Laravel',
    'Passionate about Database Management & Networking',
    'Always Learning New Technologies!'
  ];

  let lineIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typingTimerId = null;

  function canRunTyping() {
    return Boolean(
      typingElement &&
      !prefersReducedMotionQuery.matches &&
      activeStageIndex === 0 &&
      isHeroInView &&
      !document.hidden
    );
  }

  function stepTyping() {
    typingTimerId = null;
    if (!canRunTyping()) return;

    const currentLine = linesToType[lineIndex];
    let delay;

    if (isDeleting) {
      charIndex = Math.max(0, charIndex - 1);
      typingElement.textContent = currentLine.substring(0, charIndex);
      delay = 40;
    } else {
      charIndex = Math.min(currentLine.length, charIndex + 1);
      typingElement.textContent = currentLine.substring(0, charIndex);
      delay = 80;
    }

    if (!isDeleting && charIndex === currentLine.length) {
      delay = 2000;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      lineIndex = (lineIndex + 1) % linesToType.length;
      delay = 500;
    }

    typingTimerId = setTimeout(stepTyping, delay);
  }

  function syncTypingState() {
    if (!typingElement) return;
    if (prefersReducedMotionQuery.matches) {
      if (typingTimerId) {
        clearTimeout(typingTimerId);
        typingTimerId = null;
      }
      typingElement.textContent = linesToType[0];
      return;
    }
    if (canRunTyping()) {
      if (!typingTimerId) {
        typingTimerId = setTimeout(stepTyping, 250);
      }
    } else if (typingTimerId) {
      clearTimeout(typingTimerId);
      typingTimerId = null;
    }
  }

  document.addEventListener('visibilitychange', syncTypingState);

  /* ==========================================
     3. LIGHTWEIGHT CANVAS & STICKY SCROLLYTELLING
     ========================================== */
  if (scrollyWrapper && scrollyViewport && scrollyCanvas) {
    const ctx = scrollyCanvas.getContext('2d', { alpha: true });
    let canvasWidth = 0;
    let canvasHeight = 0;
    let dpr = 1;
    let wrapperTop = 0;
    let scrollableHeight = 1;

    let targetProgress = 0;
    let currentProgress = 0;
    let lastCanvasProgress = -1;
    let lastGateProgress = -1;
    let lastGateDone = false;
    let lastActiveIndex = -1;
    let lastSentenceCount = -1;
    let lastArchCount = -1;
    let scrubRafId = null;
    let resizeDebounceId = null;

    // Pre-rendered glow sprites eliminate expensive per-particle ctx.shadowBlur calls
    function createGlowSprite(hexColor) {
      const size = 28;
      const half = size / 2;
      const offscreen = document.createElement('canvas');
      offscreen.width = size;
      offscreen.height = size;
      const octx = offscreen.getContext('2d');
      const grad = octx.createRadialGradient(half, half, 0, half, half, half);
      grad.addColorStop(0, hexColor);
      grad.addColorStop(0.32, hexColor);
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      octx.fillStyle = grad;
      octx.fillRect(0, 0, size, size);
      return offscreen;
    }

    const spritePalette = [
      createGlowSprite('#00f0ff'),
      createGlowSprite('#8a2be2'),
      createGlowSprite('#3b82f6')
    ];

    const particleCount = isLowPerf ? 20 : (mobileQuery.matches ? 28 : 48);
    const particles = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: (Math.random() - 0.5) * 1000,
        y: (Math.random() - 0.5) * 1000,
        z: Math.random() * 1000,
        size: Math.random() * 2.4 + 1.1,
        cosIdx: Math.cos(i),
        sinIdx: Math.sin(i),
        sprite: spritePalette[i % 3]
      });
    }

    function measureScrollyLayout() {
      wrapperTop = scrollyWrapper.offsetTop;
      scrollableHeight = Math.max(1, scrollyWrapper.offsetHeight - scrollyViewport.offsetHeight);
    }

    function resizeCanvas(force, skipRender) {
      const parent = scrollyCanvas.parentElement;
      if (!parent) return;
      const nextWidth = parent.clientWidth;
      const nextHeight = parent.clientHeight;

      // Ignore small height-only shifts from mobile URL bar showing/hiding while scrolling
      if (!force && nextWidth === canvasWidth && Math.abs(nextHeight - canvasHeight) < 120) {
        return;
      }

      canvasWidth = nextWidth;
      canvasHeight = nextHeight;

      isLowPerf = detectLowPerfMode();
      root.classList.toggle('low-perf-mode', isLowPerf);

      const rawDpr = window.devicePixelRatio || 1;
      dpr = isLowPerf ? 1 : (mobileQuery.matches ? Math.min(rawDpr, 1.25) : Math.min(rawDpr, 1.5));

      scrollyCanvas.width = Math.max(1, Math.floor(canvasWidth * dpr));
      scrollyCanvas.height = Math.max(1, Math.floor(canvasHeight * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      measureScrollyLayout();
      lastCanvasProgress = -1;
      if (!skipRender) {
        renderScrollyCanvas(currentProgress);
        lastCanvasProgress = currentProgress;
      }
    }

    function renderScrollyCanvas(progress) {
      if (!ctx || canvasWidth === 0 || canvasHeight === 0) return;

      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      const centerX = canvasWidth * 0.5;
      const centerY = canvasHeight * 0.5;

      // 1. Batched Perspective Mesh Grid (single draw call)
      const gridOffset = (progress * 400) % 40;
      const gridCols = mobileQuery.matches ? 8 : 14;
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.07)';
      ctx.lineWidth = 1;

      for (let i = -gridCols; i <= gridCols; i++) {
        const xProj = centerX + i * 45;
        ctx.moveTo(xProj, 0);
        ctx.lineTo(centerX + i * 140, canvasHeight);
      }

      const rowStep = isLowPerf ? 48 : 36;
      for (let y = 0; y < canvasHeight; y += rowStep) {
        const currY = (y + gridOffset) % canvasHeight;
        ctx.moveTo(0, currY);
        ctx.lineTo(canvasWidth, currY);
      }
      ctx.stroke();

      // 2. Futuristic 3D Orbit Ring Telemetry Core
      const rotationAngle = progress * Math.PI * 4;
      const coreScale = 0.85 + Math.sin(progress * Math.PI) * 0.35;

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.scale(coreScale, coreScale);

      // Outer HUD Ring
      ctx.save();
      ctx.rotate(rotationAngle * 0.3);
      ctx.beginPath();
      ctx.arc(0, 0, 180, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.25)';
      ctx.lineWidth = 2;
      ctx.setLineDash([15, 10, 5, 10]);
      ctx.stroke();
      ctx.restore();

      // Middle Counter-Rotating Tech Ring
      ctx.save();
      ctx.rotate(-rotationAngle * 0.6);
      ctx.beginPath();
      ctx.arc(0, 0, 130, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(138, 43, 226, 0.35)';
      ctx.lineWidth = 3;
      ctx.setLineDash([40, 20, 10, 20]);
      ctx.stroke();
      ctx.restore();

      // Inner Glowing Core Node (radial gradient, zero shadowBlur)
      const gradient = ctx.createRadialGradient(0, 0, 6, 0, 0, 80);
      gradient.addColorStop(0, 'rgba(0, 240, 255, 0.85)');
      gradient.addColorStop(0.5, 'rgba(138, 43, 226, 0.38)');
      gradient.addColorStop(1, 'rgba(0, 240, 255, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(0, 0, 80, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(0, 0, 8 + Math.sin(progress * 20) * 2.5, 0, Math.PI * 2);
      ctx.fillStyle = '#00f0ff';
      ctx.fill();
      ctx.restore();

      // 3. Scrubbed 3D Particle Constellation (precomputed trig + glow sprites)
      ctx.save();
      ctx.translate(centerX, centerY);

      const rotBase = rotationAngle * 0.2;
      const cosBase = Math.cos(rotBase);
      const sinBase = Math.sin(rotBase);

      let prevProjX = 0;
      let prevProjY = 0;
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.14)';
      ctx.lineWidth = 1;

      for (let idx = 0; idx < particles.length; idx++) {
        const p = particles[idx];
        const zPos = (p.z - progress * 800 + 1000) % 1000;
        const scale = 300 / (300 + zPos);

        const cosRot = cosBase * p.cosIdx - sinBase * p.sinIdx;
        const sinRot = sinBase * p.cosIdx + cosBase * p.sinIdx;
        const projX = (p.x * cosRot - p.y * sinRot) * scale;
        const projY = (p.x * sinRot + p.y * cosRot) * scale;

        const alpha = Math.min(1, Math.max(0.15, (1000 - zPos) / 1000));
        const drawSize = p.size * scale * 3.4;

        ctx.globalAlpha = alpha;
        ctx.drawImage(p.sprite, projX - drawSize, projY - drawSize, drawSize * 2, drawSize * 2);

        if (idx > 0 && idx % 4 === 0) {
          const dx = projX - prevProjX;
          const dy = projY - prevProjY;
          if (dx * dx + dy * dy < 14400) {
            ctx.moveTo(projX, projY);
            ctx.lineTo(prevProjX, prevProjY);
          }
        }
        prevProjX = projX;
        prevProjY = projY;
      }

      ctx.globalAlpha = 1;
      ctx.stroke();
      ctx.restore();
    }

    function updateStageProgress(progress) {
      if (scrubberProgress) {
        scrubberProgress.style.transform = `scaleX(${progress})`;
      }

      // Gate Opening Scroll Synchronization (Progress 0.0 -> 0.14)
      if (gateOverlay && gateLeft && gateRight && gateEmblem) {
        const gateProgress = Math.min(1, Math.max(0, progress / 0.14));
        const isDone = gateProgress >= 0.99;

        if (isDone !== lastGateDone) {
          gateOverlay.classList.toggle('done', isDone);
          lastGateDone = isDone;
        }

        if (!isDone && Math.abs(gateProgress - lastGateProgress) > 0.001) {
          gateLeft.style.transform = `translate3d(${-gateProgress * 100}%, 0, 0)`;
          gateRight.style.transform = `translate3d(${gateProgress * 100}%, 0, 0)`;
          gateEmblem.style.opacity = `${1 - gateProgress}`;
          gateEmblem.style.transform = `scale(${1 + gateProgress * 0.35})`;
          gateOverlay.style.pointerEvents = gateProgress >= 0.95 ? 'none' : 'all';
          lastGateProgress = gateProgress;
        }
      }

      // Draw canvas only when hero is visible and progress changed noticeably
      if (isHeroInView && Math.abs(progress - lastCanvasProgress) > 0.0004) {
        renderScrollyCanvas(progress);
        lastCanvasProgress = progress;
      }

      // Parallax Stage Threshold Transitions
      let nextActiveIndex = 0;
      if (progress < 0.23) {
        nextActiveIndex = 0;
      } else if (progress < 0.52) {
        nextActiveIndex = 1;
      } else if (progress < 0.78) {
        nextActiveIndex = 2;
      } else {
        nextActiveIndex = 3;
      }

      if (nextActiveIndex !== lastActiveIndex) {
        stages.forEach((stage, idx) => {
          if (stage) {
            stage.classList.toggle('active', idx === nextActiveIndex);
          }
        });
        lastActiveIndex = nextActiveIndex;
        activeStageIndex = nextActiveIndex;
        syncTypingState();
      }

      // Stage 2 Sentence-by-Sentence reveal (diffed count to avoid unnecessary DOM mutations)
      if (nextActiveIndex >= 1 || lastSentenceCount > 0) {
        const stage2Progress = Math.min(1, Math.max(0, (progress - 0.23) / (0.52 - 0.23)));
        let revealedCount = 0;
        if (nextActiveIndex >= 1) {
          for (let i = 0; i < sentenceElements.length; i++) {
            if (stage2Progress >= i * 0.15) revealedCount++;
          }
        }
        if (revealedCount !== lastSentenceCount) {
          for (let i = 0; i < sentenceElements.length; i++) {
            sentenceElements[i].classList.toggle('revealed', i < revealedCount);
          }
          lastSentenceCount = revealedCount;
        }
      }

      // Stage 3 Skill Meters (GPU transform scaleX, zero layout reflow)
      if (nextActiveIndex >= 2 || skillEntries.some(entry => entry.lastVal > 0)) {
        const stage3Progress = Math.min(1, Math.max(0, (progress - 0.52) / (0.78 - 0.52)));
        const factor = nextActiveIndex >= 2 ? Math.min(1, stage3Progress * 1.25) : 0;

        for (let i = 0; i < skillEntries.length; i++) {
          const entry = skillEntries[i];
          const currentVal = Math.round(entry.targetVal * factor);
          if (currentVal !== entry.lastVal) {
            if (entry.fill) entry.fill.style.transform = `scaleX(${currentVal / 100})`;
            if (entry.valText) entry.valText.textContent = `${currentVal}%`;
            entry.lastVal = currentVal;
          }
        }
      }

      // Stage 4 Feature Badges reveal (diffed count)
      if (nextActiveIndex === 3 || lastArchCount > 0) {
        const stage4Progress = Math.min(1, Math.max(0, (progress - 0.78) / (1.0 - 0.78)));
        let archCount = 0;
        if (nextActiveIndex === 3) {
          for (let i = 0; i < archElements.length; i++) {
            if (stage4Progress >= i * 0.22) archCount++;
          }
        }
        if (archCount !== lastArchCount) {
          for (let i = 0; i < archElements.length; i++) {
            archElements[i].classList.toggle('revealed', i < archCount);
          }
          lastArchCount = archCount;
        }
      }
    }

    function readTargetProgress() {
      const raw = (window.scrollY - wrapperTop) / scrollableHeight;
      return Math.min(1, Math.max(0, raw));
    }

    function stepScrub() {
      scrubRafId = null;
      const snapDirectly = prefersReducedMotionQuery.matches || touchQuery.matches || isLowPerf;

      if (snapDirectly) {
        currentProgress = targetProgress;
      } else {
        const delta = targetProgress - currentProgress;
        currentProgress = Math.abs(delta) < 0.0005 ? targetProgress : currentProgress + delta * 0.22;
      }

      updateStageProgress(currentProgress);

      if (Math.abs(targetProgress - currentProgress) > 0.0005) {
        scrubRafId = requestAnimationFrame(stepScrub);
      }
    }

    function scheduleScrubFrame() {
      if (!scrubRafId) {
        scrubRafId = requestAnimationFrame(stepScrub);
      }
    }

    // Track whether hero wrapper is near or inside the viewport
    if ('IntersectionObserver' in window) {
      const heroObserver = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          isHeroInView = entry.isIntersecting;
          syncTypingState();
          if (isHeroInView) {
            targetProgress = readTargetProgress();
            scheduleScrubFrame();
          }
        },
        { rootMargin: '140px 0px' }
      );
      heroObserver.observe(scrollyWrapper);
    }

    window.addEventListener(
      'scroll',
      () => {
        targetProgress = readTargetProgress();
        if (isHeroInView || !lastGateDone) {
          scheduleScrubFrame();
        }
      },
      { passive: true }
    );

    window.addEventListener(
      'resize',
      () => {
        if (resizeDebounceId) clearTimeout(resizeDebounceId);
        resizeDebounceId = setTimeout(() => {
          resizeCanvas(false);
          targetProgress = readTargetProgress();
          scheduleScrubFrame();
        }, 120);
      },
      { passive: true }
    );

    // Allow tapping/clicking the gate emblem to open smoothly into Stage 1
    if (gateOverlay) {
      gateOverlay.addEventListener('click', () => {
        measureScrollyLayout();
        const openScrollY = wrapperTop + scrollableHeight * 0.16;
        window.scrollTo({
          top: openScrollY,
          behavior: prefersReducedMotionQuery.matches ? 'auto' : 'smooth'
        });
      });
    }

    // Initial render & sync (also handles page reload mid-scroll)
    resizeCanvas(true, true);
    targetProgress = readTargetProgress();
    currentProgress = targetProgress;
    updateStageProgress(currentProgress);
    syncTypingState();
  } else {
    syncTypingState();
  }

  /* ==========================================
     4. NAVBAR SCROLLED STATE, MOBILE MENU & THEME
     ========================================== */
  const navbar = document.getElementById('navbar');
  const mobileToggle = document.getElementById('mobileToggle');
  const navMenu = document.getElementById('navMenu');
  const navLinks = Array.from(document.querySelectorAll('.nav-link'));
  let isNavbarScrolled = false;
  let navRafPending = false;

  function syncNavbarScrolled() {
    navRafPending = false;
    if (!navbar) return;
    const shouldScroll = window.scrollY > 50;
    if (shouldScroll !== isNavbarScrolled) {
      navbar.classList.toggle('scrolled', shouldScroll);
      isNavbarScrolled = shouldScroll;
    }
  }

  window.addEventListener(
    'scroll',
    () => {
      if (!navRafPending) {
        navRafPending = true;
        requestAnimationFrame(syncNavbarScrolled);
      }
    },
    { passive: true }
  );
  syncNavbarScrolled();

  // Mobile Menu Toggle
  function closeMobileMenu() {
    if (!navMenu || !navMenu.classList.contains('active')) return;
    navMenu.classList.remove('active');
    if (mobileToggle) {
      mobileToggle.setAttribute('aria-expanded', 'false');
      const icon = mobileToggle.querySelector('i');
      if (icon) icon.className = 'fa-solid fa-bars';
    }
  }

  if (mobileToggle && navMenu) {
    mobileToggle.setAttribute('aria-expanded', 'false');
    mobileToggle.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('active');
      mobileToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      const icon = mobileToggle.querySelector('i');
      if (icon) {
        icon.className = isOpen ? 'fa-solid fa-xmark' : 'fa-solid fa-bars';
      }
    });
  }

  // Theme Toggle (independent of mobileToggle)
  const themeToggle = document.getElementById('themeToggle');
  const savedTheme = localStorage.getItem('theme') || 'dark';
  if (savedTheme === 'light') {
    root.classList.add('light-theme');
    if (themeToggle) {
      const icon = themeToggle.querySelector('i');
      if (icon) icon.className = 'fa-solid fa-sun';
    }
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const isLight = root.classList.toggle('light-theme');
      localStorage.setItem('theme', isLight ? 'light' : 'dark');
      const icon = themeToggle.querySelector('i');
      if (icon) {
        icon.className = isLight ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
      }
    });
  }

  // Smooth Anchor Scrolling + Mobile Menu Auto-Close
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();
      closeMobileMenu();

      const targetTop = href === '#hero' ? 0 : target.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: targetTop,
        behavior: prefersReducedMotionQuery.matches ? 'auto' : 'smooth'
      });
    });
  });

  /* ==========================================
     5. ACTIVE NAVBAR LINK HIGHLIGHTING (NO LAYOUT THRASHING)
     ========================================== */
  const trackedTargets = Array.from(document.querySelectorAll('#hero, section[id]'));
  const navLinkBySection = new Map();
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href && href.startsWith('#')) {
      navLinkBySection.set(href.slice(1), link);
    }
  });

  function setActiveNavLink(id) {
    const targetLink = navLinkBySection.get(id);
    if (!targetLink) return;
    navLinks.forEach(link => link.classList.toggle('active', link === targetLink));
  }

  if ('IntersectionObserver' in window && trackedTargets.length > 0) {
    const navObserver = new IntersectionObserver(
      (entries) => {
        for (let i = 0; i < entries.length; i++) {
          if (entries[i].isIntersecting) {
            setActiveNavLink(entries[i].target.id);
          }
        }
      },
      { rootMargin: '-35% 0px -55% 0px', threshold: 0 }
    );
    trackedTargets.forEach(target => navObserver.observe(target));
  }

  /* ==========================================
     6. COMPOSITOR-DRIVEN SECTION REVEALS
     ========================================== */
  const revealElements = Array.from(document.querySelectorAll('.reveal-up, .reveal-fade, .reveal-left, .reveal-right'));

  if ('IntersectionObserver' in window && !prefersReducedMotionQuery.matches) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        for (let i = 0; i < entries.length; i++) {
          const entry = entries[i];
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-active');
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.08, rootMargin: '0px 0px -30px 0px' }
    );
    revealElements.forEach(el => revealObserver.observe(el));
  } else {
    revealElements.forEach(el => el.classList.add('reveal-active'));
  }

  /* ==========================================
     7. SKILL BARS & SINGLE-RAF COUNTER ANIMATION
     ========================================== */
  const skillsSection = document.getElementById('skills');
  let hasAnimatedSkills = false;

  function animateSkills() {
    const counters = [];

    document.querySelectorAll('.skill-card .skill-item').forEach(item => {
      const fillBar = item.querySelector('.progress-bar-fill');
      const percentageText = item.querySelector('.skill-percentage');
      if (!fillBar || !percentageText) return;

      const targetNum = parseInt(percentageText.getAttribute('data-target'), 10) || 0;
      fillBar.style.transform = `scaleX(${targetNum / 100})`;

      if (prefersReducedMotionQuery.matches) {
        percentageText.textContent = `${targetNum}%`;
      } else {
        counters.push({ el: percentageText, target: targetNum, last: -1 });
      }
    });

    if (counters.length === 0) return;

    const duration = 1100;
    const startTime = performance.now();

    function stepCounters(now) {
      const progress = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);

      for (let i = 0; i < counters.length; i++) {
        const counter = counters[i];
        const value = Math.round(counter.target * eased);
        if (value !== counter.last) {
          counter.el.textContent = `${value}%`;
          counter.last = value;
        }
      }

      if (progress < 1) {
        requestAnimationFrame(stepCounters);
      }
    }

    requestAnimationFrame(stepCounters);
  }

  if (skillsSection) {
    if ('IntersectionObserver' in window) {
      const skillsObserver = new IntersectionObserver(
        (entries, observer) => {
          if (entries[0].isIntersecting && !hasAnimatedSkills) {
            hasAnimatedSkills = true;
            animateSkills();
            observer.unobserve(skillsSection);
          }
        },
        { threshold: 0.15 }
      );
      skillsObserver.observe(skillsSection);
    } else {
      hasAnimatedSkills = true;
      animateSkills();
    }
  }

  /* ==========================================
     8. SKILL CATEGORY TAB FILTERING
     ========================================== */
  const tabBtns = document.querySelectorAll('.tab-btn');
  const skillCards = document.querySelectorAll('.skill-card');
  const cardTimers = new WeakMap();

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-tab');

      skillCards.forEach(card => {
        const prevTimer = cardTimers.get(card);
        if (prevTimer) clearTimeout(prevTimer);

        const category = card.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          card.style.display = 'block';
          const timer = setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 25);
          cardTimers.set(card, timer);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(16px)';
          const timer = setTimeout(() => {
            card.style.display = 'none';
          }, 260);
          cardTimers.set(card, timer);
        }
      });
    });
  });

  /* ==========================================
     8B. EDUCATION RESULTS ACCORDION TOGGLE
     ========================================== */
  document.querySelectorAll('.grade-toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const panelId = btn.getAttribute('aria-controls');
      const panel = panelId ? document.getElementById(panelId) : null;
      if (!panel) return;
      const isExpanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', isExpanded ? 'false' : 'true');
      panel.hidden = isExpanded;
    });
  });

  /* ==========================================
     9. CONTACT FORM SUBMISSION HANDLER (WhatsApp & Gmail)
     ========================================== */
  const contactForm = document.getElementById('contactForm');
  const formStatus = document.getElementById('formStatus');
  const methodOptions = document.querySelectorAll('.method-option');

  methodOptions.forEach(option => {
    option.addEventListener('click', () => {
      methodOptions.forEach(opt => opt.classList.remove('active'));
      option.classList.add('active');
      const radio = option.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;
    });
  });

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const subject = document.getElementById('subject').value.trim();
      const message = document.getElementById('message').value.trim();

      const selectedMethodRadio = document.querySelector('input[name="sendMethod"]:checked');
      const sendMethod = selectedMethodRadio ? selectedMethodRadio.value : 'whatsapp';

      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;

      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Preparing...';

      const formattedMessage = `Hi Viraj,\n\n*Name:* ${name}\n*Email:* ${email}\n*Subject:* ${subject}\n\n*Message:*\n${message}`;

      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;

        if (sendMethod === 'whatsapp') {
          const whatsappNumber = '9476926251';
          const waUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(formattedMessage)}`;

          formStatus.className = 'form-status success';
          formStatus.innerHTML = `<i class="fa-brands fa-whatsapp"></i> Opening WhatsApp to send message to <strong>+9476926251</strong>...`;

          window.open(waUrl, '_blank');
        } else {
          const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=virajwills2003@gmail.com&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(formattedMessage)}`;
          const mailtoUrl = `mailto:virajwills2003@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(formattedMessage)}`;

          formStatus.className = 'form-status success';
          formStatus.innerHTML = `<i class="fa-solid fa-envelope"></i> Opening Gmail to send message to <strong>virajwills2003@gmail.com</strong>...`;

          window.open(gmailUrl, '_blank') || window.location.assign(mailtoUrl);
        }

        contactForm.reset();

        setTimeout(() => {
          formStatus.innerHTML = '';
        }, 8000);
      }, 450);
    });
  }
});
