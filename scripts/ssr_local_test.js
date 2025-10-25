const { createInertiaApp } = require('@inertiajs/react');
const React = require('react');
const ReactDOMServer = require('react-dom/server');

(async () => {
  try {
    const page = {
      component: 'Test',
      props: {
        ziggy: {
          location: 'http://127.0.0.1/',
          url: 'http://127.0.0.1',
          routes: {},
          defaults: {},
        },
      },
      url: '/',
      version: null,
    };

    const result = await createInertiaApp({
      page,
      render: ReactDOMServer.renderToString,
      title: (title) => `Test - ${title}`,
      resolve: (name) => Promise.resolve({ default: (props) => React.createElement('div', null, 'SSR OK') }),
      setup: ({ App, props }) => React.createElement(App, props),
    });

    console.log('createInertiaApp result:', JSON.stringify(result, null, 2));
  } catch (err) {
    console.error('Error running createInertiaApp locally:', err);
    process.exitCode = 1;
  }
})();

