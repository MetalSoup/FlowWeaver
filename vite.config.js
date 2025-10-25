import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';

export default defineConfig({
    plugins: [
        // Ensure svgr runs BEFORE any plugins that may treat SVGs as assets
        // (like laravel-vite-plugin). This makes `?component` imports return
        // a React component instead of a URL string.
        svgr({ exportAsDefault: true }),
        laravel({
            input: 'resources/js/app.tsx',
            ssr: 'resources/js/ssr.tsx',
            refresh: true,
        }),
        // React plugin should come after svgr so JSX transforms still work
        react(),
    ],
    // Externalize Next.js server-only modules so Vite doesn't attempt to
    // resolve them during the client or SSR build. This keeps Rollup from
    // failing on imports like `next/document` that are only available in
    // a Next.js runtime.
    build: {
        rollupOptions: {
            external: ['next/document'],
        },
    },
    ssr: {
        // Prevent Vite from bundling the next/document import during SSR build
        external: ['next/document'],
    },
});
