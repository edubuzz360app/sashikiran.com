/* ══════════════════════════════════════════════════════════════════
   WEDDING PAGE — CINEMATIC ANIMATION ENGINE
   GSAP ScrollTrigger · Dual Canvas Particles · Countdown · Calendar
   ══════════════════════════════════════════════════════════════════ */

(() => {
  'use strict';

  /* ─────────────────────────────────────────
     0. GSAP SETUP
     ───────────────────────────────────────── */
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
  }

  const isMobile = window.innerWidth < 768;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ─────────────────────────────────────────
     1. LIVE COUNTDOWN TIMER
     ───────────────────────────────────────── */
  const cdDays = document.getElementById('cd-days');
  const cdHours = document.getElementById('cd-hours');
  const cdMins = document.getElementById('cd-mins');
  const cdSecs = document.getElementById('cd-secs');

  if (cdDays && cdHours && cdMins && cdSecs) {
    const target = new Date('2026-11-28T18:00:00+05:30').getTime();
    let prevVals = { d: '', h: '', m: '', s: '' };

    function flipIfChanged(el, newVal, key) {
      if (prevVals[key] !== newVal) {
        prevVals[key] = newVal;
        el.textContent = newVal;
        el.classList.remove('flip');
        void el.offsetWidth; // force reflow
        el.classList.add('flip');
      }
    }

    function tick() {
      const now = Date.now();
      const dist = target - now;

      if (dist <= 0) {
        cdDays.textContent = '00';
        cdHours.textContent = '00';
        cdMins.textContent = '00';
        cdSecs.textContent = '00';
        return;
      }

      const d = String(Math.floor(dist / 86400000)).padStart(2, '0');
      const h = String(Math.floor((dist % 86400000) / 3600000)).padStart(2, '0');
      const m = String(Math.floor((dist % 3600000) / 60000)).padStart(2, '0');
      const s = String(Math.floor((dist % 60000) / 1000)).padStart(2, '0');

      flipIfChanged(cdDays, d, 'd');
      flipIfChanged(cdHours, h, 'h');
      flipIfChanged(cdMins, m, 'm');
      flipIfChanged(cdSecs, s, 's');
    }

    tick();
    setInterval(tick, 1000);
  }


  /* ─────────────────────────────────────────
     2. DUAL CANVAS PARTICLE SYSTEM
     ───────────────────────────────────────── */

  // --- 2A: Back Canvas — Ambient Golden Stardust & Floating Bokeh Orbs ---
  const backCanvas = document.getElementById('canvas-particles-back');
  if (backCanvas && !prefersReducedMotion) {
    const ctx = backCanvas.getContext('2d');
    let bW, bH;

    function resizeBack() {
      const heroSection = backCanvas.closest('.fold-hero');
      if (heroSection) {
        bW = backCanvas.width = heroSection.clientWidth;
        bH = backCanvas.height = heroSection.clientHeight;
      } else {
        bW = backCanvas.width = window.innerWidth;
        bH = backCanvas.height = window.innerHeight;
      }
    }
    resizeBack();
    window.addEventListener('resize', resizeBack);

    // Particle types: Stardust (fine glowing specks), Bokeh (large soft translucent orbs), Sparkle (4-point micro stars)
    const particleCount = isMobile ? 12 : 55;
    const particles = [];

    for (let i = 0; i < particleCount; i++) {
      const randType = Math.random();
      let type = 'stardust';
      if (randType < 0.28) type = 'bokeh';
      else if (randType < 0.45) type = 'sparkle';

      particles.push({
        type,
        x: Math.random() * (bW || window.innerWidth),
        y: Math.random() * (bH || window.innerHeight),
        size: type === 'bokeh' ? Math.random() * 24 + 10 : (type === 'sparkle' ? Math.random() * 4 + 2 : Math.random() * 2.8 + 1.2),
        speedY: type === 'bokeh' ? Math.random() * 0.35 + 0.12 : Math.random() * 0.6 + 0.25,
        speedX: (Math.random() - 0.5) * 0.3,
        opacity: type === 'bokeh' ? Math.random() * 0.25 + 0.08 : Math.random() * 0.55 + 0.35,
        phase: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 0.002 + 0.001,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.02
      });
    }

    function drawSparkle(ctx, x, y, size) {
      ctx.beginPath();
      ctx.moveTo(x, y - size * 1.8);
      ctx.quadraticCurveTo(x, y, x + size * 1.8, y);
      ctx.quadraticCurveTo(x, y, x, y + size * 1.8);
      ctx.quadraticCurveTo(x, y, x - size * 1.8, y);
      ctx.quadraticCurveTo(x, y, x, y - size * 1.8);
      ctx.fill();
    }

    function animateBack() {
      ctx.clearRect(0, 0, bW, bH);
      const now = Date.now();

      particles.forEach(p => {
        // Anti-gravity rising physics with soft harmonic oscillation
        p.y -= p.speedY;
        p.x += Math.sin(now * 0.001 + p.phase) * 0.45 + p.speedX;
        p.rotation += p.rotSpeed;

        // Wrap around viewport edges
        if (p.y < -40) {
          p.y = bH + 30;
          p.x = Math.random() * bW;
        }
        if (p.x < -30) p.x = bW + 30;
        if (p.x > bW + 30) p.x = -30;

        const currentOpacity = p.opacity + Math.sin(now * p.pulseSpeed + p.phase) * 0.15;

        ctx.save();
        ctx.globalAlpha = Math.max(0.04, Math.min(1, currentOpacity));

        if (p.type === 'bokeh') {
          // Soft out-of-focus luminous orb with radial glow
          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
          grad.addColorStop(0, 'rgba(255, 235, 175, 0.45)');
          grad.addColorStop(0.4, 'rgba(212, 175, 55, 0.22)');
          grad.addColorStop(0.75, 'rgba(212, 175, 55, 0.08)');
          grad.addColorStop(1, 'rgba(212, 175, 55, 0)');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.type === 'sparkle') {
          // Twinkling 4-point diamond star
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.fillStyle = '#FFF9E6';
          ctx.shadowColor = '#D4AF37';
          ctx.shadowBlur = 8;
          drawSparkle(ctx, 0, 0, p.size);
        } else {
          // Fine golden stardust ember
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(246, 231, 176, 0.85)';
          ctx.shadowColor = 'rgba(212, 175, 55, 0.6)';
          ctx.shadowBlur = 4;
          ctx.fill();
        }

        ctx.restore();
      });

      requestAnimationFrame(animateBack);
    }
    animateBack();
  }


  // --- 2B: Front Canvas — Rose Petals (Foreground, in front of cutout) ---
  const frontCanvas = document.getElementById('canvas-petals-front');
  if (frontCanvas && !prefersReducedMotion) {
    const fCtx = frontCanvas.getContext('2d');
    let fW, fH;

    function resizeFront() {
      const heroSection = frontCanvas.closest('.fold-hero');
      if (heroSection) {
        fW = frontCanvas.width = heroSection.clientWidth;
        fH = frontCanvas.height = heroSection.clientHeight;
      } else {
        fW = frontCanvas.width = window.innerWidth;
        fH = frontCanvas.height = window.innerHeight;
      }
    }
    resizeFront();
    window.addEventListener('resize', resizeFront);

    const petalCount = isMobile ? 12 : 26;
    const flowerTypes = [
      { type: 'jasmine', color: 'rgba(255, 253, 242, 0.9)', glow: 'rgba(252, 246, 186, 0.4)' },
      { type: 'marigold_orange', color: 'rgba(255, 140, 0, 0.82)', glow: 'rgba(255, 100, 0, 0.35)' },
      { type: 'marigold_yellow', color: 'rgba(255, 215, 0, 0.85)', glow: 'rgba(255, 190, 0, 0.4)' },
      { type: 'rose_crimson', color: 'rgba(215, 38, 61, 0.72)', glow: 'rgba(180, 20, 40, 0.3)' },
      { type: 'rose_peach', color: 'rgba(255, 138, 128, 0.65)', glow: 'rgba(255, 100, 100, 0.25)' }
    ];

    let scrollVelocity = 0;
    let lastScrollY = window.scrollY;

    window.addEventListener('scroll', () => {
      const currentY = window.scrollY;
      scrollVelocity = Math.abs(currentY - lastScrollY);
      lastScrollY = currentY;
    }, { passive: true });

    const petals = [];
    for (let i = 0; i < petalCount; i++) {
      const flType = flowerTypes[Math.floor(Math.random() * flowerTypes.length)];
      petals.push({
        type: flType.type,
        color: flType.color,
        glow: flType.glow,
        x: Math.random() * (fW || window.innerWidth),
        y: Math.random() * (fH || window.innerHeight),
        size: flType.type === 'jasmine' ? Math.random() * 4 + 3 : Math.random() * 6.5 + 4,
        speedY: Math.random() * 1.1 + 0.4,
        speedX: (Math.random() - 0.5) * 0.7,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.04,
        wobblePhase: Math.random() * Math.PI * 2
      });
    }

    function animatePetals() {
      fCtx.clearRect(0, 0, fW, fH);

      // Wind force from scroll velocity
      const windForce = Math.min(scrollVelocity * 0.3, 8);
      scrollVelocity *= 0.92; // decay

      petals.forEach(p => {
        p.y += p.speedY;
        p.x += Math.sin(p.y * 0.01 + p.wobblePhase) * 1.2 + p.speedX;
        p.rotation += p.rotationSpeed;

        // Scroll-disturbed petal burst
        p.x += (Math.random() - 0.5) * windForce;
        p.y += (Math.random() - 0.3) * windForce * 0.5;

        if (p.y > fH + 30) {
          p.y = -30;
          p.x = Math.random() * fW;
        }
        if (p.x < -30) p.x = fW + 30;
        if (p.x > fW + 30) p.x = -30;

        fCtx.save();
        fCtx.translate(p.x, p.y);
        fCtx.rotate(p.rotation);
        fCtx.fillStyle = p.color;

        if (p.type === 'jasmine') {
          // Delicate Jasmine bud / petal floret
          fCtx.beginPath();
          fCtx.ellipse(-2, 0, p.size * 1.2, p.size * 0.65, -0.2, 0, Math.PI * 2);
          fCtx.ellipse(2, 0, p.size * 1.2, p.size * 0.65, 0.2, 0, Math.PI * 2);
          fCtx.fill();
        } else if (p.type.startsWith('marigold')) {
          // Ruffled curved Marigold petal
          fCtx.beginPath();
          fCtx.moveTo(0, -p.size * 1.6);
          fCtx.quadraticCurveTo(p.size * 1.2, 0, 0, p.size * 1.6);
          fCtx.quadraticCurveTo(-p.size * 1.2, 0, 0, -p.size * 1.6);
          fCtx.fill();
        } else {
          // Soft curved Rose petal
          fCtx.beginPath();
          fCtx.ellipse(0, 0, p.size * 1.6, p.size * 0.85, 0, 0, Math.PI * 2);
          fCtx.fill();
        }

        fCtx.restore();
      });

      requestAnimationFrame(animatePetals);
    }
    animatePetals();
  }


  /* ─────────────────────────────────────────
     2C. 3D GYROSCOPIC & CURSOR TILT ENGINE
     ───────────────────────────────────────── */
  const heroSection = document.getElementById('fold-hero');
  const heroCutout = document.getElementById('hero-cutout');
  const heroHalo = document.getElementById('hero-halo');
  const heroNames = document.getElementById('hero-names-stage');

  if (heroSection && !prefersReducedMotion) {
    let currentX = 0, currentY = 0;
    let targetX = 0, targetY = 0;

    function onMouseMove(e) {
      const rect = heroSection.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      targetX = Math.max(-1, Math.min(1, (e.clientX - cx) / (rect.width / 2)));
      targetY = Math.max(-1, Math.min(1, (e.clientY - cy) / (rect.height / 2)));
    }

    function onMouseLeave() {
      targetX = 0;
      targetY = 0;
    }

    heroSection.addEventListener('mousemove', onMouseMove, { passive: true });
    heroSection.addEventListener('mouseleave', onMouseLeave, { passive: true });

    // Gyroscope tilt on mobile devices
    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', (e) => {
        if (e.gamma !== null && e.beta !== null) {
          // gamma: left/right tilt [-90, 90], beta: front/back tilt [-180, 180]
          targetX = Math.max(-1, Math.min(1, e.gamma / 22));
          targetY = Math.max(-1, Math.min(1, (e.beta - 45) / 22));
        }
      }, { passive: true });
    }

    // High-performance RAF lerp loop
    function renderTilt() {
      currentX += (targetX - currentX) * 0.07;
      currentY += (targetY - currentY) * 0.07;

      if (heroCutout) {
        heroCutout.style.transform = `translateX(calc(-50% + ${currentX * 12}px)) translateY(${currentY * 7}px) rotate(${currentX * 1.2}deg)`;
      }
      if (heroHalo) {
        heroHalo.style.transform = `translateX(calc(-50% + ${currentX * 7}px)) translateY(${currentY * 5}px) scale(${1 + Math.abs(currentX) * 0.04})`;
      }
      if (heroNames) {
        heroNames.style.transform = `translate(calc(-50% - ${currentX * 8}px), calc(-50% - ${currentY * 5}px))`;
      }

      requestAnimationFrame(renderTilt);
    }
    renderTilt();
  }


  /* ─────────────────────────────────────────
     3. GSAP SCROLL-DRIVEN ANIMATIONS
     ───────────────────────────────────────── */
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined' && !prefersReducedMotion) {

    // --- 3A: Hero Cutout Parallax on Scroll ---
    const cutoutImg = document.querySelector('.hero__cutout-img');
    if (cutoutImg) {
      gsap.to(cutoutImg, {
        yPercent: 15,
        scale: 1.05,
        ease: 'none',
        scrollTrigger: {
          trigger: '.fold-hero',
          start: 'top top',
          end: 'bottom top',
          scrub: 1.5
        }
      });
    }

    // --- 3B: Mandala Expand + Fade ---
    const mandala = document.querySelector('.hero__mandala');
    if (mandala) {
      gsap.to(mandala, {
        scale: 1.4,
        opacity: 0.02,
        ease: 'none',
        scrollTrigger: {
          trigger: '.fold-hero',
          start: 'top top',
          end: 'bottom top',
          scrub: 2
        }
      });
    }

    // --- 3C: Scroll Cue Fade Out ---
    const scrollCue = document.getElementById('scroll-cue');
    if (scrollCue) {
      ScrollTrigger.create({
        trigger: '.fold-hero',
        start: 'top top',
        end: '100px top',
        onUpdate: (self) => {
          if (self.progress > 0.15) {
            scrollCue.classList.add('is-hidden');
          } else {
            scrollCue.classList.remove('is-hidden');
          }
        }
      });
    }

    // --- 3D: Pavilion Cards Staggered Reveal ---
    const pavilionLeft = document.getElementById('pavilion-groom');
    const pavilionRight = document.getElementById('pavilion-bride');

    if (pavilionLeft) {
      ScrollTrigger.create({
        trigger: pavilionLeft,
        start: 'top 85%',
        onEnter: () => pavilionLeft.classList.add('is-visible'),
        once: true
      });
    }
    if (pavilionRight) {
      ScrollTrigger.create({
        trigger: pavilionRight,
        start: 'top 85%',
        onEnter: () => {
          setTimeout(() => pavilionRight.classList.add('is-visible'), 150);
        },
        once: true
      });
    }

    // --- 3E: Event Cards Staggered Reveal ---
    document.querySelectorAll('.event-card').forEach((card, i) => {
      ScrollTrigger.create({
        trigger: card,
        start: 'top 85%',
        onEnter: () => {
          setTimeout(() => card.classList.add('is-visible'), i * 150);
        },
        once: true
      });
    });

    // --- 3F: Generic Scroll Reveal ---
    document.querySelectorAll('.reveal-on-scroll').forEach((el, i) => {
      ScrollTrigger.create({
        trigger: el,
        start: 'top 88%',
        onEnter: () => el.classList.add('is-visible'),
        once: true
      });
    });
  }


  /* ─────────────────────────────────────────
     4. SMOOTH SCROLL ANCHOR CLICKS
     ───────────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId && targetId !== '#') {
        const target = document.querySelector(targetId);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });


  /* ─────────────────────────────────────────
     5. CALENDAR (.ICS) DOWNLOAD + CONFETTI
     ───────────────────────────────────────── */
  const events = {
    engagement: {
      title: 'Sashikiran & Hari Lakshmi — Engagement & Reception',
      start: '20261128T180000',
      end: '20261128T220000',
      description: 'Engagement & Reception Celebration of Sashikiran & Hari Lakshmi at AMG Paradise, Madurai.',
      location: 'AMG Paradise, Gomathiyamman Nagar, Panangadi, Madurai, Tamil Nadu 625017, India'
    },
    marriage: {
      title: 'Sashikiran & Hari Lakshmi — Wedding Ceremony',
      start: '20261129T100000',
      end: '20261129T130000',
      description: 'Auspicious Muhurtham & Wedding Ceremony of Sashikiran & Hari Lakshmi at AMG Paradise, Madurai.',
      location: 'AMG Paradise, Gomathiyamman Nagar, Panangadi, Madurai, Tamil Nadu 625017, India'
    }
  };

  function generateICS(ev) {
    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Sashikiran Wedding//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `DTSTART;TZID=Asia/Kolkata:${ev.start}`,
      `DTEND;TZID=Asia/Kolkata:${ev.end}`,
      `SUMMARY:${ev.title}`,
      `DESCRIPTION:${ev.description}`,
      `LOCATION:${ev.location}`,
      'STATUS:CONFIRMED',
      `UID:${ev.start}-wedding@sashikiran.com`,
      'END:VEVENT',
      'END:VCALENDAR'
    ];
    return lines.join('\r\n');
  }

  window.addToCalendar = function (type) {
    const ev = events[type];
    if (!ev) return;

    // Download .ics
    const icsContent = generateICS(ev);
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type === 'engagement' ? 'Engagement' : 'Marriage'}_SashikiranWedding.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Trigger confetti burst
    fireConfetti();
  };


  /* ─────────────────────────────────────────
     6. CELEBRATION CONFETTI BURST
     ───────────────────────────────────────── */
  const confettiCanvas = document.getElementById('canvas-confetti');
  let confettiCtx, confettiW, confettiH;

  if (confettiCanvas) {
    confettiCtx = confettiCanvas.getContext('2d');
    confettiW = confettiCanvas.width = window.innerWidth;
    confettiH = confettiCanvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
      confettiW = confettiCanvas.width = window.innerWidth;
      confettiH = confettiCanvas.height = window.innerHeight;
    });
  }

  let confettiPieces = [];
  let confettiRunning = false;

  function fireConfetti() {
    if (!confettiCtx) return;

    const colors = ['#D4AF37', '#F4A261', '#E27D60', '#F4ACB7', '#FCF9F2', '#C59B27', '#8B1E2B', '#FF6B8A'];
    const count = isMobile ? 60 : 120;

    for (let i = 0; i < count; i++) {
      confettiPieces.push({
        x: confettiW * 0.5 + (Math.random() - 0.5) * confettiW * 0.3,
        y: confettiH * 0.5,
        vx: (Math.random() - 0.5) * 18,
        vy: -(Math.random() * 16 + 6),
        size: Math.random() * 8 + 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.15,
        gravity: 0.25 + Math.random() * 0.15,
        opacity: 1,
        decay: 0.005 + Math.random() * 0.008,
        shape: Math.random() > 0.5 ? 'rect' : 'circle'
      });
    }

    if (!confettiRunning) {
      confettiRunning = true;
      animateConfetti();
    }
  }

  function animateConfetti() {
    confettiCtx.clearRect(0, 0, confettiW, confettiH);

    confettiPieces.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.vx *= 0.99;
      p.rotation += p.rotSpeed;
      p.opacity -= p.decay;

      confettiCtx.save();
      confettiCtx.translate(p.x, p.y);
      confettiCtx.rotate(p.rotation);
      confettiCtx.globalAlpha = Math.max(0, p.opacity);
      confettiCtx.fillStyle = p.color;

      if (p.shape === 'rect') {
        confettiCtx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      } else {
        confettiCtx.beginPath();
        confettiCtx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        confettiCtx.fill();
      }

      confettiCtx.restore();
    });

    confettiPieces = confettiPieces.filter(p => p.opacity > 0 && p.y < confettiH + 50);

    if (confettiPieces.length > 0) {
      requestAnimationFrame(animateConfetti);
    } else {
      confettiRunning = false;
      confettiCtx.clearRect(0, 0, confettiW, confettiH);
    }
  }


  /* ─────────────────────────────────────────
     7. DIVINE TAMIL WEDDING MUSIC (NADASWARAM)
     ───────────────────────────────────────── */
  const audioToggle = document.getElementById('audio-toggle');
  let audio = null;
  let audioPlaying = false;
  let audioInitialized = false;

  function initAudio() {
    if (audioInitialized) return;
    audioInitialized = true;

    audio = new Audio();
    audio.src = '/wedding/celebration.mp3';
    audio.loop = true;
    audio.volume = 0.45;

    audio.addEventListener('play', () => {
      audioPlaying = true;
      if (audioToggle) audioToggle.classList.add('is-playing');
    });

    audio.addEventListener('pause', () => {
      audioPlaying = false;
      if (audioToggle) audioToggle.classList.remove('is-playing');
    });

    audio.addEventListener('error', () => {
      console.info('Audio primary source failed, trying relative path...');
      if (audio.src && audio.src.indexOf('/wedding/') !== -1) {
        audio.src = 'celebration.mp3';
      }
    });
  }

  function startDivineMusic() {
    initAudio();
    if (!audio) return;
    if (audioPlaying) return;

    audio.play().then(() => {
      audioPlaying = true;
      if (audioToggle) audioToggle.classList.add('is-playing');
    }).catch(() => {
      // Browser autoplay policy restricted — will start on next interaction
    });
  }

  // Attempt autoplay immediately on page load
  if (document.readyState === 'complete') {
    startDivineMusic();
  } else {
    window.addEventListener('load', startDivineMusic, { once: true });
  }

  // Instant trigger on any first user gesture (touch, scroll, click, keydown)
  const userGestureEvents = ['click', 'touchstart', 'scroll', 'keydown', 'pointerdown'];
  function onFirstUserInteraction() {
    startDivineMusic();
    userGestureEvents.forEach(evt => window.removeEventListener(evt, onFirstUserInteraction));
    userGestureEvents.forEach(evt => document.removeEventListener(evt, onFirstUserInteraction));
  }
  userGestureEvents.forEach(evt => window.addEventListener(evt, onFirstUserInteraction, { once: true, passive: true }));
  userGestureEvents.forEach(evt => document.addEventListener(evt, onFirstUserInteraction, { once: true, passive: true }));

  if (audioToggle) {
    audioToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      initAudio();
      if (!audio) return;

      if (audioPlaying) {
        audio.pause();
      } else {
        audio.play().catch(err => console.log('Audio play error:', err));
      }
    });
  }

})();
