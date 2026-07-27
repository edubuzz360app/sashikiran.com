import { initAllModeSwitches, initModeNavLinks, settleModeTransition, navigateToMode } from './mode-switch.js';
import {
  AWARD_CERTIFICATES,
  COURSE_CERTIFICATES,
  loadCertManifest,
  mergeWithManifest,
} from './certificates-data.js';

initAllModeSwitches();
initModeNavLinks();
settleModeTransition();

const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = String(new Date().getFullYear());

let sashBotFlying = false;

function flySashBot(onComplete) {
  if (sashBotFlying) return;
  sashBotFlying = true;

  const sashBot = document.querySelector('.sash-bot');
  const avatar = sashBot?.querySelector('.sash-bot__avatar');
  const popup = document.querySelector('.sash-bot__popup');
  if (!sashBot || !avatar) { onComplete?.(); return; }

  popup?.classList.remove('is-open');

  const rect = avatar.getBoundingClientRect();
  const w = rect.width * 2;

  const flyer = document.createElement('img');
  flyer.src = '/assets/sashbot_flying.png';
  flyer.alt = '';
  flyer.setAttribute('width', '220');
  flyer.setAttribute('height', '280');
  flyer.style.cssText = [
    'position: fixed',
    'z-index: 9999',
    `left: ${rect.left - w / 4}px`,
    `top: ${rect.top - w / 4}px`,
    `width: ${w}px`,
    'height: auto',
    'pointer-events: none',
    'transform-origin: center center',
  ].join(';');
  document.body.appendChild(flyer);

  sashBot.style.display = 'none';
  sashBot.style.pointerEvents = 'none';

  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.width * 0.7;
  const dx = cx;
  const dy = -cy;

  const flip = 'scaleX(-1)';

  const anim = flyer.animate([
    { transform: `${flip} translate(0, 0) rotate(0deg) scale(1)`, offset: 0 },
    { transform: `${flip} translate(${dx * 0.08}px, ${dy * 0.15}px) rotate(15deg) scale(0.9)`, offset: 0.15 },
    { transform: `${flip} translate(${dx * 0.25}px, ${dy * 0.45}px) rotate(12deg) scale(0.72)`, offset: 0.4 },
    { transform: `${flip} translate(${dx * 0.5}px, ${dy * 0.7}px) rotate(5deg) scale(0.5)`, offset: 0.65 },
    { transform: `${flip} translate(${dx}px, ${dy}px) rotate(-5deg) scale(0.15)`, offset: 1 },
  ], {
    duration: 1200,
    easing: 'cubic-bezier(0.33, 1, 0.68, 1)',
    fill: 'forwards',
  });

  anim.onfinish = () => {
    flyer.remove();
    sashBot.remove();
    sashBotFlying = false;
    onComplete?.();
  };
}

// Intercept Visit SashVerse links — play fly animation before navigating
document.querySelectorAll('[data-mode-nav="ai"]').forEach((el) => {
  el.addEventListener('click', (e) => {
    e.stopPropagation();
    e.preventDefault();
    flySashBot(() => navigateToMode('ai'));
  }, true);
});

// Intercept AI Mode switch on human page
const modeSwitch = document.querySelector('#human-mode-switch');
if (modeSwitch) {
  modeSwitch.addEventListener('click', (e) => {
    if (modeSwitch.dataset.mode === 'human') {
      e.stopPropagation();
      e.preventDefault();
      flySashBot(() => {
        modeSwitch.dataset.mode = 'ai';
        modeSwitch.setAttribute('aria-checked', 'false');
        navigateToMode('ai');
      });
    }
  }, true);
}

/**
 * Scale the giant “Sashikiran” name to fill ~94% of hero width
 * without clipping the italic “n”.
 */
