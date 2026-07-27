import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { initAllModeSwitches, initModeNavLinks, settleModeTransition } from './mode-switch.js';

gsap.registerPlugin(ScrollTrigger);

initAllModeSwitches();
initModeNavLinks();
settleModeTransition();

// ==========================================
// 1. NAVBAR
// ==========================================
const nav = document.getElementById('site-nav');
if (nav) {
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 80);
  });
}

const hamburger = document.querySelector('.hamburger-menu');
const navLinks = document.querySelector('.nav-links');

if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('active');
  });

  document.querySelectorAll('.nav-link, .nav-cta').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navLinks.classList.remove('active');
    });
  });
}

// ==========================================
// 2. CELESTIAL SPACE PARTICLES ENGINE
// ==========================================
const canvas = document.getElementById('sequence-canvas');
const ctx = canvas ? canvas.getContext('2d') : null;
let particles = [];

if (canvas && ctx) {
  class Particle {
    constructor() {
      this.x = Math.random() * window.innerWidth;
      this.y = Math.random() * window.innerHeight;
      this.z = Math.random() * 2 + 0.1; // Depth (size & speed modifier)
      this.baseSize = this.z * 1.5;
      this.speedY = -(this.z * 0.3) - 0.1; // Float upwards
      this.speedX = (Math.random() - 0.5) * 0.2;

      // Red/Gold hues for SashVerse
      const isGold = Math.random() > 0.85;
      this.color = isGold ? '255, 179, 71' : '225, 6, 0';
      this.opacity = Math.random() * 0.5 + 0.2;

      // Pulse animation
      this.angle = Math.random() * Math.PI * 2;
      this.pulseSpeed = Math.random() * 0.05 + 0.01;
    }

    update(scrollVelocity) {
      // Add scroll velocity to Y speed
      this.y += this.speedY - (scrollVelocity * this.z * 0.05);
      this.x += this.speedX;

      this.angle += this.pulseSpeed;

      // Wrap around
      if (this.y < -20) this.y = canvas.height + 20;
      if (this.y > canvas.height + 20) this.y = -20;
      if (this.x < -20) this.x = canvas.width + 20;
      if (this.x > canvas.width + 20) this.x = -20;
    }

    draw() {
      const currentOpacity = this.opacity + Math.sin(this.angle) * 0.2;
      const currentSize = Math.max(0.1, this.baseSize + Math.sin(this.angle) * 0.5);

      ctx.beginPath();
      ctx.arc(this.x, this.y, currentSize, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.color}, ${Math.max(0, Math.min(1, currentOpacity))})`;

      // Glow
      ctx.shadowBlur = this.z * 4;
      ctx.shadowColor = `rgba(${this.color}, 1)`;

      ctx.fill();
      ctx.shadowBlur = 0; // Reset
    }
  }

  function initParticles() {
    particles = [];
    const numParticles = Math.floor((window.innerWidth * window.innerHeight) / 9000);
    for (let i = 0; i < numParticles; i++) {
      particles.push(new Particle());
    }
  }

  // Track scroll velocity for interactive particles
  let lastScrollY = window.scrollY;

  function animateParticles() {
    // Calculate scroll velocity
    const currentScrollY = window.scrollY;
    const scrollVelocity = currentScrollY - lastScrollY;
    lastScrollY = currentScrollY;

    // Clear with a very slight trailing effect
    ctx.fillStyle = 'rgba(5, 7, 15, 0.4)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < particles.length; i++) {
      particles[i].update(scrollVelocity);
      particles[i].draw();
    }

    requestAnimationFrame(animateParticles);
  }

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initParticles();
  }

  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();
  animateParticles();
}

// ==========================================
// 4. GSAP SCROLL ANIMATIONS (CONTENT)
// ==========================================

// --- Hero content fade out ---
gsap.to('.hero-content', {
  opacity: 0,
  y: -50,
  ease: 'none',
  scrollTrigger: {
    trigger: '.fold-hero',
    start: '30% top',
    end: 'bottom top',
    scrub: true
  }
});

// --- Helix lines stagger reveal ---
gsap.utils.toArray('.helix-line').forEach((line, i) => {
  gsap.to(line, {
    opacity: 1,
    y: 0,
    duration: 1,
    scrollTrigger: {
      trigger: '.fold-helix',
      start: `${15 + i * 15}% bottom`,
      end: `${35 + i * 15}% center`,
      scrub: 1
    }
  });
});

// --- Magic S dissolving (only after leaving the hero) ---
gsap.to('.magic-s', {
  opacity: 0,
  filter: 'blur(10px)',
  scale: 1.5,
  ease: 'none',
  scrollTrigger: {
    trigger: '.fold-hero',
    start: 'bottom top',
    end: 'bottom top-=30%',
    scrub: 1,
  }
});

// --- Section headers ---
gsap.utils.toArray('.section-header.reveal-block').forEach(header => {
  gsap.to(header, {
    opacity: 1,
    y: 0,
    duration: 1,
    scrollTrigger: {
      trigger: header,
      start: 'top 80%',
      end: 'top 50%',
      scrub: 1
    }
  });
});

// --- Species video reveal ---
gsap.to('.species-video-container.reveal-block', {
  opacity: 1,
  y: 0,
  duration: 1,
  scrollTrigger: {
    trigger: '.species-video-container',
    start: 'top 85%',
    toggleActions: 'play none none none'
  }
});

// --- Agent cards stagger ---
gsap.utils.toArray('.agent-card.reveal-card').forEach((card, i) => {
  gsap.to(card, {
    opacity: 1,
    y: 0,
    duration: 0.8,
    scrollTrigger: {
      trigger: card,
      start: 'top 85%',
      toggleActions: 'play none none none'
    },
    delay: i * 0.1
  });
});

// --- SAS cards stagger ---
gsap.utils.toArray('.sas-card.reveal-card').forEach((card, i) => {
  gsap.to(card, {
    opacity: 1,
    y: 0,
    duration: 0.8,
    scrollTrigger: {
      trigger: card,
      start: 'top 85%',
      toggleActions: 'play none none none'
    },
    delay: i * 0.12
  });
});

// --- Creator reveal ---
gsap.to('.creator-inner.reveal-block', {
  opacity: 1,
  y: 0,
  duration: 1.2,
  scrollTrigger: {
    trigger: '.fold-creator',
    start: 'top 65%',
    toggleActions: 'play none none none'
  }
});

// --- CTA reveal ---
gsap.to('.cta-inner.reveal-block', {
  opacity: 1,
  y: 0,
  duration: 1.2,
  scrollTrigger: {
    trigger: '.fold-cta',
    start: 'top 70%',
    toggleActions: 'play none none none'
  }
});

// ==========================================
// 7. CUSTOM CURSOR SYSTEM
// ==========================================
const cursorDot = document.querySelector('.cursor-dot');
const cursorRing = document.querySelector('.cursor-ring');

let mouseX = -100, mouseY = -100;
let dotX = -100, dotY = -100;
let ringX = -100, ringY = -100;
let cursorVisible = false;

// Lerp constant for smoothing the trailing outer ring
const lerp = (start, end, amt) => (1 - amt) * start + amt * end;

// Track mouse instantly
window.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;

  if (!cursorVisible && cursorDot && cursorRing) {
    cursorVisible = true;
    dotX = mouseX;
    dotY = mouseY;
    ringX = mouseX;
    ringY = mouseY;
    cursorDot.classList.add('is-visible');
    cursorRing.classList.add('is-visible');
  }
});

// Animate using requestAnimationFrame
function animateCursor() {
  dotX = mouseX;
  dotY = mouseY;
  
  ringX = lerp(ringX, mouseX, 0.15);
  ringY = lerp(ringY, mouseY, 0.15);
  
  if (cursorDot && cursorRing) {
    cursorDot.style.left = `${dotX}px`;
    cursorDot.style.top = `${dotY}px`;
    cursorRing.style.left = `${ringX}px`;
    cursorRing.style.top = `${ringY}px`;
  }
  
  requestAnimationFrame(animateCursor);
}
requestAnimationFrame(animateCursor);

// Add hover effects
const interactables = document.querySelectorAll('a, button, [role="button"], .agent-card, .sas-card');
interactables.forEach(el => {
  el.addEventListener('mouseenter', () => {
    if (cursorDot && cursorRing) {
      cursorDot.classList.add('hovered');
      cursorRing.classList.add('hovered');
    }
  });
  el.addEventListener('mouseleave', () => {
    if (cursorDot && cursorRing) {
      cursorDot.classList.remove('hovered');
      cursorRing.classList.remove('hovered');
    }
  });
});

// Scroll effect
let scrollTimeout;
window.addEventListener('scroll', () => {
  if (cursorRing) cursorRing.style.opacity = '0.3';
  clearTimeout(scrollTimeout);
  scrollTimeout = setTimeout(() => {
    if (cursorRing) cursorRing.style.opacity = '1';
  }, 100);
});
