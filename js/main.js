/* =============================================
   J.A.R.V.I.S. HUD — Interactive Engine
   ============================================= */

(function () {
  'use strict';

  // ==================== BOOT SEQUENCE ====================
  const bootLines = [
    'INITIALIZING J.A.R.V.I.S. PROTOCOL...',
    'LOADING OPERATOR PROFILE: DEV ANANDHAN M',
    'ALL SYSTEMS OPERATIONAL. WELCOME, SIR.'
  ];

  function runBootSequence() {
    const overlay = document.getElementById('boot-overlay');
    if (!overlay) return;

    const lineEls = [
      document.getElementById('boot-line-1'),
      document.getElementById('boot-line-2'),
      document.getElementById('boot-line-3')
    ];

    let lineIndex = 0;

    function typeLine(el, text, cb) {
      let i = 0;
      const interval = setInterval(() => {
        el.textContent = text.slice(0, i + 1);
        i++;
        if (i >= text.length) {
          clearInterval(interval);
          if (cb) setTimeout(cb, 400);
        }
      }, 30);
    }

    function nextLine() {
      if (lineIndex < bootLines.length) {
        typeLine(lineEls[lineIndex], bootLines[lineIndex], () => {
          lineIndex++;
          nextLine();
        });
      } else {
        setTimeout(() => {
          overlay.classList.add('hidden');
          startMainAnimations();
        }, 600);
      }
    }

    nextLine();
  }

  // ==================== HUD CANVAS ====================
  let hudCanvas, hudCtx;
  let mouseX = 0.5, mouseY = 0.5;
  let animFrameId;

  function initHudCanvas() {
    hudCanvas = document.getElementById('jarvis-hud');
    if (!hudCanvas) return;

    hudCtx = hudCanvas.getContext('2d');
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX / window.innerWidth;
      mouseY = e.clientY / window.innerHeight;
    });

    renderHud();
  }

  function resizeCanvas() {
    if (!hudCanvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    hudCanvas.width = window.innerWidth * dpr;
    hudCanvas.height = window.innerHeight * dpr;
    hudCanvas.style.width = window.innerWidth + 'px';
    hudCanvas.style.height = window.innerHeight + 'px';
    if (hudCtx) hudCtx.scale(dpr, dpr);
  }

  function renderHud() {
    if (!hudCtx) return;

    const w = window.innerWidth;
    const h = window.innerHeight;
    const t = performance.now() * 0.001;

    hudCtx.clearRect(0, 0, w, h);

    const cx = w * 0.5 + (mouseX - 0.5) * 60;
    const cy = h * 0.5 + (mouseY - 0.5) * 60;

    // Concentric circles
    for (let i = 0; i < 5; i++) {
      const r = 80 + i * 60 + Math.sin(t + i) * 10;
      const alpha = 0.04 + (0.03 * (1 - i / 5));
      hudCtx.beginPath();
      hudCtx.arc(cx, cy, r, 0, Math.PI * 2);
      hudCtx.strokeStyle = `rgba(0, 212, 255, ${alpha})`;
      hudCtx.lineWidth = 1;
      hudCtx.stroke();
    }

    // Rotating arcs
    for (let i = 0; i < 3; i++) {
      const r = 150 + i * 80;
      const startAngle = t * (0.3 + i * 0.15) + i * 2;
      const sweepAngle = Math.PI * (0.3 + i * 0.1);
      const alpha = 0.08 - i * 0.015;

      hudCtx.beginPath();
      hudCtx.arc(cx, cy, r, startAngle, startAngle + sweepAngle);
      hudCtx.strokeStyle = `rgba(0, 212, 255, ${alpha})`;
      hudCtx.lineWidth = 1.5;
      hudCtx.stroke();

      // Reverse arc
      hudCtx.beginPath();
      hudCtx.arc(cx, cy, r, startAngle + Math.PI, startAngle + Math.PI + sweepAngle * 0.6);
      hudCtx.strokeStyle = `rgba(240, 192, 64, ${alpha * 0.8})`;
      hudCtx.lineWidth = 1;
      hudCtx.stroke();
    }

    // Radar sweep
    const sweepAngle = t * 0.5;
    const sweepR = 200;
    const gradient = hudCtx.createLinearGradient(
      cx + Math.cos(sweepAngle) * sweepR,
      cy + Math.sin(sweepAngle) * sweepR,
      cx,
      cy
    );
    gradient.addColorStop(0, 'rgba(0, 212, 255, 0.06)');
    gradient.addColorStop(1, 'rgba(0, 212, 255, 0)');

    hudCtx.beginPath();
    hudCtx.moveTo(cx, cy);
    hudCtx.arc(cx, cy, sweepR, sweepAngle, sweepAngle + 0.4);
    hudCtx.closePath();
    hudCtx.fillStyle = gradient;
    hudCtx.fill();

    // Floating data points
    for (let i = 0; i < 30; i++) {
      const angle = (i / 30) * Math.PI * 2 + t * 0.1;
      const dist = 100 + Math.sin(t * 0.5 + i * 0.7) * 150;
      const px = cx + Math.cos(angle) * dist;
      const py = cy + Math.sin(angle) * dist;
      const size = 1.5 + Math.sin(t + i) * 0.8;
      const alpha = 0.15 + Math.sin(t * 0.8 + i) * 0.1;

      hudCtx.beginPath();
      hudCtx.arc(px, py, size, 0, Math.PI * 2);
      hudCtx.fillStyle = i % 4 === 0
        ? `rgba(240, 192, 64, ${alpha})`
        : `rgba(0, 212, 255, ${alpha})`;
      hudCtx.fill();
    }

    // Corner HUD brackets
    drawCornerBrackets(hudCtx, w, h, t);

    animFrameId = requestAnimationFrame(renderHud);
  }

  function drawCornerBrackets(ctx, w, h, t) {
    const size = 40;
    const margin = 30;
    const alpha = 0.12 + Math.sin(t * 2) * 0.04;

    ctx.strokeStyle = `rgba(0, 212, 255, ${alpha})`;
    ctx.lineWidth = 1.5;

    // Top-left
    ctx.beginPath();
    ctx.moveTo(margin, margin + size);
    ctx.lineTo(margin, margin);
    ctx.lineTo(margin + size, margin);
    ctx.stroke();

    // Top-right
    ctx.beginPath();
    ctx.moveTo(w - margin - size, margin);
    ctx.lineTo(w - margin, margin);
    ctx.lineTo(w - margin, margin + size);
    ctx.stroke();

    // Bottom-left
    ctx.beginPath();
    ctx.moveTo(margin, h - margin - size);
    ctx.lineTo(margin, h - margin);
    ctx.lineTo(margin + size, h - margin);
    ctx.stroke();

    // Bottom-right
    ctx.beginPath();
    ctx.moveTo(w - margin - size, h - margin);
    ctx.lineTo(w - margin, h - margin);
    ctx.lineTo(w - margin, h - margin - size);
    ctx.stroke();
  }

  // ==================== SMOOTH SCROLL (LENIS) ====================
  let lenis;

  function initLenis() {
    if (typeof Lenis === 'undefined') return;

    lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    });

    // Synchronize Lenis with GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);
  }

  // ==================== SCROLL ANIMATIONS ====================
  function initScrollAnimations() {
    // Section reveals with IntersectionObserver
    const sections = document.querySelectorAll('.jarvis-section');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          // If it has skill bars, animate them
          animateSkillBars(entry.target);
          // If it has counters, animate them
          animateCounters(entry.target);
        }
      });
    }, { threshold: 0.15 });

    sections.forEach((s) => observer.observe(s));

    // Auto-reveal hero
    const hero = document.getElementById('hero');
    if (hero) hero.classList.add('visible');

    // Nav scroll state
    window.addEventListener('scroll', () => {
      const nav = document.getElementById('jarvis-nav');
      if (nav) {
        nav.classList.toggle('scrolled', window.scrollY > 50);
      }

      // Highlight active nav link
      updateActiveNavLink();
    });

    // Smooth scroll for nav links using Lenis
    document.querySelectorAll('.nav-links a').forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = link.getAttribute('href');
        if (lenis && target) {
          lenis.scrollTo(target, { offset: -20 });
        } else {
          const targetEl = document.querySelector(target);
          if (targetEl) targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });

    // Also smooth scroll for hero CTA buttons using Lenis
    document.querySelectorAll('.btn-jarvis').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const href = btn.getAttribute('href');
        if (href && href.startsWith('#')) {
          e.preventDefault();
          if (lenis) {
            lenis.scrollTo(href, { offset: -20 });
          } else {
            const targetEl = document.querySelector(href);
            if (targetEl) targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      });
    });
  }

  function updateActiveNavLink() {
    const sections = document.querySelectorAll('.jarvis-section');
    const links = document.querySelectorAll('.nav-links a');
    let current = '';

    sections.forEach((s) => {
      const top = s.offsetTop - 120;
      if (window.scrollY >= top) {
        current = s.getAttribute('id');
      }
    });

    links.forEach((link) => {
      link.classList.toggle('active', link.getAttribute('data-section') === current);
    });
  }

  // ==================== SKILL BARS ====================
  const animatedSkillSections = new Set();

  function animateSkillBars(section) {
    if (animatedSkillSections.has(section)) return;
    const bars = section.querySelectorAll('.skill-bar');
    if (bars.length === 0) return;
    animatedSkillSections.add(section);

    bars.forEach((bar, i) => {
      const level = bar.getAttribute('data-level') || 50;
      bar.style.setProperty('--level', level);
      setTimeout(() => {
        bar.classList.add('animated');
      }, i * 100);
    });
  }

  // ==================== COUNTER ANIMATION ====================
  const animatedCounterContainers = new Set();

  function animateCounters(section) {
    if (animatedCounterContainers.has(section)) return;
    const counters = section.querySelectorAll('[data-count]');
    if (counters.length === 0) return;
    animatedCounterContainers.add(section);

    counters.forEach((el) => {
      const target = parseInt(el.getAttribute('data-count'), 10);
      const duration = 2000;
      const start = performance.now();

      function tick(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        // ease-out-cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(target * eased);
        if (progress < 1) {
          requestAnimationFrame(tick);
        } else {
          el.textContent = target;
        }
      }

      requestAnimationFrame(tick);
    });
  }

  // ==================== TYPING EFFECT ON HERO ====================
  function typeHeroTitle() {
    const lines = document.querySelectorAll('.title-line');
    if (lines.length === 0) return;

    lines.forEach((line) => {
      const text = line.textContent;
      line.textContent = '';
      line.style.opacity = '1';
      line.dataset.fullText = text;
    });

    let lineIdx = 0;

    function typeLine() {
      if (lineIdx >= lines.length) return;
      const line = lines[lineIdx];
      const text = line.dataset.fullText;
      let charIdx = 0;

      const interval = setInterval(() => {
        line.textContent = text.slice(0, charIdx + 1);
        charIdx++;
        if (charIdx >= text.length) {
          clearInterval(interval);
          lineIdx++;
          setTimeout(typeLine, 200);
        }
      }, 40);
    }

    typeLine();
  }

  // ==================== CLOCK ====================
  function startClock() {
    const clockEl = document.getElementById('nav-clock');
    if (!clockEl) return;

    function update() {
      const now = new Date();
      clockEl.textContent = now.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    }

    update();
    setInterval(update, 1000);
  }

  // ==================== YEAR ====================
  function setYear() {
    const el = document.getElementById('year');
    if (el) el.textContent = new Date().getFullYear().toString();
  }

  // ==================== PROJECT CARD TILT ====================
  function initCardTilt() {
    const cards = document.querySelectorAll('[data-tilt]');
    cards.forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        const tiltX = (y - 0.5) * -8;
        const tiltY = (x - 0.5) * 8;
        card.style.transform = `perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-6px)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) translateY(0)';
      });
    });
  }

  // ==================== GSAP ENHANCED ANIMATIONS ====================
  function initGSAPAnimations() {
    if (!window.gsap || !window.ScrollTrigger) return;

    gsap.registerPlugin(ScrollTrigger);

    // Staggered reveals for project cards
    gsap.utils.toArray('.project-card').forEach((card, i) => {
      gsap.fromTo(card,
        { opacity: 0, y: 40, scale: 0.95 },
        {
          opacity: 1, y: 0, scale: 1,
          duration: 0.6,
          delay: i * 0.1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 85%',
          }
        }
      );
    });

    // Trophy cards
    gsap.utils.toArray('.trophy-card').forEach((card, i) => {
      gsap.fromTo(card,
        { opacity: 0, y: 30, scale: 0.9 },
        {
          opacity: 1, y: 0, scale: 1,
          duration: 0.5,
          delay: i * 0.15,
          ease: 'back.out(1.2)',
          scrollTrigger: {
            trigger: card,
            start: 'top 85%',
          }
        }
      );
    });

    // Achievement items
    gsap.utils.toArray('.achievement-item').forEach((item, i) => {
      gsap.fromTo(item,
        { opacity: 0, x: -30 },
        {
          opacity: 1, x: 0,
          duration: 0.5,
          delay: i * 0.1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: item,
            start: 'top 90%',
          }
        }
      );
    });

    // Timeline entries
    gsap.utils.toArray('.timeline-entry').forEach((entry, i) => {
      gsap.fromTo(entry,
        { opacity: 0, x: -40 },
        {
          opacity: 1, x: 0,
          duration: 0.6,
          delay: i * 0.2,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: entry,
            start: 'top 85%',
          }
        }
      );
    });
  }

  // ==================== MAIN ENTRY ====================
  function startMainAnimations() {
    initLenis();
    initHudCanvas();
    initScrollAnimations();
    initCardTilt();
    startClock();
    setYear();
    typeHeroTitle();

    // Wait a tick for GSAP to load (deferred)
    setTimeout(initGSAPAnimations, 100);
  }

  // ==================== INIT ====================
  window.addEventListener('DOMContentLoaded', () => {
    runBootSequence();
  });

})();
