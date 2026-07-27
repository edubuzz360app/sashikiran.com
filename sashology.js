import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// ==========================================
// 1. NAVBAR
// ==========================================
const nav = document.getElementById('site-nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 80);
});

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
const canvas = document.getElementById('sash-particle-canvas');
if (canvas) {
  const ctx = canvas.getContext('2d');
  let particles = [];

  class Particle {
    constructor() {
      this.x = Math.random() * window.innerWidth;
      this.y = Math.random() * window.innerHeight;
      this.z = Math.random() * 2 + 0.1;
      this.baseSize = this.z * 1.5;
      this.speedY = -(this.z * 0.3) - 0.1;
      this.speedX = (Math.random() - 0.5) * 0.2;

      const isGold = Math.random() > 0.85;
      this.color = isGold ? '255, 179, 71' : '225, 6, 0';
      this.opacity = Math.random() * 0.5 + 0.2;

      this.angle = Math.random() * Math.PI * 2;
      this.pulseSpeed = Math.random() * 0.05 + 0.01;
    }

    update(scrollVelocity) {
      this.y += this.speedY - (scrollVelocity * this.z * 0.05);
      this.x += this.speedX;
      this.angle += this.pulseSpeed;

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
      ctx.shadowBlur = this.z * 4;
      ctx.shadowColor = `rgba(${this.color}, 1)`;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  function initParticles() {
    particles = [];
    const numParticles = Math.floor((window.innerWidth * window.innerHeight) / 9000);
    for (let i = 0; i < numParticles; i++) {
      particles.push(new Particle());
    }
  }

  let lastScrollY = window.scrollY;

  function animateParticles() {
    const currentScrollY = window.scrollY;
    const scrollVelocity = currentScrollY - lastScrollY;
    lastScrollY = currentScrollY;

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
// 3. GSAP SCROLL ANIMATIONS
// ==========================================

// --- Hero fade out on scroll ---
gsap.to('.sash-hero', {
  opacity: 0,
  y: -60,
  ease: 'none',
  scrollTrigger: {
    trigger: '.sash-hero',
    start: '60% top',
    end: 'bottom top',
    scrub: true,
  },
});

// --- Engine sections reveal ---
gsap.utils.toArray('.reveal-engine').forEach((engine) => {
  gsap.to(engine, {
    opacity: 1,
    y: 0,
    duration: 1.2,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: engine,
      start: 'top 80%',
      toggleActions: 'play none none none',
    },
  });
});

// --- Simulation Flow Nodes - Sequential Reveal ---
const flowNodes = document.querySelectorAll('.flow-node');
const flowConnectors = document.querySelectorAll('.flow-connector');

if (flowNodes.length > 0) {
  const flowTimeline = gsap.timeline({
    scrollTrigger: {
      trigger: '#simulation-flow',
      start: 'top 75%',
      toggleActions: 'play none none none',
    },
  });

  flowNodes.forEach((node, i) => {
    flowTimeline.to(
      node,
      {
        opacity: 1,
        scale: 1,
        duration: 0.5,
        ease: 'back.out(1.5)',
        onComplete: () => node.classList.add('active'),
      },
      i * 0.25
    );

    if (i < flowConnectors.length) {
      flowTimeline.to(
        flowConnectors[i],
        {
          opacity: 1,
          duration: 0.3,
          onComplete: () => flowConnectors[i].classList.add('active'),
        },
        i * 0.25 + 0.2
      );
    }
  });
}

// --- CTA reveal ---
gsap.to('.sash-cta-inner.reveal-engine', {
  opacity: 1,
  y: 0,
  duration: 1.2,
  scrollTrigger: {
    trigger: '.sash-cta',
    start: 'top 70%',
    toggleActions: 'play none none none',
  },
});

// ==========================================
// 4. CUSTOM CURSOR SYSTEM
// ==========================================
const cursorDot = document.querySelector('.cursor-dot');
const cursorRing = document.querySelector('.cursor-ring');

let mouseX = -100,
  mouseY = -100;
let dotX = -100,
  dotY = -100;
let ringX = -100,
  ringY = -100;
let cursorVisible = false;

const lerp = (start, end, amt) => (1 - amt) * start + amt * end;

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

// Hover effects
const interactables = document.querySelectorAll(
  'a, button, [role="button"], .output-card, .export-card'
);
interactables.forEach((el) => {
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
