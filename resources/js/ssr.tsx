import ReactDOMServer from 'react-dom/server';
import { createInertiaApp } from '@inertiajs/react';
import createServer from '@inertiajs/react/server';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { route } from '../../vendor/tightenco/ziggy';
import { RouteName } from 'ziggy-js';

const appName = import.meta.env.VITE_APP_NAME || 'Kiudai';

createServer(async (page) => {
    // Diagnostic: log the incoming page (trim long output)
    try {
        const preview = typeof page === 'string' ? page : JSON.stringify(page);
        console.log('SSR: incoming page payload:', preview && preview.length > 2000 ? preview.slice(0, 2000) + '... (truncated)' : preview);
    } catch (err) {
        console.log('SSR: incoming page payload (non-serializable)');
    }

    // Important: await and return the value from createInertiaApp so the
    // server handler receives a serializable value (head/body).
    const result = await createInertiaApp({
        page,
        render: ReactDOMServer.renderToString,
        title: (title) => `${title} - ${appName}`,
        resolve: (name) => resolvePageComponent(`./Pages/${name}.tsx`, import.meta.glob('./Pages/**/*.tsx')),
        setup: ({ App, props }) => {
            // Assign a safe any-typed wrapper to global.route for SSR so Ziggy typings
            // don't cause TypeScript errors here.
            (global as any).route = (name: any, params?: any, absolute?: any) => {
                return (route as any)(name, params, absolute, {
                    ...(page.props?.ziggy as any),
                    location: new URL((page.props?.ziggy as any)?.location),
                });
            };

            return <App {...props} />;
        },
    });

    try {
        const preview = typeof result === 'string' ? result : JSON.stringify(result);
        console.log('SSR: createInertiaApp result:', preview && preview.length > 2000 ? preview.slice(0, 2000) + '... (truncated)' : preview);
    } catch (err) {
        console.log('SSR: createInertiaApp result (non-serializable)');
    }

    return result;
});
