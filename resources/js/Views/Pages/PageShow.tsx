// Use a public layout and render craft.js-built pages in read-only mode
import React, { useEffect } from 'react';
import PageLayout from '@/Layouts/PageLayout';
import { Head } from '@inertiajs/react';
import ReadOnlyRenderer from './ReadOnlyCraft/ReadOnlyRenderer';

export default function PageShow({ auth, page = null }: { auth: any; page?: any }) {
  const initialPageContent = page?.data?.content ?? page?.content ?? '';
  // support both legacy `custom_css` and structured `options` (header_css/footer_css)
  const initialPageCustomCss = page?.data?.custom_css ?? page?.custom_css ?? page?.data?.customCss ?? page?.customCss ?? '';
  const headerCss = page?.data?.options?.header_css ?? page?.data?.header_css ?? page?.options?.header_css ?? page?.header_css ?? '';
  const footerCss = page?.data?.options?.footer_css ?? page?.data?.footer_css ?? page?.options?.footer_css ?? page?.footer_css ?? '';
  const headerJs = page?.data?.options?.header_js ?? page?.data?.header_js ?? page?.options?.header_js ?? page?.header_js ?? '';
  const footerJs = page?.data?.options?.footer_js ?? page?.data?.footer_js ?? page?.options?.footer_js ?? page?.footer_js ?? '';

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const makeImportant = (raw: string) => {
      try {
        return raw.replace(/([^\{]+)\{([^}]+)}/g, (m, selector, body) => {
          const decls = body.split(';').map(d => d.trim()).filter(Boolean);
          const newDecls = decls.map(d => {
            if (!d.includes(':') || d.startsWith('/*') || /!important\s*$/.test(d)) return d + ';';
            return d + ' !important;';
          }).join(' ');
          return `${selector}{${newDecls}}`;
        });
      } catch (e) {
        return raw;
      }
    };

    const headerCssId = 'page-show-header-css';
    const footerCssId = 'page-show-footer-css';
    const headerJsId = 'page-show-header-js';
    const footerJsId = 'page-show-footer-js';

    // header/custom css -> head
    const applyStyle = (id: string, css: string | undefined, toHead = true) => {
      const existing = document.getElementById(id) as HTMLStyleElement | null;
      if (!css) {
        if (existing) try { existing.remove(); } catch (e) {}
        return;
      }
      if (existing) {
        existing.textContent = makeImportant(css);
        return;
      }
      const el = document.createElement('style');
      el.id = id;
      el.textContent = makeImportant(css);
      try { if (toHead) document.head.appendChild(el); else document.body.appendChild(el); } catch (e) {}
    };

    const applyScript = (id: string, js: string | undefined, toHead = true) => {
      const existing = document.getElementById(id) as HTMLScriptElement | null;
      if (!js) {
        if (existing) try { existing.remove(); } catch (e) {}
        return;
      }
      if (existing) try { existing.remove(); } catch (e) {}
      const el = document.createElement('script');
      el.id = id;
      el.type = 'text/javascript';
      try { el.appendChild(document.createTextNode(js)); } catch (e) { el.textContent = js; }
      try { if (toHead) document.head.appendChild(el); else document.body.appendChild(el); } catch (e) {}
    };

    // Apply in order: legacy custom_css (head), then headerCss, footerCss, headerJs, footerJs
    applyStyle('page-show-custom-css', initialPageCustomCss, true);
    applyStyle(headerCssId, headerCss, true);
    applyStyle(footerCssId, footerCss, false);
    applyScript(headerJsId, headerJs, true);
    applyScript(footerJsId, footerJs, false);

    return () => {
      try { document.getElementById('page-show-custom-css')?.remove(); } catch (e) {}
      try { document.getElementById(headerCssId)?.remove(); } catch (e) {}
      try { document.getElementById(footerCssId)?.remove(); } catch (e) {}
      try { document.getElementById(headerJsId)?.remove(); } catch (e) {}
      try { document.getElementById(footerJsId)?.remove(); } catch (e) {}
    };
  }, [initialPageCustomCss, headerCss, footerCss, headerJs, footerJs]);

  return (
    <PageLayout>
      <Head title={page?.name ?? 'Page'} />

      <>
        <ReadOnlyRenderer serialized={initialPageContent} />
      </>
    </PageLayout>
  );
}
