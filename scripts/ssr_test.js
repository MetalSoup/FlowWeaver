(async () => {
  try {
    const url = 'http://127.0.0.1:13714/render';
    // Include a minimal `ziggy` prop - the SSR bundle expects page.props.ziggy.location
    const payload = {
      component: 'Welcome',
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
    console.log('POST', url, 'payload:', JSON.stringify(payload));

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      // keep redirects default
    });

    const text = await res.text();
    console.log('Status:', res.status);
    console.log('Headers:');
    for (const [k, v] of res.headers.entries()) console.log(k + ':', v);
    console.log('\nBody:\n', text);
  } catch (err) {
    console.error('Request failed:', err && err.stack ? err.stack : err);
    process.exitCode = 1;
  }
})();
