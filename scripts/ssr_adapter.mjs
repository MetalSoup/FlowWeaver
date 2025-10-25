import http from 'http';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { createInertiaApp } from '@inertiajs/react';

const PORT = Number(process.env.SSR_PORT || process.env.PORT || 13714);

function parseJson(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      if (!body) return resolve(null);
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

// Simple fallback resolver: returns a component that prints the component name
function makeResolver() {
  return async (name) => {
    // If you want to map to actual built assets, implement mapping here.
    const Component = () => React.createElement('div', null, `Rendered (fallback): ${name}`);
    return { default: Component };
  };
}

async function handleRender(page) {
  try {
    // Ensure ziggy.location exists so the app's setup won't blow up
    if (!page) page = { component: 'Welcome', props: {} };
    if (!page.props) page.props = {};
    if (!page.props.ziggy) page.props.ziggy = { location: 'http://127.0.0.1/', url: 'http://127.0.0.1', routes: {}, defaults: {} };

    const result = await createInertiaApp({
      page,
      render: ReactDOMServer.renderToString,
      title: (t) => (t ? `${t} - SSR` : 'SSR'),
      resolve: makeResolver(),
      setup: ({ App, props }) => React.createElement(App, props),
    });

    return result || { head: [], body: '' };
  } catch (err) {
    console.error('SSR adapter error during createInertiaApp:', err && err.stack ? err.stack : err);
    return { head: [], body: '' };
  }
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.url === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json', Server: 'SSR-Adapter' });
      res.end(JSON.stringify({ status: 'OK', timestamp: Date.now() }));
      return;
    }

    if (req.url === '/render' && req.method === 'POST') {
      let payload;
      try {
        payload = await parseJson(req);
      } catch (err) {
        console.error('Failed to parse JSON payload:', err && err.message ? err.message : err);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
        return;
      }

      const page = payload?.page ?? payload;
      try {
        const preview = page ? JSON.stringify(page).slice(0, 2000) : 'null';
        console.log('SSR adapter received page (preview):', preview);
      } catch (e) {
        console.log('SSR adapter received page (unserializable)');
      }

      const result = await handleRender(page);
      console.log('SSR adapter result head length:', (result.head || []).length, 'body length:', (result.body || '').length);

      res.writeHead(200, { 'Content-Type': 'application/json', Server: 'SSR-Adapter' });
      res.end(JSON.stringify({ head: result.head || [], body: result.body || '' }));
      return;
    }

    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  } catch (err) {
    console.error('SSR adapter server error:', err && err.stack ? err.stack : err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: String(err) }));
  }
});

server.on('error', (err) => {
  if (err && err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} already in use. If another SSR server is running, stop it or set SSR_PORT to a different port.`);
    process.exitCode = 1;
  } else {
    console.error('Server error:', err && err.stack ? err.stack : err);
    process.exitCode = 1;
  }
});

function shutdown() {
  console.log('SSR adapter shutting down...');
  server.close(() => {
    console.log('SSR adapter stopped.');
    process.exit(0);
  });
  setTimeout(() => {
    console.warn('Forcing SSR adapter shutdown');
    process.exit(1);
  }, 5000).unref();
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

server.listen(PORT, () => {
  console.log(`SSR adapter listening on http://127.0.0.1:${PORT}`);
});