function fitGiantName() {
  const el = document.getElementById('human-giant-name');
  const hero = document.querySelector('.human-hero');
  if (!el || !hero) return;

  const styles = getComputedStyle(hero);
  const padL = parseFloat(styles.paddingLeft) || 0;
  const padR = parseFloat(styles.paddingRight) || 0;
  // Extra margin for italic glyph overhang beyond the layout box
  const safety = Math.max(24, hero.clientWidth * 0.03);
  const maxWidth = hero.clientWidth - padL - padR - safety;
  if (maxWidth <= 0) return;

  let lo = 28;
  let hi = Math.min(hero.clientWidth * 0.22, 200);
  let best = lo;

  for (let i = 0; i < 18; i++) {
    const mid = (lo + hi) / 2;
    el.style.fontSize = `${mid}px`;
    if (el.scrollWidth <= maxWidth) {
      best = mid;
      lo = mid;
    } else {
      hi = mid;
    }
  }

  el.style.fontSize = `${best}px`;
}

function scheduleFitGiantName() {
  const run = () => fitGiantName();
  if (document.fonts?.ready) {
    document.fonts.ready.then(run).catch(run);
  } else {
    run();
  }
}

scheduleFitGiantName();
window.addEventListener('resize', () => {
  window.clearTimeout(scheduleFitGiantName._t);
  scheduleFitGiantName._t = window.setTimeout(scheduleFitGiantName, 120);
});

function fillCertTrack(trackId, items) {
  const track = document.getElementById(trackId);
  if (!track) return;

  if (!items.length) {
    track.innerHTML =
      '<li class="cert-carousel__empty">Add certificate images to this gallery to see them here.</li>';
    return;
  }

  track.innerHTML = items
    .map(
      (item) => `
    <li class="cert-carousel__slide">
      <figure>
        <img src="${item.src}" alt="${item.alt}" loading="lazy" decoding="async" />
      </figure>
    </li>`
    )
    .join('');
}

function initAutoScroll(viewport, speed = 0.5) {
  if (!viewport) return;

  let rafId;
  let paused = false;

  function tick() {
    if (!paused) {
      viewport.classList.add('is-auto-scrolling');
      viewport.scrollLeft += speed;
      if (viewport.scrollLeft >= viewport.scrollWidth / 2) {
        viewport.scrollLeft = 0;
      }
    }
    rafId = requestAnimationFrame(tick);
  }

  function pause() {
    paused = true;
    viewport.classList.remove('is-auto-scrolling');
  }

  function resume() {
    paused = false;
  }

  viewport.addEventListener('mouseenter', pause);
  viewport.addEventListener('mouseleave', resume);
  viewport.addEventListener('touchstart', pause, { passive: true });
  viewport.addEventListener('touchend', resume);

  rafId = requestAnimationFrame(tick);
  return { pause, resume };
}

function initCertCarousel(root) {
  const viewport = root.querySelector('.cert-carousel__viewport');
  const prev = root.querySelector('.cert-carousel__btn--prev');
  const next = root.querySelector('.cert-carousel__btn--next');
  if (!viewport || !prev || !next) return;

  const step = () => Math.max(280, Math.round(viewport.clientWidth * 0.78));

  prev.addEventListener('click', () => {
    viewport.scrollBy({ left: -step(), behavior: 'smooth' });
  });
  next.addEventListener('click', () => {
    viewport.scrollBy({ left: step(), behavior: 'smooth' });
  });

  if (root.dataset.certCarousel === 'courses') {
    const track = viewport.querySelector('.cert-carousel__track');
    if (track && track.children.length) {
      [...track.children].forEach((s) => track.appendChild(s.cloneNode(true)));
    }
    initAutoScroll(viewport, 0.4);
  }
}

async function initCertifications() {
  fillCertTrack('cert-awards-track', AWARD_CERTIFICATES);
  fillCertTrack('cert-courses-track', COURSE_CERTIFICATES);

  const manifest = await loadCertManifest();
  if (manifest) {
    const merged = mergeWithManifest(manifest, AWARD_CERTIFICATES, COURSE_CERTIFICATES);
    fillCertTrack('cert-awards-track', merged.awards);
    fillCertTrack('cert-courses-track', merged.courses);
  }

  document.querySelectorAll('[data-cert-carousel]').forEach(initCertCarousel);
}

