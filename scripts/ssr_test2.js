(async () => {
  const url = 'http://127.0.0.1:13714/render';
  const payloads = [
    { // direct page object (component, props, url, version)
      component: 'Welcome',
      props: { ziggy: { location: 'http://127.0.0.1/', url: 'http://127.0.0.1', routes: {}, defaults: {} } },
      url: '/',
      version: null,
    },
    { // wrapped under `page`
      page: {
        component: 'Welcome',
        props: { ziggy: { location: 'http://127.0.0.1/', url: 'http://127.0.0.1', routes: {}, defaults: {} } },
        url: '/',
        version: null,
      }
    }
  ];

  for (const p of payloads) {
    try {
      console.log('\n--- Posting payload:');
      console.log(JSON.stringify(p));
      const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(p) });
      console.log('Status:', res.status);
      const text = await res.text();
      console.log('Body length:', text ? text.length : '(empty)');
      console.log('Body (start):', (text || '').slice(0, 1000));
    } catch (err) {
      console.error('Request failed:', err && err.stack ? err.stack : err);
    }
  }
})();

