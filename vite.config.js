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
});
