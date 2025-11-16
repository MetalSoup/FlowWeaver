// Use a public layout and render craft.js-built pages in read-only mode
import React, { useEffect } from 'react';
import PageLayout from '@/Layouts/PageLayout';
import { Head } from '@inertiajs/react';
import ReadOnlyRenderer from './ReadOnlyCraft/ReadOnlyRenderer';

export default function PageShow({ auth, page = null }: { auth: any; page?: any }) {
  const initialPageContent = page?.data?.content ?? page?.content ?? '';
  const initialPageCustomCss = page?.data?.custom_css ?? page?.custom_css ?? page?.data?.customCss ?? page?.customCss ?? '';

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const id = 'page-show-custom-css';
    let styleEl = document.getElementById(id) as HTMLStyleElement | null;
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = id;
      document.head.appendChild(styleEl);
    }
    try {
      // make rules important so page CSS overrides other app styles
      styleEl.textContent = (initialPageCustomCss || '').replace(/([^{]+)\{([^}]+)}/g, (m, selector, body) => {
        const decls = body.split(';').map(d => d.trim()).filter(Boolean);
        const newDecls = decls.map(d => {
          if (!d.includes(':') || d.startsWith('/*') || /!important\s*$/.test(d)) return d + ';';
          return d + ' !important;';
        }).join(' ');
        return `${selector}{${newDecls}}`;
      });
    } catch (e) {
      styleEl.textContent = initialPageCustomCss || '';
    }

    return () => { try { styleEl?.remove(); } catch (e) {} };
  }, [initialPageCustomCss]);

  return (
    <PageLayout>
      <Head title={page?.name ?? 'Page'} />

      <>

        {initialPageCustomCss ? (
          <style>{initialPageCustomCss}</style>
        ) : null}

        {/* Render the read-only renderer */}

          <ReadOnlyRenderer serialized={initialPageContent} />


      </>
    </PageLayout>
  );
}
