import { defineConfig } from 'vite';
import { resolve } from 'path';

/** Map folder-based routes (with or without trailing slash) to their index.html in dev + preview */
function folderRewrite(route, indexPath) {
  const rewrite = (req, _res, next) => {
    const url = req.url || '';
    const path = url.split('?')[0];
    const qs = url.includes('?') ? url.slice(url.indexOf('?')) : '';

    if (path === `/${route}` || path === `/${route}/`) {
      req.url = `/${indexPath}${qs}`;
    }
    next();
  };

  return {
    name: `${route}-dev-rewrite`,
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
  plugins: [folderRewrite('sashverse', 'sashverse/index.html'), folderRewrite('wedding', 'wedding/index.html')],
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
        wedding: resolve(__dirname, 'wedding/index.html'),
      },
    },
  },
});
