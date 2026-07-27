import { defineConfig } from 'vite';
import { resolve } from 'path';

/** Map /sashverse (with or without slash) to the AI Mode folder entry in dev + preview */
function sashverseDevRewrite() {
  const rewrite = (req, _res, next) => {
    const url = req.url || '';
    const path = url.split('?')[0];
    const qs = url.includes('?') ? url.slice(url.indexOf('?')) : '';

    if (path === '/sashverse' || path === '/sashverse/') {
      req.url = `/sashverse/index.html${qs}`;
    }
    next();
  };

  return {
    name: 'sashverse-dev-rewrite',
    configureServer(server) {
      server.middlewares.use(rewrite);
    },
    configurePreviewServer(server) {
      server.middlewares.use(rewrite);
    },
  };
}

export default defineConfig({
  base: '/',
  appType: 'mpa',
  plugins: [sashverseDevRewrite()],
  css: {
    postcss: {},
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        sashverse: resolve(__dirname, 'sashverse/index.html'),
        sashverseRedirect: resolve(__dirname, 'sashverse.html'),
        humanRedirect: resolve(__dirname, 'human.html'),
        sashology: resolve(__dirname, 'sashology.html'),
        platform: resolve(__dirname, 'platform.html'),
        blog: resolve(__dirname, 'blog.html'),
        'blog/figma-2026-updates': resolve(__dirname, 'blog/figma-2026-updates.html'),
      },
    },
  },
});
