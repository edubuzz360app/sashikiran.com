/**
 * Shared AI ↔ Human mode switch.
 * Navigates between /sashverse (AI) and / (Human) with a short crossfade.
 */

const ROUTES = {
  ai: '/sashverse/',
  human: '/',
};

function detectMode() {
  if (document.body?.dataset?.siteMode === 'ai' || document.body?.dataset?.siteMode === 'human') {
    return document.body.dataset.siteMode;
  }
  const path = location.pathname.replace(/\/+$/, '') || '/';
  if (path === '/sashverse' || path.startsWith('/sashverse/') || path.includes('sashology') || path.includes('platform')) {
    return 'ai';
  }
  return 'human';
}

function ensureOverlay(targetMode) {
  let overlay = document.querySelector('.mode-transition');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'mode-transition';
    overlay.setAttribute('aria-hidden', 'true');
    document.body.appendChild(overlay);
  }
  overlay.classList.toggle('mode-transition--to-human', targetMode === 'human');
  return overlay;
}

function navigateToMode(mode) {
  const href = ROUTES[mode];
  if (!href) return;

  const current = detectMode();
  if (current === mode) return;

  try {
    sessionStorage.setItem('sashi-mode-transition', mode);
  } catch {
    /* ignore */
  }

  const overlay = ensureOverlay(mode);
  void overlay.offsetWidth;
  overlay.classList.add('is-active');

  window.setTimeout(() => {
    window.location.href = href;
  }, 320);
}

export { navigateToMode, ROUTES };

/**
 * @param {HTMLElement} root - button.mode-switch
 */
export function initModeSwitch(root) {
  if (!root) return;

  const current = root.dataset.mode || detectMode();

  root.dataset.mode = current;
  root.setAttribute('role', 'switch');
  root.setAttribute('aria-checked', current === 'human' ? 'true' : 'false');
  root.setAttribute(
    'aria-label',
    current === 'ai' ? 'AI Mode active. Switch to Human Mode' : 'Human Mode active. Switch to AI Mode'
  );

  const flip = () => {
    const next = root.dataset.mode === 'ai' ? 'human' : 'ai';
    root.dataset.mode = next;
    root.setAttribute('aria-checked', next === 'human' ? 'true' : 'false');
    navigateToMode(next);
  };

  root.addEventListener('click', (e) => {
    e.preventDefault();
    flip();
  });

  root.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      flip();
    }
  });
}

export function initAllModeSwitches(selector = '.mode-switch') {
  document.querySelectorAll(selector).forEach((el) => initModeSwitch(el));
}

/** Wire links like data-mode-nav="human" to use the same crossfade transition */
export function initModeNavLinks(selector = '[data-mode-nav]') {
  document.querySelectorAll(selector).forEach((el) => {
    el.addEventListener('click', (e) => {
      const mode = el.getAttribute('data-mode-nav');
      if (mode !== 'ai' && mode !== 'human') return;
      e.preventDefault();
      navigateToMode(mode);
    });
  });
}

/** Fade out transition overlay if we arrived mid-transition */
export function settleModeTransition() {
  let pending = null;
  try {
    pending = sessionStorage.getItem('sashi-mode-transition');
    sessionStorage.removeItem('sashi-mode-transition');
  } catch {
    /* ignore */
  }

  if (pending) {
    const overlay = ensureOverlay(pending);
    overlay.classList.add('is-active');
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        overlay.classList.remove('is-active');
      });
    });
  } else {
    const overlay = document.querySelector('.mode-transition');
    if (overlay) overlay.classList.remove('is-active');
  }

  document.documentElement.classList.add('mode-ready');
}