initCertifications();

function initTestimonialCarousel() {
  const root = document.querySelector('.testimonial-marquee');
  const viewport = root?.querySelector('.testimonial-marquee__viewport');
  const prev = root?.querySelector('.testimonial-marquee__btn--prev');
  const next = root?.querySelector('.testimonial-marquee__btn--next');
  if (!viewport || !prev || !next) return;

  const step = () => {
    const card = viewport.querySelector('li');
    if (card) return card.offsetWidth + 18;
    return Math.max(280, Math.round(viewport.clientWidth * 0.78));
  };

  const scroll = (dir) => viewport.scrollBy({ left: dir * step(), behavior: 'smooth' });

  prev.addEventListener('click', () => scroll(-1));
  next.addEventListener('click', () => scroll(1));

  const trigger = root?.querySelector('.testimonial-marquee__nav-trigger');
  const popover = root?.querySelector('.testimonial-marquee__nav-popover');
  if (trigger && popover) {
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      popover.classList.toggle('is-open');
    });
    document.addEventListener('click', (e) => {
      if (!popover.contains(e.target) && e.target !== trigger) {
        popover.classList.remove('is-open');
      }
    });
    popover.querySelector('.testimonial-marquee__popover-btn--prev')?.addEventListener('click', () => {
      scroll(-1);
      popover.classList.remove('is-open');
    });
    popover.querySelector('.testimonial-marquee__popover-btn--next')?.addEventListener('click', () => {
      scroll(1);
      popover.classList.remove('is-open');
    });
  }

  initAutoScroll(viewport, 0.5);
}

initTestimonialCarousel();

// Navbar scroll + mobile menu
const nav = document.getElementById('human-nav');
const menuBtn = document.querySelector('.human-nav__menu');
const navLinks = document.querySelector('.human-nav__links');

window.addEventListener(
  'scroll',
  () => {
    nav?.classList.toggle('is-scrolled', window.scrollY > 40);
  },
  { passive: true }
);

if (menuBtn && navLinks) {
  menuBtn.addEventListener('click', () => {
    menuBtn.classList.toggle('is-open');
    navLinks.classList.toggle('is-open');
  });

  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      menuBtn.classList.remove('is-open');
      navLinks.classList.remove('is-open');
    });
  });
}

// SashBot mobile popup
const sashBotAvatar = document.querySelector('.sash-bot__avatar-link');
const sashBotPopup = document.querySelector('.sash-bot__popup');
const sashBotClose = document.querySelector('.sash-bot__popup-close');

if (sashBotAvatar && sashBotPopup) {
  sashBotAvatar.addEventListener('click', (e) => {
    if (window.innerWidth <= 480) {
      e.preventDefault();
      sashBotPopup.classList.add('is-open');
    }
  });

  const closePopup = () => sashBotPopup.classList.remove('is-open');

  sashBotClose?.addEventListener('click', closePopup);

  sashBotPopup.addEventListener('click', (e) => {
    if (e.target === sashBotPopup) closePopup();
  });

  sashBotPopup.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closePopup);
  });
}

// Section reveal on scroll
const reveals = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );
  reveals.forEach((el) => io.observe(el));
} else {
  reveals.forEach((el) => el.classList.add('is-visible'));
}

// Voice of Sash carousel
const voiceScroll = document.querySelector('.voice-scroll');
const voicePrev = document.querySelector('.voice-btn--prev');
const voiceNext = document.querySelector('.voice-btn--next');
if (voiceScroll && voicePrev && voiceNext) {
  const scrollStep = () => {
    const card = voiceScroll.querySelector('.voice-card');
    return card ? card.offsetWidth + 16 : 300;
  };
  voicePrev.addEventListener('click', () => {
    voiceScroll.scrollBy({ left: -scrollStep(), behavior: 'smooth' });
  });
  voiceNext.addEventListener('click', () => {
    voiceScroll.scrollBy({ left: scrollStep(), behavior: 'smooth' });
  });
}
